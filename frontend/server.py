"""SimpleHTTPServer with IPv6 suport to run on TAP which will be IPV6 only.

Also provides /healthz support so that test can wait for the server to start.
"""

from __future__ import print_function
from BaseHTTPServer import HTTPServer
import os
from SimpleHTTPServer import SimpleHTTPRequestHandler
import socket
from google3.pyglib import app
from google3.pyglib import flags
from google3.pyglib import resources

FLAGS = flags.FLAGS
flags.DEFINE_string("port", "4200", "default port")


class HTTPServerV6(HTTPServer):
  address_family = socket.AF_INET6


def main(unused_args):
  os.chdir(resources.GetRunfilesDir() + "/google3/frontend")

  port = FLAGS.port
  print("Listening on port %s" % port)
  server = HTTPServerV6(("::", int(port)), SimpleHTTPRequestHandler)
  server.serve_forever()


if __name__ == "__main__":
  app.run()
