# Copyright 2019 The TensorFlow Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# ==============================================================================

"""The TensorBoard plugin for performance profiling."""

from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import os
import threading

import six
import tensorflow as tf
from werkzeug import wrappers

from tensorboard.backend import http_util
from tensorboard.backend.event_processing import plugin_asset_util
from tensorboard.plugins import base_plugin
from tensorboard.util import tb_logging

logger = tb_logging.get_logger()

# The prefix of routes provided by this plugin.
PLUGIN_NAME = 'dynamic_profile'

INDEX_JS_ROUTE = '/index.js'
INDEX_HTML_ROUTE = '/index.html'
BUNDLE_JS_ROUTE = '/bundle.js'
STYLES_CSS_ROUTE = '/styles.css'
TOOLS_ROUTE = '/tools'

TOOLS = {
    'trace_viewer': 'trace',
    'trace_viewer@': 'tracetable',  #streaming traceviewer
    'op_profile': 'op_profile.json',
    'input_pipeline_analyzer': 'input_pipeline.json',
    'overview_page': 'overview_page.json',
    'memory_viewer': 'memory_viewer.json',
    'pod_viewer': 'pod_viewer.json',
    'google_chart_demo': 'google_chart_demo.json',
}

class DynamicProfile(base_plugin.TBPlugin):
  plugin_name = PLUGIN_NAME

  def __init__(self, context):
    """Constructs a profiler plugin for TensorBoard.
    This plugin adds handlers for performance-related frontends.
    Args:
      context: A base_plugin.TBContext instance.
    """
    self.logdir = context.logdir
    self.multiplexer = context.multiplexer
    self.master_tpu_unsecure_channel = context.flags.master_tpu_unsecure_channel

    # Whether the plugin is active. This is an expensive computation, so we
    # compute this asynchronously and cache positive results indefinitely.
    self._is_active = False
    # Lock to ensure at most one thread computes _is_active at a time.
    self._is_active_lock = threading.Lock()

  def is_active(self):
    """Whether this plugin is active and has any profile data to show.
    Detecting profile data is expensive, so this process runs asynchronously
    and the value reported by this method is the cached value and may be stale.
    Returns:
      Whether any run has profile data.
    """
    # If we are already active, we remain active and don't recompute this.
    # Otherwise, try to acquire the lock without blocking; if we get it and
    # we're still not active, launch a thread to check if we're active and
    # release the lock once the computation is finished. Either way, this
    # thread returns the current cached value to avoid blocking.
    if not self._is_active and self._is_active_lock.acquire(False):
      if self._is_active:
        self._is_active_lock.release()
      else:
        def compute_is_active():
          self._is_active = any(self.generate_run_to_tools())
          self._is_active_lock.release()
        new_thread = threading.Thread(
            target=compute_is_active,
            name='DynamicProfilePluginIsActiveThread')
        new_thread.start()
    return self._is_active

  def get_plugin_apps(self):
    return {
      INDEX_JS_ROUTE: self.static_file_route,
      INDEX_HTML_ROUTE: self.static_file_route,
      BUNDLE_JS_ROUTE: self.static_file_route,
      STYLES_CSS_ROUTE: self.static_file_route,
      TOOLS_ROUTE: self.tools_route,
    }

  def frontend_metadata(self):
    return base_plugin.FrontendMetadata(es_module_path='/index.js')

  @wrappers.Request.application
  def static_file_route(self, request):
    filename = os.path.basename(request.path)
    extention = os.path.splitext(filename)[1]
    if extention == '.html':
      mimetype = 'text/html'
    elif extention == '.css':
      mimetype = 'text/css'
    elif extention == '.js':
      mimetype = 'application/javascript'
    else:
      mimetype = 'application/octet-stream'
    filepath = os.path.join(os.path.dirname(__file__), 'static', filename)
    try:
      with open(filepath) as infile:
        contents = infile.read()
    except IOError:
      return http_util.Respond(request, '404 Not Found', 'text/plain', code=404)
    return http_util.Respond(request, contents, mimetype)

  @wrappers.Request.application
  def tools_route(self, request):
    run_to_tools = dict(self.generate_run_to_tools())
    return http_util.Respond(request, run_to_tools, 'application/json')

  def start_grpc_stub_if_necessary(self):
    # We will enable streaming trace viewer on two conditions:
    # 1. user specify the flags master_tpu_unsecure_channel to the ip address of
    #    as "master" TPU. grpc will be used to fetch streaming trace data.
    # 2. the logdir is on google cloud storage.
    if self.master_tpu_unsecure_channel and self.logdir.startswith('gs://'):
      if self.stub is None:
        import grpc
        from tensorflow.python.tpu.profiler import profiler_analysis_pb2_grpc # pylint: disable=line-too-long
        # Workaround the grpc's 4MB message limitation.
        gigabyte = 1024 * 1024 * 1024
        options = [('grpc.max_message_length', gigabyte),
                   ('grpc.max_send_message_length', gigabyte),
                   ('grpc.max_receive_message_length', gigabyte)]
        tpu_profiler_port = self.master_tpu_unsecure_channel + ':8466'
        channel = grpc.insecure_channel(tpu_profiler_port, options)
        self.stub = profiler_analysis_pb2_grpc.ProfileAnalysisStub(channel)

  def generate_run_to_tools(self):
    """Generator for pairs of "run name" and a list of tools for that run.
    The "run name" here is a "frontend run name" - see _run_dir() for the
    definition of a "frontend run name" and how it maps to a directory of
    profile data for a specific profile "run". The profile plugin concept of
    "run" is different from the normal TensorBoard run; each run in this case
    represents a single instance of profile data collection, more similar to a
    "step" of data in typical TensorBoard semantics. These runs reside in
    subdirectories of the plugins/profile directory within any regular
    TensorBoard run directory (defined as a subdirectory of the logdir that
    contains at least one tfevents file) or within the logdir root directory
    itself (even if it contains no tfevents file and would thus not be
    considered a normal TensorBoard run, for backwards compatibility).
    Within those "profile run directories", there are files in the directory
    that correspond to different profiling tools. The file that contains profile
    for a specific tool "x" will have a suffix name TOOLS["x"].
    Example:
      logs/
        plugins/
          profile/
            run1/
              hostA.trace
        train/
          events.out.tfevents.foo
          plugins/
            profile/
              run1/
                hostA.trace
                hostB.trace
              run2/
                hostA.trace
        validation/
          events.out.tfevents.foo
          plugins/
            profile/
              run1/
                hostA.trace
    Yields:
      A sequence of tuples mapping "frontend run names" to lists of tool names
      available for those runs. For the above example, this would be:
          ("run1", ["trace_viewer"])
          ("train/run1", ["trace_viewer"])
          ("train/run2", ["trace_viewer"])
          ("validation/run1", ["trace_viewer"])
    """
    self.start_grpc_stub_if_necessary()

    plugin_assets = self.multiplexer.PluginAssets(PLUGIN_NAME)
    tb_run_names_to_dirs = self.multiplexer.RunPaths()

    # Ensure that we also check the root logdir, even if it isn't a recognized
    # TensorBoard run (i.e. has no tfevents file directly under it), to remain
    # backwards compatible with previously profile plugin behavior. Note that we
    # check if logdir is a directory to handle case where it's actually a
    # multipart directory spec, which this plugin does not support.
    if '.' not in plugin_assets and tf.io.gfile.isdir(self.logdir):
      tb_run_names_to_dirs['.'] = self.logdir
      plugin_assets['.'] = plugin_asset_util.ListAssets(
          self.logdir, PLUGIN_NAME)

    for tb_run_name, profile_runs in six.iteritems(plugin_assets):
      tb_run_dir = tb_run_names_to_dirs[tb_run_name]
      tb_plugin_dir = plugin_asset_util.PluginDirectory(
          tb_run_dir, PLUGIN_NAME)
      for profile_run in profile_runs:
        # Remove trailing slash; some filesystem implementations emit this.
        profile_run = profile_run.rstrip('/')
        if tb_run_name == '.':
          frontend_run = profile_run
        else:
          frontend_run = '/'.join([tb_run_name, profile_run])
        profile_run_dir = os.path.join(tb_plugin_dir, profile_run)
        if tf.io.gfile.isdir(profile_run_dir):
          yield frontend_run, self._get_active_tools(profile_run_dir)

  def _get_active_tools(self, profile_run_dir):
    tools = []
    for tool in TOOLS:
      tool_pattern = '*' + TOOLS[tool]
      path = os.path.join(profile_run_dir, tool_pattern)
      try:
        files = tf.io.gfile.glob(path)
        if len(files) >= 1:
          tools.append(tool)
      except tf.errors.OpError as e:
        logger.warn("Cannot read asset directory: %s, OpError %s",
                    profile_run_dir, e)
    if 'trace_viewer@' in tools:
      # streaming trace viewer always override normal trace viewer.
      # the trailing '@' is to inform tf-profile-dashboard.html and
      # tf-trace-viewer.html that stream trace viewer should be used.
      removed_tool = 'trace_viewer@' if self.stub is None else 'trace_viewer'
      if removed_tool in tools:
        tools.remove(removed_tool)
    tools.sort()
    op = 'overview_page'
    if op in tools:
      # keep overview page at the top of the list
      tools.remove(op)
      tools.insert(0, op)
    return tools
