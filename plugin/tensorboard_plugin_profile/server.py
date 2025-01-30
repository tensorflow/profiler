# Copyright 2025 The TensorFlow Authors. All Rights Reserved.
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
"""Utilities to start up a standalone webserver."""

from cheroot.wsgi import Server
from collections import defaultdict
import socket
import sys

from profile_plugin_loader import ProfilePluginLoader
from tensorboard_plugin_profile import profile_plugin
from tensorboard_plugin_profile.tb_free.context import DataProvider, TBContext

def make_wsgi_app(plugin):
    """Create a WSGI application for the standalone server."""

    apps = plugin.get_plugin_apps()

    _PREFIX='/data/plugin/profile'
    def application(environ, start_response):
        path = environ['PATH_INFO']
        if path.startswith(_PREFIX):
          path = path[len(_PREFIX):]
        if path != "/" and path.endswith("/"):
          path = path[:-1]
        handler = apps.get(path, plugin.default_handler)
        return handler(environ, start_response)

    return application


def run_server(plugin, host, port):
    """Starts a webserver for the standalone server."""

    app = make_wsgi_app(plugin)

    server = Server((host, port), app)

    try:
        server.start()
    except KeyboardInterrupt:
        server.stop()


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
