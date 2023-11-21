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

import gzip
import json
import logging
import os
import re
import threading

import six
import tensorflow.compat.v2 as tf
from werkzeug import wrappers

from tensorboard.backend.event_processing import plugin_asset_util
from tensorboard.context import RequestContext
from tensorboard.plugins import base_plugin
from tensorflow.python.profiler import profiler_client  # pylint: disable=g-direct-tensorflow-import
from tensorflow.python.profiler import profiler_v2 as profiler  # pylint: disable=g-direct-tensorflow-import
from tensorboard_plugin_profile.convert import raw_to_tool_data as convert

tf.enable_v2_behavior()

logger = logging.getLogger('tensorboard')

# The prefix of routes provided by this plugin.
PLUGIN_NAME = 'profile'

INDEX_JS_ROUTE = '/index.js'
INDEX_HTML_ROUTE = '/index.html'
BUNDLE_JS_ROUTE = '/bundle.js'
STYLES_CSS_ROUTE = '/styles.css'
MATERIALICONS_WOFF2_ROUTE = '/materialicons.woff2'
TRACE_VIEWER_INDEX_HTML_ROUTE = '/trace_viewer_index.html'
TRACE_VIEWER_INDEX_JS_ROUTE = '/trace_viewer_index.js'
ZONE_JS_ROUTE = '/zone.js'
DATA_ROUTE = '/data'
RUNS_ROUTE = '/runs'
RUN_TOOLS_ROUTE = '/run_tools'
HOSTS_ROUTE = '/hosts'
CAPTURE_ROUTE = '/capture_profile'

# Suffixes of "^, #, @" symbols represent different input data formats for the
# same tool.
# 1) '^': data generate from XPlane.
# 2) '#': data is in gzip format.
# 3) '@': data generate from proto, or tracetable for streaming trace viewer.
# 4) no suffix: data is in json format, ready to feed to frontend.
TOOLS = {
    'trace_viewer': 'trace',
    'trace_viewer#': 'trace.json.gz',
    'op_profile': 'op_profile.json',
    'input_pipeline_analyzer': 'input_pipeline.json',
    'input_pipeline_analyzer@': 'input_pipeline.pb',
    'overview_page': 'overview_page.json',
    'overview_page@': 'overview_page.pb',
    'memory_viewer': 'memory_viewer.json',
    'pod_viewer': 'pod_viewer.json',
    'tensorflow_stats': 'tensorflow_stats.pb',
    'kernel_stats': 'kernel_stats.pb',
    'memory_profile#': 'memory_profile.json.gz',
    'xplane': 'xplane.pb',
    'hlo_proto': 'hlo_proto.pb',
    'tf_data_bottleneck_analysis': 'tf_data_bottleneck_analysis.json',
}

ALL_HOSTS = 'ALL_HOSTS'

_EXTENSION_TO_TOOL = {extension: tool for tool, extension in TOOLS.items()}

_FILENAME_RE = re.compile(r'(?:(.*)\.)?(' +
                          '|'.join(TOOLS.values()).replace('.', r'\.') + r')')

# Tools that consume raw data.
RAW_DATA_TOOLS = frozenset(
    tool for tool, extension in TOOLS.items()
    if extension.endswith('.json') or extension.endswith('.json.gz'))

# Tools that can be generated from xplane end with ^.
XPLANE_TOOLS = [
    'trace_viewer^',  # non-streaming before TF 2.13
    'trace_viewer@^',  # streaming since TF 2.14
    'overview_page^',
    'input_pipeline_analyzer^',
    'tensorflow_stats^',
    'kernel_stats^',
    'memory_profile^',
    'pod_viewer^',
    'tf_data_bottleneck_analysis^',
    'op_profile^',
]

# XPlane generated tools that support all host mode.
XPLANE_TOOLS_ALL_HOSTS_SUPPORTED = frozenset([
    'input_pipeline_analyzer^',
    'tensorflow_stats^',
    'kernel_stats^',
    'overview_page^',
    'pod_viewer^',
    'tf_data_bottleneck_analysis^',
    'dcn_collective_stats^',
])

# XPlane generated tools that only support all host mode.
XPLANE_TOOLS_ALL_HOSTS_ONLY = frozenset(
    ['overview_page^', 'pod_viewer^', 'tf_data_bottleneck_analysis^'])


def use_xplane(tool):
  return tool[-1] == '^'


# HLO generated tools.
HLO_TOOLS = frozenset(['graph_viewer^', 'memory_viewer^'])


def use_hlo(tool):
  return tool in HLO_TOOLS


def make_filename(host, tool):
  """Returns the name of the file containing data for the given host and tool.

  Args:
    host: Name of the host that produced the profile data, e.g., 'localhost'.
    tool: Name of the tool, e.g., 'trace_viewer'.

  Returns:
    The host name concatenated with the tool-specific extension, e.g.,
    'localhost.trace'.
  """
  filename = str(host) + '.' if host else ''
  if use_hlo(tool):
    tool = 'hlo_proto'
  elif use_xplane(tool):
    tool = 'xplane'
  return filename + TOOLS[tool]


def _parse_filename(filename):
  """Returns the host and tool encoded in a filename in the run directory.

  Args:
    filename: Name of a file in the run directory. The name might encode a host
      and tool, e.g., 'host.tracetable', 'host.domain.op_profile.json', or just
      a tool, e.g., 'trace', 'tensorflow_stats.pb'.

  Returns:
    A tuple (host, tool) containing the names of the host and tool, e.g.,
    ('localhost', 'trace_viewer'). Either of the tuple's components can be None.
  """
  m = _FILENAME_RE.fullmatch(filename)
  if m is None:
    return filename, None
  return m.group(1), _EXTENSION_TO_TOOL[m.group(2)]


def _get_hosts(filenames):
  """Parses a list of filenames and returns the set of hosts.

  Args:
    filenames: A list of filenames (just basenames, no directory).

  Returns:
    A set of host names encoded in the filenames.
  """
  hosts = set()
  for name in filenames:
    host, _ = _parse_filename(name)
    if host:
      hosts.add(host)
  return hosts


def _get_tools(filenames, profile_run_dir):
  """Parses a list of filenames and returns the set of tools.

  If xplane is present in the repository, add tools that can be generated by
  xplane if we don't have a file for the tool.

  Args:
    filenames: A list of filenames (just basenames, no directory).
    profile_run_dir: The run directory of the profile.

  Returns:
    A set of tool names encoded in the filenames.
  """
  tools = set()
  found = set()
  xplane_filenames = []
  for name in filenames:
    _, tool = _parse_filename(name)
    if tool == 'xplane':
      xplane_filenames.append(os.path.join(profile_run_dir, name))
      continue
    elif tool == 'hlo_proto':
      continue
    elif tool:
      tools.add(tool)
      if tool[-1] in ('@', '#'):
        found.add(tool[:-1])
      else:
        found.add(tool)
  # profile_run_dir might be empty, like in cloud AI use case.
  if not profile_run_dir:
    if xplane_filenames:
      for item in XPLANE_TOOLS:
        if item[:-1] not in found:
          tools.add(item)
  else:
    try:
      if xplane_filenames:
        return set(convert.xspace_to_tool_names(xplane_filenames))
    except AttributeError:
      logger.warning('XPlane converters are available after Tensorflow 2.4')
  return tools


def get_worker_list(cluster_resolver):
  """Parses TPU workers list from the cluster resolver."""
  cluster_spec = cluster_resolver.cluster_spec()
  task_indices = cluster_spec.task_indices('worker')
  worker_list = [
      cluster_spec.task_address('worker', i).replace(':8470', ':8466')
      for i in task_indices
  ]
  return ','.join(worker_list)


def respond(body, content_type, code=200, content_encoding=None):
  """Create a Werkzeug response, handling JSON serialization and CSP.

  Args:
    body: For JSON responses, a JSON-serializable object; otherwise, a raw
      `bytes` string or Unicode `str` (which will be encoded as UTF-8).
    content_type: Response content-type (`str`); use `application/json` to
      automatically serialize structures.
    code: HTTP status code (`int`).
    content_encoding: Response Content-Encoding header ('str'); e.g. 'gzip'. If
      the content type is not set, The data would be compressed and the content
      encoding would be set to gzip.

  Returns:
    A `werkzeug.wrappers.BaseResponse` object.
  """
  if content_type == 'application/json' and isinstance(
      body, (dict, list, set, tuple)):
    body = json.dumps(body, sort_keys=True)
  if not isinstance(body, bytes):
    body = body.encode('utf-8')
  csp_parts = {
      'default-src': ["'self'"],
      'script-src': [
          "'self'",
          "'unsafe-eval'",
          "'unsafe-inline'",
          'https://www.gstatic.com',
      ],
      'object-src': ["'none'"],
      'style-src': [
          "'self'",
          "'unsafe-inline'",
          'https://www.gstatic.com',
      ],
      'img-src': [
          "'self'",
          'blob:',
          'data:',
      ],
      'script-src-elem': [
          "'self'",
          "'unsafe-inline'",
          # Remember to restrict on integrity when importing from jsdelivr
          # Whitelist this domain to support hlo_graph_dumper html format
          'https://cdn.jsdelivr.net/npm/',
          'https://www.gstatic.com',
      ],
  }
  csp = ';'.join((' '.join([k] + v) for (k, v) in csp_parts.items()))
  headers = [
      ('Content-Security-Policy', csp),
      ('X-Content-Type-Options', 'nosniff'),
  ]
  if content_encoding:
    headers.append(('Content-Encoding', content_encoding))
  else:
    headers.append(('Content-Encoding', 'gzip'))
    body = gzip.compress(body)
  return wrappers.Response(
      body, content_type=content_type, status=code, headers=headers)


def _plugin_assets(logdir, runs, plugin_name):
  result = {}
  for run in runs:
    run_path = _tb_run_directory(logdir, run)
    assets = plugin_asset_util.ListAssets(run_path, plugin_name)
    result[run] = assets
  return result


def _tb_run_directory(logdir, run):
  """Returns the TensorBoard run directory for a TensorBoard run name.

  This helper returns the TensorBoard-level run directory (the one that would)
  contain tfevents files) for a given TensorBoard run name (aka the relative
  path from the logdir root to this directory). For the root run '.' this is
  the bare logdir path; for all other runs this is the logdir joined with the
  run name.

  Args:
    logdir: the TensorBoard log directory root path
    run: the TensorBoard run name, e.g. '.' or 'train'

  Returns:
    The TensorBoard run directory path, e.g. my/logdir or my/logdir/train.
  """
  return logdir if run == '.' else os.path.join(logdir, run)


def filenames_to_hosts(filenames, tool):
  """Convert a list of filenames to a list of host names given a tool.

  Args:
    filenames: A list of filenames.
    tool: A string representing the profiling tool.

  Returns:
    A list of hostnames.
  """
  hosts = _get_hosts(filenames)
  if len(hosts) > 1:
    if tool in XPLANE_TOOLS_ALL_HOSTS_ONLY:
      hosts = [ALL_HOSTS]
    elif tool in XPLANE_TOOLS_ALL_HOSTS_SUPPORTED:
      hosts.add(ALL_HOSTS)
  return sorted(hosts)


def get_data_content_encoding(raw_data, tool, params):
  """Converts raw tool proto into the correct tool data.

  Args:
    raw_data: bytes representing raw data from the tool.
    tool: string of tool name.
    params: user input parameters

  Returns:
    The converted data and the content encoding of the data and content type for
    the response.
  """
  data, content_type, content_encoding = None, 'application/json', None
  if tool in RAW_DATA_TOOLS:
    data = raw_data
    if tool[-1] == '#':
      content_encoding = 'gzip'
  else:
    data = convert.tool_proto_to_tool_data(raw_data, tool, params)

  return data, content_type, content_encoding


class ProfilePlugin(base_plugin.TBPlugin):
  """Profile Plugin for TensorBoard."""

  plugin_name = PLUGIN_NAME

  def __init__(self, context):
    """Constructs a profiler plugin for TensorBoard.

    This plugin adds handlers for performance-related frontends.
    Args:
      context: A base_plugin.TBContext instance.
    """
    self.logdir = context.logdir
    self.data_provider = context.data_provider
    self.master_tpu_unsecure_channel = context.flags.master_tpu_unsecure_channel

    # Whether the plugin is active. This is an expensive computation, so we
    # compute this asynchronously and cache positive results indefinitely.
    self._is_active = False
    # Lock to ensure at most one thread computes _is_active at a time.
    self._is_active_lock = threading.Lock()
    # Cache to map profile run name to corresponding tensorboard dir name
    self._run_to_profile_run_dir = {}

  def is_active(self):
    """Whether this plugin is active and has any profile data to show.

    Returns:
      Whether any run has profile data.
    """
    if not self._is_active:
      self._is_active = any(self.generate_runs())
    return self._is_active

  def get_plugin_apps(self):
    return {
        INDEX_JS_ROUTE: self.static_file_route,
        INDEX_HTML_ROUTE: self.static_file_route,
        BUNDLE_JS_ROUTE: self.static_file_route,
        STYLES_CSS_ROUTE: self.static_file_route,
        MATERIALICONS_WOFF2_ROUTE: self.static_file_route,
        TRACE_VIEWER_INDEX_HTML_ROUTE: self.static_file_route,
        TRACE_VIEWER_INDEX_JS_ROUTE: self.static_file_route,
        ZONE_JS_ROUTE: self.static_file_route,
        RUNS_ROUTE: self.runs_route,
        RUN_TOOLS_ROUTE: self.run_tools_route,
        HOSTS_ROUTE: self.hosts_route,
        DATA_ROUTE: self.data_route,
        CAPTURE_ROUTE: self.capture_route,
    }

  def frontend_metadata(self):
    return base_plugin.FrontendMetadata(es_module_path='/index.js')

  def _read_static_file_impl(self, filename):
    """Reads contents from a filename.

    Args:
      filename (str): Name of the file.

    Returns:
      Contents of the file.
    Raises:
      IOError: File could not be read or found.
    """
    filepath = os.path.join(os.path.dirname(__file__), 'static', filename)

    try:
      with open(filepath, 'rb') as infile:
        contents = infile.read()
    except IOError as io_error:
      raise io_error
    return contents

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
    try:
      contents = self._read_static_file_impl(filename)
    except IOError:
      return respond('404 Not Found', 'text/plain', code=404)
    return respond(contents, mimetype)

  @wrappers.Request.application
  def runs_route(self, request):
    runs = self.runs_imp(request)
    return respond(runs, 'application/json')

  def runs_imp(self, request=None):
    """Returns a list all runs for the profile plugin.

    Args:
      request: Optional; werkzeug request used for grabbing ctx and experiment
        id for other host implementations
    """
    return list(self.generate_runs())

  @wrappers.Request.application
  def run_tools_route(self, request):
    run = request.args.get('run')
    run_tools = self.run_tools_imp(run, request)
    return respond(run_tools, 'application/json')

  def run_tools_imp(self, run, request=None):
    """Returns a list of tools given a single run.

    Args:
      run: the frontend run name, item is list returned by runs_imp
      request: Optional; werkzeug request used for grabbing ctx and experiment
        id for other host implementations
    """
    return list(self.generate_tools_of_run(run))

  def host_impl(self, run, tool, request=None):
    """Returns available hosts for the run and tool in the log directory.

    For HLO tools like memory_viewer and graph_viewer, this functions returns
    the module names for the run and tool instead of host names, because these
    tools are based on HLO protos.

    In the plugin log directory, each directory contains profile data for a
    single run (identified by the directory name), and files in the run
    directory contains data for different tools and hosts. The file that
    contains profile for a specific tool "x" will have extension TOOLS["x"].

    Example:
      log/
        run1/
          plugins/
            profile/
              host1.trace
              host2.trace
              module1.hlo_proto.pb
              module2.hlo_proto.pb
        run2/
          plugins/
            profile/
              host1.trace
              host2.trace

    Args:
      run: the frontend run name, e.g., 'run1' or 'run2' for the example above.
      tool: the requested tool, e.g., 'trace_viewer' for the example above.
      request: Optional; werkzeug request used for grabbing ctx and experiment
        id for other host implementations

    Returns:
      A list of host names, e.g.:
        host_impl(run1, trace_viewer) --> ["host1", "host2"]
        host_impl(run1, memory_viewer) --> ["module1", "module2"]
    """
    run_dir = self._run_dir(run)
    if not run_dir:
      logger.warning('Cannot find asset directory for: %s', run)
      return []
    tool_pattern = make_filename('*', tool)
    filenames = []
    try:
      filenames = tf.io.gfile.glob(os.path.join(run_dir, tool_pattern))
    except tf.errors.OpError as e:
      logger.warning('Cannot read asset directory: %s, OpError %s', run_dir, e)
    filenames = [os.path.basename(f) for f in filenames]

    return filenames_to_hosts(filenames, tool)

  @wrappers.Request.application
  def hosts_route(self, request):
    run = request.args.get('run')
    tool = request.args.get('tag')
    hosts = self.host_impl(run, tool, request)
    return respond(hosts, 'application/json')

  def data_impl(self, request):
    """Retrieves and processes the tool data for a run and a host.

    Args:
      request: XMLHttpRequest

    Returns:
      A string that can be served to the frontend tool or None if tool,
        run or host is invalid.
    """
    run = request.args.get('run')
    tool = request.args.get('tag')
    host = request.args.get('host')
    tqx = request.args.get('tqx')
    graph_viewer_options = self._get_graph_viewer_options(request)
    # Host param is used by HLO tools to identify the module.
    # 
    # neded.
    params = {
        'graph_viewer_options': graph_viewer_options,
        'tqx': tqx,
        'host': host
    }
    run_dir = self._run_dir(run)
    content_type = 'application/json'

    if tool not in TOOLS and not use_xplane(tool):
      return None, content_type, None

    if tool == 'trace_viewer@^':
      options = {}
      options['resolution'] = request.args.get('resolution', 8000)
      if request.args.get('start_time_ms') is not None:
        options['start_time_ms'] = request.args.get('start_time_ms')
      if request.args.get('end_time_ms') is not None:
        options['end_time_ms'] = request.args.get('end_time_ms')
      params['trace_viewer_options'] = options

    asset_path = os.path.join(run_dir, make_filename(host, tool))

    data, content_encoding = None, None
    if use_xplane(tool):
      if host == ALL_HOSTS:
        file_pattern = make_filename('*', 'xplane')
        try:
          asset_paths = tf.io.gfile.glob(os.path.join(run_dir, file_pattern))
        except tf.errors.OpError as e:
          logger.warning('Cannot read asset directory: %s, OpError %s', run_dir,
                         e)
      else:
        asset_paths = [asset_path]

      try:
        data, content_type = convert.xspace_to_tool_data(
            asset_paths, tool, params)
      except AttributeError:
        logger.warning('XPlane converters are available after Tensorflow 2.4')
      return data, content_type, content_encoding

    raw_data = None
    try:
      with tf.io.gfile.GFile(asset_path, 'rb') as f:
        raw_data = f.read()
    except tf.errors.NotFoundError:
      logger.warning('Asset path %s not found', asset_path)
    except tf.errors.OpError as e:
      logger.warning("Couldn't read asset path: %s, OpError %s", asset_path, e)

    if raw_data is None:
      return None, content_type, None

    return get_data_content_encoding(raw_data, tool, params)

  @wrappers.Request.application
  def data_route(self, request):
    # params
    #   request: XMLHTTPRequest.
    data, content_type, content_encoding = self.data_impl(request)
    if data is None:
      return respond('404 Not Found', 'text/plain', code=404)
    return respond(data, content_type, content_encoding=content_encoding)

  @wrappers.Request.application
  def capture_route(self, request):
    return self.capture_route_impl(request)

  def capture_route_impl(self, request):
    """Runs the client trace for capturing profiling information."""
    service_addr = request.args.get('service_addr')
    duration = int(request.args.get('duration', '1000'))
    is_tpu_name = request.args.get('is_tpu_name') == 'true'
    worker_list = request.args.get('worker_list')
    num_tracing_attempts = int(request.args.get('num_retry', '0')) + 1
    options = None
    try:
      options = profiler.ProfilerOptions(
          host_tracer_level=int(request.args.get('host_tracer_level', '2')),
          device_tracer_level=int(request.args.get('device_tracer_level', '1')),
          python_tracer_level=int(request.args.get('python_tracer_level', '0')),
      )
      # For preserving backwards compatibility with TensorFlow 2.3 and older.
      if 'delay_ms' in options._fields:
        options.delay_ms = int(request.args.get('delay', '0'))
    except AttributeError:
      logger.warning('ProfilerOptions are available after tensorflow 2.3')

    if is_tpu_name:
      try:
        tpu_cluster_resolver = tf.distribute.cluster_resolver.TPUClusterResolver(
            service_addr)
        master_grpc_addr = tpu_cluster_resolver.get_master()
      except (ImportError, RuntimeError) as err:
        return respond({'error': err.message}, 'application/json', code=200)
      except (ValueError, TypeError):
        return respond(
            {'error': 'no TPUs with the specified names exist.'},
            'application/json',
            code=200,
        )
      if not worker_list:
        worker_list = get_worker_list(tpu_cluster_resolver)
      # TPU cluster resolver always returns port 8470. Replace it with 8466
      # on which profiler service is running.
      master_ip = master_grpc_addr.replace('grpc://', '').replace(':8470', '')
      service_addr = master_ip + ':8466'
      # Set the master TPU for streaming trace viewer.
      self.master_tpu_unsecure_channel = master_ip
    try:
      if options:
        profiler_client.trace(
            service_addr,
            self.logdir,
            duration,
            worker_list,
            num_tracing_attempts,
            options=options)
      else:
        profiler_client.trace(
            service_addr,
            self.logdir,
            duration,
            worker_list,
            num_tracing_attempts,
        )
      return respond(
          {'result': 'Capture profile successfully. Please refresh.'},
          'application/json',
      )
    except tf.errors.UnavailableError:
      return respond(
          {'error': 'empty trace result.'},
          'application/json',
          code=200,
      )
    except Exception as e:  # pylint: disable=broad-except
      return respond(
          {'error': str(e)},
          'application/json',
          code=200,
      )

  def _get_graph_viewer_options(self, request):
    node_name = request.args.get('node_name')
    module_name = request.args.get('module_name')
    graph_width = request.args.get('graph_width')
    show_metadata = request.args.get('show_metadata')
    merge_fusion = request.args.get('merge_fusion')
    return {
        'node_name': node_name,
        'module_name': module_name,
        'graph_width': graph_width,
        'show_metadata': show_metadata,
        'merge_fusion': merge_fusion,
        'format': request.args.get('format'),
        'type': request.args.get('type')
    }

  def _run_dir(self, run):
    """Helper that maps a frontend run name to a profile "run" directory.

    The frontend run name consists of the TensorBoard run name (aka the relative
    path from the logdir root to the directory containing the data) path-joined
    to the Profile plugin's "run" concept (which is a subdirectory of the
    plugins/profile directory representing an individual run of the tool), with
    the special case that TensorBoard run is the logdir root (which is the run
    named '.') then only the Profile plugin "run" name is used, for backwards
    compatibility.

    Args:
      run: the frontend run name, as described above, e.g. train/run1.

    Returns:
      The resolved directory path, e.g. /logdir/train/plugins/profile/run1.

    Raises:
      RuntimeError: If the run directory is not found.
    """
    run = run.rstrip(os.sep)
    tb_run_name, profile_run_name = os.path.split(run)
    if not tb_run_name:
      tb_run_name = '.'
    tb_run_directory = _tb_run_directory(self.logdir, tb_run_name)
    if not tf.io.gfile.isdir(tb_run_directory):
      raise RuntimeError('No matching run directory for run %s' % run)

    plugin_directory = plugin_asset_util.PluginDirectory(
        tb_run_directory, PLUGIN_NAME)
    return os.path.join(plugin_directory, profile_run_name)

  def generate_runs(self):
    """Generator for a list of runs.

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

    `generate_runs` will get all runs first, and get tools list from
    `generate_tools_of_run` for a single run due to expensive processing for
    xspace data to parse the tools.
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
    A sequence of string that are "frontend run names".
    For the above example, this would be:
        "run1", "train/run1", "train/run2", "validation/run1"
    """

    # Create a background context; we may not be in a request.
    ctx = RequestContext()
    tb_runs = [
        run.run_name
        for run in self.data_provider.list_runs(ctx, experiment_id='')
    ]
    # Ensure that we also check the root logdir, even if it isn't a recognized
    # TensorBoard run (i.e. has no tfevents file directly under it), to remain
    # backwards compatible with previously profile plugin behavior. Note that we
    # check if logdir is a directory to handle case where it's actually a
    # multipart directory spec, which this plugin does not support.
    if '.' not in tb_runs and tf.io.gfile.isdir(self.logdir):
      tb_runs.append('.')
    tb_run_names_to_dirs = {
        run: _tb_run_directory(self.logdir, run) for run in tb_runs
    }
    plugin_assets = _plugin_assets(self.logdir, list(tb_run_names_to_dirs),
                                   PLUGIN_NAME)
    for tb_run_name, profile_runs in six.iteritems(plugin_assets):
      tb_run_dir = tb_run_names_to_dirs[tb_run_name]
      tb_plugin_dir = plugin_asset_util.PluginDirectory(tb_run_dir, PLUGIN_NAME)

      for profile_run in profile_runs:
        # Remove trailing separator; some filesystem implementations emit this.
        profile_run = profile_run.rstrip(os.sep)
        if tb_run_name == '.':
          frontend_run = profile_run
        else:
          frontend_run = os.path.join(tb_run_name, profile_run)
        profile_run_dir = os.path.join(tb_plugin_dir, profile_run)
        if tf.io.gfile.isdir(profile_run_dir):
          self._run_to_profile_run_dir[frontend_run] = profile_run_dir
          yield frontend_run

  def generate_tools_of_run(self, run):
    """Generate a list of tools given a certain run."""
    profile_run_dir = self._run_to_profile_run_dir[run]
    if tf.io.gfile.isdir(profile_run_dir):
      try:
        filenames = tf.io.gfile.listdir(profile_run_dir)
      except tf.errors.NotFoundError as e:
        logger.warning('Cannot read asset directory: %s, NotFoundError %s',
                       profile_run_dir, e)
        filenames = []
      if filenames:
        for tool in self._get_active_tools(filenames, profile_run_dir):
          yield tool

  def _get_active_tools(self, filenames, profile_run_dir=''):
    """Get a list of tools available given the filenames created by profiler.

    Args:
      filenames: List of strings that represent filenames
      profile_run_dir: The run directory of the profile.

    Returns:
      A list of strings representing the available tools
    """
    tools = _get_tools(filenames, profile_run_dir)
    if 'trace_viewer@^' in tools:
      # streaming trace viewer always override normal trace viewer.
      # the trailing '@' is to inform tf-profile-dashboard.html and
      # tf-trace-viewer.html that stream trace viewer should be used.
      tools.discard('trace_viewer#')
      tools.discard('trace_viewer')
    if 'trace_viewer#' in tools:
      # use compressed trace
      tools.discard('trace_viewer')
    # Return sorted list of tools with 'overview_page' at the front.
    op = frozenset(['overview_page@', 'overview_page', 'overview_page^'])
    return list(tools.intersection(op)) + sorted(tools.difference(op))
