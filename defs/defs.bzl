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

load("@npm_bazel_typescript//:index.bzl", "ts_library")

def xprof_ng_module(assets = [], **kwargs):
    """Wrapper for Angular modules for the external BUILD rules"""

    # A hack to include @angular/common, @angular/core since the ng_module
    # macro in google3 automatically adds this dep.
    # See: https://source.corp.google.com/google3/javascript/angular2/ng_module.bzl
    if "@npm//@angular/common" not in kwargs['deps']:
      kwargs['deps'] += ["@npm//@angular/common"]
    if "@npm//@angular/core" not in kwargs['deps']:
      kwargs['deps'] += ["@npm//@angular/core"]

    ts_library(
        compiler = "//defs:tsc_wrapped_with_angular",
        supports_workers = True,
        use_angular_plugin = True,
        angular_assets = assets,
        **kwargs
    )
