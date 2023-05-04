# Copyright 2021 The TensorFlow Authors. All Rights Reserved.
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

"""External-only delegates for various BUILD rules."""

load("@aspect_rules_ts//ts:defs.bzl", _ts_project = "ts_project")

# Common dependencies of Angular applications
APPLICATION_DEPS = [
    #"//:node_modules/@angular/common",
    #"//:node_modules/@angular/core",
    #"//:node_modules/@angular/router",
    #"//:node_modules/@angular/platform-browser",
    #"//:node_modules/@types/node",
    #"//:node_modules/rxjs",
]

def _convert_paths_to_absolute_impl(ctx):
  """Implementation of convert_paths_to_absolute.

  Used on TypeScript source files to convert their relative import paths
  to absolute import paths.
  """
  outputs = []
  for src in ctx.files.srcs:
    out_file = ctx.actions.declare_file(src.basename)
    outputs.append(out_file)

    ctx.actions.run_shell(
      inputs = [src],
      outputs = [out_file],
      command = """sed "s;from './;from 'org_xprof/%s/;g" '%s' > '%s'""" % (src.dirname, src.path, out_file.path)
    )

  return [DefaultInfo(
      files = depset(
          outputs,
      ),
  )]

convert_paths_to_absolute = rule(
    implementation = _convert_paths_to_absolute_impl,
    attrs = {
        "srcs": attr.label_list(
          doc = "Convert relative import paths to absolute for TypeScript source files.",
          allow_files = [".ts", ".tsx"],
          mandatory = True,
        ),
    },
)

def ts_project(name, **kwargs):
    """ts_project() macro with default tsconfig and aligning params.
    """

    _ts_project(
        name = name,

        # Default tsconfig and aligning attributes
        tsconfig = kwargs.pop("tsconfig", "//:tsconfig"),
        declaration = kwargs.pop("declaration", True),
        declaration_map = kwargs.pop("declaration_map", True),
        source_map = kwargs.pop("source_map", True),
        **kwargs
    )

def ng_project(name, **kwargs):
    """ts_project() wrapper with Angular ngc compiler.
    """
    ts_project(
        name = name,

        # Compiler
        tsc = "//defs:ngc",

        # Any other ts_project() or generic args
        **kwargs
    )

# Macro to wrap Angular's ngc compiler
def xprof_ng_module(name, **kwargs):
    #srcs = kwargs.pop('srcs')
    #converted_srcs_name = "%s_converted_srcs" % name
    #convert_paths_to_absolute(
    #  name = converted_srcs_name,
    #  srcs = srcs
    #)
    #srcs = [":%s" % (converted_srcs_name)]

    if "//:node_modules/@angular/common" not in kwargs['deps']:
      kwargs['deps'] += ["//:node_modules/@angular/common"]
    if "//:node_modules/@angular/core" not in kwargs['deps']:
      kwargs['deps'] += ["//:node_modules/@angular/core"]

    # Primary app source
    ng_project(
      name = name,
      srcs = kwargs.pop('srcs', []) + kwargs.pop('assets', []),
      deps = kwargs.pop('deps', []) + APPLICATION_DEPS,
      supports_workers = True,
      **kwargs
    )
