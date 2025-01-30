# -*- coding: utf-8 -*-
# Copyright 2017 The TensorFlow Authors. All Rights Reserved.
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
"""Tests for the Profile plugin."""

from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import atexit
import copy
import inspect
import json
import logging
import os
import shutil
import tempfile
import unittest

from tensorboard_plugin_profile import profile_plugin
from tensorboard_plugin_profile import profile_plugin_test_utils as utils
from tensorboard_plugin_profile.protobuf import trace_events_pb2

RUN_TO_TOOLS = {
    'foo': ['trace_viewer'],
    'bar': ['unsupported'],
    'baz': ['overview_page', 'op_profile', 'trace_viewer'],
    'qux': ['overview_page@', 'input_pipeline_analyzer@', 'trace_viewer'],
    'abc': ['xplane'],
    'empty': [],
}

RUN_TO_HOSTS = {
    'foo': ['host0', 'host1'],
    'bar': ['host1'],
    'baz': ['host2'],
    'qux': [None],
    'abc': ['host1', 'host2'],
    'empty': [],
}

EXPECTED_TRACE_DATA = dict(
    displayTimeUnit='ns',
    metadata={'highres-ticks': True},
    traceEvents=[
        dict(ph='M', pid=0, name='process_name', args=dict(name='foo')),
        dict(ph='M', pid=0, name='process_sort_index', args=dict(sort_index=0)),
        dict(),
    ],
)

# Suffix for the empty eventfile to write. Should be kept in sync with TF
# profiler kProfileEmptySuffix constant defined in:
#   tensorflow/core/profiler/rpc/client/capture_profile.cc.
EVENT_FILE_SUFFIX = '.profile-empty'


def write_empty_event_file(logdir):
  os.makedirs(logdir, exist_ok=True)
  with open(os.path.join(logdir, "events.out.tfevents.profile-empty"), 'w+') as f:
    f.write("dummy")

class BaseProfilePluginTest(unittest.TestCase):
  def __init__(self, methodname):
    super().__init__(methodname)
    self._temp_dir = None
  

  def generate_testdata(self, logdir):
    plugin_logdir = self.asset_util.PluginDirectory(
        logdir, profile_plugin.ProfilePlugin.plugin_name)
    os.makedirs(plugin_logdir)
    for run in RUN_TO_TOOLS:
      run_dir = os.path.join(plugin_logdir, run)
      os.mkdir(run_dir)
      for tool in RUN_TO_TOOLS[run]:
        if tool not in profile_plugin.TOOLS:
          continue
        for host in RUN_TO_HOSTS[run]:
          filename = profile_plugin.make_filename(host, tool)
          tool_file = os.path.join(run_dir, filename)
          if tool == 'trace_viewer':
            trace = trace_events_pb2.Trace()
            trace.devices[0].name = run
            data = trace.SerializeToString()
          else:
            data = tool.encode('utf-8')
          with open(tool_file, 'wb') as f:
            f.write(data)
    with open(os.path.join(plugin_logdir, 'noise'), 'w') as f:
      f.write('Not a dir, not a run.')

  def get_temp_dir(self):
      """Return a temporary directory for tests to use."""
      if not self._temp_dir:
          if os.environ.get('TEST_TMPDIR'):
              temp_dir = tempfile.mkdtemp(prefix=os.environ['TEST_TMPDIR'])
          else:
              frame = inspect.stack()[-1]
              filename = frame.filename
              base_filename = os.path.basename(filename)
              temp_dir_prefix = os.path.join(tempfile.gettempdir(), base_filename.rstrip('.py'))
              temp_dir = tempfile.mkdtemp(prefix=temp_dir_prefix)

          def delete_temp_dir(dirname=temp_dir):
              try:
                  shutil.rmtree(dirname)  # Use shutil.rmtree for recursive delete
              except Exception as e:  # Catch a broader exception
                  logging.error('Error removing %s: %s', dirname, e)

          atexit.register(delete_temp_dir)

          self._temp_dir = temp_dir

      return self._temp_dir


  def setUp(self):
    super(BaseProfilePluginTest, self).setUp()
    self.logdir = self.get_temp_dir()
    self.multiplexer = None  
    self.plugin = None
    self.asset_util = None
  
  def setUpSideEffect(self, plugin_asset_util):
    # Fail if we call PluginDirectory with a non-normalized logdir path, since
    # that won't work on GCS, as a regression test for b/235606632.
    original_plugin_directory = plugin_asset_util.PluginDirectory
    plugin_directory_patcher = unittest.mock.patch.object(plugin_asset_util,
                                                 'PluginDirectory')
    mock_plugin_directory = plugin_directory_patcher.start()
    self.addCleanup(plugin_directory_patcher.stop)

    def plugin_directory_spy(logdir, plugin_name):
      if os.path.normpath(logdir) != logdir:
        self.fail(
            'PluginDirectory called with a non-normalized logdir path: %r' %
            logdir)
      return original_plugin_directory(logdir, plugin_name)

    mock_plugin_directory.side_effect = plugin_directory_spy

  def testRuns_logdirWithoutEventFile(self):
    self.generate_testdata(self.logdir)
    self.multiplexer.Reload()
    all_runs = list(self.plugin.generate_runs())
    self.assertSetEqual(frozenset(all_runs), frozenset(RUN_TO_HOSTS.keys()))

    self.assertListEqual(
        list(self.plugin.generate_tools_of_run('foo')), RUN_TO_TOOLS['foo'])
    self.assertFalse(list(self.plugin.generate_tools_of_run('bar')))
    self.assertListEqual(
        list(self.plugin.generate_tools_of_run('baz')), RUN_TO_TOOLS['baz'])
    self.assertListEqual(
        list(self.plugin.generate_tools_of_run('qux')), RUN_TO_TOOLS['qux'])
    self.assertFalse(list(self.plugin.generate_tools_of_run('empty')))

  def testRuns_logdirWithEventFIle(self):
    write_empty_event_file(self.logdir)
    self.generate_testdata(self.logdir)
    self.multiplexer.Reload()
    all_runs = self.plugin.generate_runs()
    self.assertSetEqual(frozenset(all_runs), frozenset(RUN_TO_HOSTS.keys()))

  def testRuns_withSubdirectories(self):
    subdir_a = os.path.join(self.logdir, 'a')
    subdir_b = os.path.join(self.logdir, 'b')
    subdir_b_c = os.path.join(subdir_b, 'c')
    self.generate_testdata(self.logdir)
    self.generate_testdata(subdir_a)
    self.generate_testdata(subdir_b)
    self.generate_testdata(subdir_b_c)
    write_empty_event_file(self.logdir)
    write_empty_event_file(subdir_a)
    # Skip writing an event file for subdir_b
    write_empty_event_file(subdir_b_c)
    self.multiplexer.AddRunsFromDirectory(self.logdir)
    self.multiplexer.Reload()
    all_runs = list(self.plugin.generate_runs())
    # Expect runs for the logdir root, 'a', and 'b/c' but not for 'b'
    # because it doesn't contain a tfevents file.
    expected = set(RUN_TO_TOOLS.keys())
    expected.update(set('a/' + run for run in RUN_TO_TOOLS.keys()))
    expected.update(set('b/c/' + run for run in RUN_TO_TOOLS.keys()))
    self.assertSetEqual(frozenset(all_runs), expected)

  def testRuns_withoutEvents(self):
    self.generate_testdata(self.logdir)
    self.multiplexer.AddRunsFromDirectory(self.logdir)
    self.multiplexer.Reload()
    all_runs = list(self.plugin.generate_runs())
    expected = set(RUN_TO_TOOLS.keys())
    self.assertSetEqual(frozenset(all_runs), expected)

  def testRuns_withNestedRuns(self):
    subdir_date = os.path.join(self.logdir, '2024-12-19')
    subdir_train = os.path.join(subdir_date, 'train')
    subdir_validation = os.path.join(subdir_date, 'validation')
    # Write the plugin directory for the subdir_date directory.
    self.generate_testdata(subdir_date)
    # Write events files for the subdir_train and subdir_validation directories.
    write_empty_event_file(subdir_train)
    write_empty_event_file(subdir_validation)
    self.multiplexer.AddRunsFromDirectory(self.logdir)
    self.multiplexer.Reload()
    all_runs = list(self.plugin.generate_runs())
    # Expect runs for the subdir_date because it contains the plugin directory
    # and is the parent directory of the subdir_train and subdir_validation
    # directories.
    expected = set(set('2024-12-19/' + run for run in RUN_TO_TOOLS.keys()))
    self.assertSetEqual(frozenset(all_runs), expected)

  def testHosts(self):
    self.generate_testdata(self.logdir)
    subdir_a = os.path.join(self.logdir, 'a')
    self.generate_testdata(subdir_a)
    write_empty_event_file(subdir_a)
    self.multiplexer.AddRunsFromDirectory(self.logdir)
    self.multiplexer.Reload()
    expected_hosts_foo = [{'hostname': 'host0'}, {'hostname': 'host1'}]
    expected_hosts_abc = [{'hostname': 'host1'}, {'hostname': 'host2'}]
    expected_all_hosts_only = [{'hostname': 'ALL_HOSTS'}]
    hosts = self.plugin.host_impl('foo', 'trace_viewer')
    self.assertListEqual(expected_hosts_foo, hosts)
    hosts_a = self.plugin.host_impl('a/foo', 'trace_viewer')
    self.assertListEqual(expected_hosts_foo, hosts_a)
    hosts_q = self.plugin.host_impl('qux', 'framework_op_stats')
    self.assertFalse(hosts_q)
    hosts_abc_tf_stats = self.plugin.host_impl('abc', 'framework_op_stats^')
    self.assertListEqual(
        expected_all_hosts_only + expected_hosts_abc, hosts_abc_tf_stats
    )
    # TraceViewer and MemoryProfile does not support all hosts.
    hosts_abc_trace_viewer = self.plugin.host_impl('abc', 'trace_viewer^')
    self.assertListEqual(expected_hosts_abc, hosts_abc_trace_viewer)
    hosts_abc_memory_profile = self.plugin.host_impl('abc', 'memory_profile^')
    self.assertListEqual(expected_hosts_abc, hosts_abc_memory_profile)
    # OverviewPage supports all hosts only.
    hosts_abc_overview_page = self.plugin.host_impl('abc', 'overview_page^')
    self.assertListEqual(expected_all_hosts_only, hosts_abc_overview_page)
    # PodViewer supports all hosts only.
    hosts_abc_pod_viewer = self.plugin.host_impl('abc', 'pod_viewer^')
    self.assertListEqual(expected_all_hosts_only, hosts_abc_pod_viewer)
    # tf.data Bottleneck Analysis supports all hosts only.
    hosts_abc_tf_data_bottleneck_analysis = self.plugin.host_impl(
        'abc', 'tf_data_bottleneck_analysis^')
    self.assertListEqual(
        expected_all_hosts_only, hosts_abc_tf_data_bottleneck_analysis
    )

  def testData(self):
    self.generate_testdata(self.logdir)
    subdir_a = os.path.join(self.logdir, 'a')
    self.generate_testdata(subdir_a)
    write_empty_event_file(subdir_a)
    self.multiplexer.AddRunsFromDirectory(self.logdir)
    self.multiplexer.Reload()
    data, _, _ = self.plugin.data_impl(
        utils.make_data_request('foo', 'trace_viewer', 'host0'))
    trace = json.loads(data)
    self.assertEqual(trace, EXPECTED_TRACE_DATA)
    data, _, _ = self.plugin.data_impl(
        utils.make_data_request('a/foo', 'trace_viewer', 'host0'))
    trace_a = json.loads(data)
    self.assertEqual(trace_a, EXPECTED_TRACE_DATA)
    data, _, _ = self.plugin.data_impl(
        utils.make_data_request('qux', 'trace_viewer'))
    trace_qux = json.loads(data)
    expected_trace_qux = copy.deepcopy(EXPECTED_TRACE_DATA)
    expected_trace_qux['traceEvents'][0]['args']['name'] = 'qux'
    self.assertEqual(trace_qux, expected_trace_qux)

    # Invalid tool/run/host.
    data, _, _ = self.plugin.data_impl(
        utils.make_data_request('foo', 'nonono', 'host0'))
    self.assertIsNone(data)
    data, _, _ = self.plugin.data_impl(
        utils.make_data_request('foo', 'trace_viewer', ''))
    self.assertIsNone(data)
    data, _, _ = self.plugin.data_impl(
        utils.make_data_request('bar', 'unsupported', 'host1'))
    self.assertIsNone(data)
    data, _, _ = self.plugin.data_impl(
        utils.make_data_request('bar', 'trace_viewer', 'host0'))
    self.assertIsNone(data)
    data, _, _ = self.plugin.data_impl(
        utils.make_data_request('qux', 'trace_viewer', 'host'))
    self.assertIsNone(data)
    data, _, _ = self.plugin.data_impl(
        utils.make_data_request('empty', 'trace_viewer', ''))
    self.assertIsNone(data)
    data, _, _ = self.plugin.data_impl(
        utils.make_data_request('a', 'trace_viewer', ''))
    self.assertIsNone(data)

  def testActive(self):

    def wait_for_thread():
      with self.plugin._is_active_lock:
        pass

    # Launch thread to check if active.
    self.plugin.is_active()
    wait_for_thread()
    # Should be false since there's no data yet.
    self.assertFalse(self.plugin.is_active())
    wait_for_thread()
    self.generate_testdata(self.logdir)
    self.multiplexer.Reload()
    # Launch a new thread to check if active.
    self.plugin.is_active()
    wait_for_thread()
    # Now that there's data, this should be active.
    self.assertTrue(self.plugin.is_active())

  def testActive_subdirectoryOnly(self):

    def wait_for_thread():
      with self.plugin._is_active_lock:
        pass

    # Launch thread to check if active.
    self.plugin.is_active()
    wait_for_thread()
    # Should be false since there's no data yet.
    self.assertFalse(self.plugin.is_active())
    wait_for_thread()
    subdir_a = os.path.join(self.logdir, 'a')
    self.generate_testdata(subdir_a)
    write_empty_event_file(subdir_a)
    self.multiplexer.AddRunsFromDirectory(self.logdir)
    self.multiplexer.Reload()
    # Launch a new thread to check if active.
    self.plugin.is_active()
    wait_for_thread()
    # Now that there's data, this should be active.
    self.assertTrue(self.plugin.is_active())

class TensorboardProfilePluginTest(BaseProfilePluginTest):
    def setUp(self):
        super().setUp()
        from tensorboard.backend.event_processing import plugin_asset_util
        from tensorboard.backend.event_processing.plugin_event_multiplexer import EventMultiplexer
        self.multiplexer = EventMultiplexer()
        self.asset_util = plugin_asset_util
        self.multiplexer.AddRunsFromDirectory(self.logdir)
        self.plugin = utils.create_profile_plugin(self.logdir, self.multiplexer, plugin_asset_util=plugin_asset_util)
        self.setUpSideEffect(plugin_asset_util)

class TensorboardPluginProfilePluginTest(BaseProfilePluginTest):
    def setUp(self):
        super().setUp()
        from tensorboard_plugin_profile.tb_free.context import DataProvider as EventMultiplexer
        from tensorboard_plugin_profile.tb_free import plugin_asset_util
        self.multiplexer = EventMultiplexer()
        self.asset_util = plugin_asset_util
        self.multiplexer.AddRunsFromDirectory(self.logdir)
        self.plugin = utils.create_profile_plugin(self.logdir, self.multiplexer, plugin_asset_util=plugin_asset_util)
        self.setUpSideEffect(plugin_asset_util)


if __name__ == '__main__':
  unittest.main()
