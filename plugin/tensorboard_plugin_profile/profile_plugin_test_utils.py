# Copyright 2020 The TensorFlow Authors. All Rights Reserved.
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
"""Testing utilities for the Profile plugin."""

import werkzeug

from tensorboard_plugin_profile import profile_plugin
try:
  from tensorboard.backend.event_processing import data_provider  # pylint: disable=g-import-not-at-top
  from tensorboard.backend.event_processing import plugin_event_multiplexer as context  # pylint: disable=g-import-not-at-top
  from tensorboard.plugins import base_plugin  # pylint: disable=g-import-not-at-top
except ImportError:
  from tensorboard_plugin_profile.tb_free import base_plugin  # pylint: disable=g-import-not-at-top
  from tensorboard_plugin_profile.tb_free import context  # pylint: disable=g-import-not-at-top
  from tensorboard_plugin_profile.tb_free import data_provider  # pylint: disable=g-import-not-at-top


class _FakeFlags(object):

  def __init__(self, logdir, master_tpu_unsecure_channel=''):
    self.logdir = logdir
    self.master_tpu_unsecure_channel = master_tpu_unsecure_channel


def create_profile_plugin(logdir,
                          multiplexer=None,
                          master_tpu_unsecure_channel=''):
  """Instantiates ProfilePlugin with data from the specified directory.

  Args:
    logdir: Directory containing TensorBoard data.
    multiplexer: A TensorBoard plugin_event_multiplexer.EventMultiplexer
    master_tpu_unsecure_channel: Master TPU address for streaming trace viewer.

  Returns:
    An instance of ProfilePlugin.
  """
  if not multiplexer:
    multiplexer = context.EventMultiplexer()
    multiplexer.AddRunsFromDirectory(logdir)

  ctx = base_plugin.TBContext(
      logdir=logdir,
      multiplexer=multiplexer,
      data_provider=data_provider.MultiplexerDataProvider(multiplexer, logdir),
      flags=_FakeFlags(logdir, master_tpu_unsecure_channel),
  )
  return profile_plugin.ProfilePlugin(ctx)


def make_data_request(run, tool, host=None):
  """Creates a werkzeug.Request to pass as argument to ProfilePlugin.data_impl.

  Args:
    run: Front-end run name.
    tool: ProfilePlugin tool, e.g., 'trace_viewer'.
    host: Host that generated the profile data, e.g., 'localhost'.

  Returns:
    A werkzeug.Request to pass to ProfilePlugin.data_impl.
  """
  req = werkzeug.Request({})
  req.args = {'run': run, 'tag': tool}
  if host:
    req.args['host'] = host
  return req
