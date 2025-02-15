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
"""Loader for `profile_plugin`."""

from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import argparse
from collections import defaultdict
import logging
import socket
import sys

try:
  from tensorboard.plugins import base_plugin
except ImportError:
  from tensorboard_plugin_profile.tb_free import base_plugin

logger = logging.getLogger('tensorboard-plugin-profile')


class ProfilePluginLoader(base_plugin.TBLoader):
  """ProfilePlugin factory."""

  def define_flags(self, parser):
    group = parser.add_argument_group('profile plugin')
    try:
      group.add_argument(
          '--master_tpu_unsecure_channel',
          metavar='ADDR',
          type=str,
          default='',
          help="""\
  IP address of "master tpu", used for getting streaming trace data
  through tpu profiler analysis grpc. The grpc channel is not secured.\
  """,
      )
    except argparse.ArgumentError:
      # This same flag is registered by TensorBoard's static profile
      # plugin, as long as it continues to be bundled. Nothing to do.
      pass

  def load(self, context):
    """Returns the plugin, if possible.

    Args:
      context: The TBContext flags.

    Returns:
      A ProfilePlugin instance or None if it couldn't be loaded.
    """
    # Ensure that we have TensorFlow and the `profiler_client`, which
    # was added in TensorFlow 1.14.
    try:
      # pylint: disable=g-import-not-at-top
      # pylint: disable=g-direct-tensorflow-import
      import tensorflow
      from tensorflow.python.profiler import profiler_client
      # pylint: enable=g-import-not-at-top
      # pylint: enable=g-direct-tensorflow-import
      del tensorflow
      del profiler_client
    except ImportError:
      try:
        from tensorboard_plugin_profile.convert import _pywrap_profiler_plugin  # pylint: disable=g-import-not-at-top
        del _pywrap_profiler_plugin
        logger.info('Loading profiler plugin with limited functionality')
      except ImportError as err:
        logger.warning('Unable to load profiler plugin. Import error: %s', err)
        return None

    # pylint: disable=g-import-not-at-top
    from tensorboard_plugin_profile import profile_plugin
    # pylint: enable=g-import-not-at-top

    return profile_plugin.ProfilePlugin(context)


def _get_wildcard_address(port):
    """Returns a wildcard address for the port in question.

    This will attempt to follow the best practice of calling
    getaddrinfo() with a null host and AI_PASSIVE to request a
    server-side socket wildcard address. If that succeeds, this
    returns the first IPv6 address found, or if none, then returns
    the first IPv4 address. If that fails, then this returns the
    hardcoded address "::" if socket.has_ipv6 is True, else
    "0.0.0.0".
    """
    fallback_address = "::" if socket.has_ipv6 else "0.0.0.0"
    if hasattr(socket, "AI_PASSIVE"):
        try:
            addrinfos = socket.getaddrinfo(
                None,
                port,
                socket.AF_UNSPEC,
                socket.SOCK_STREAM,
                socket.IPPROTO_TCP,
                socket.AI_PASSIVE,
            )
        except socket.gaierror as e:
            return fallback_address
        addrs_by_family = defaultdict(list)
        for family, _, _, _, sockaddr in addrinfos:
            # Format of the "sockaddr" socket address varies by address family,
            # but [0] is always the IP address portion.
            addrs_by_family[family].append(sockaddr[0])
        if hasattr(socket, "AF_INET6") and addrs_by_family[socket.AF_INET6]:
            return addrs_by_family[socket.AF_INET6][0]
        if hasattr(socket, "AF_INET") and addrs_by_family[socket.AF_INET]:
            return addrs_by_family[socket.AF_INET][0]
    return fallback_address

from tensorboard_plugin_profile import profile_plugin
from tensorboard_plugin_profile.tb_free.context import DataProvider, TBContext


def launch_server(logdir, port):
  context = TBContext(logdir, DataProvider(logdir), TBContext.Flags(False))
  loader = ProfilePluginLoader()
  plugin = loader.load(context)
  print(f"Starting xprof server with logdir {logdir} on port {port}")
  profile_plugin.run_server(plugin, _get_wildcard_address(port), port)


def main():
    if len(sys.argv) < 2:
        print("Need logdir")
        return -1
    logdir = sys.argv[1]
    port = 8791 if len(sys.argv < 3) else int(sys.argv[2])
    launch_server(logdir, port)
