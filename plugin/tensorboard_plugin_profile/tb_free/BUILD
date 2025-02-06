load("@rules_python//python:defs.bzl", "py_library")

# Description:
#   A collection of classes to bypass Tensorboard dependencies.
package(
    default_visibility = ["//plugin:internal"],
    licenses = ["notice"],  # Apache 2.0
)

py_library(
    name = "all_libs",
    deps = [
        ":base_plugin",
        ":context",
        ":plugin_asset_util",
    ],
)

py_library(
    name = "base_plugin",
    srcs = ["base_plugin.py"],
    srcs_version = "PY2AND3",
    deps = [],
)

py_library(
    name = "context",
    srcs = ["context.py"],
    srcs_version = "PY2AND3",
    deps = [
        "//:expect_tensorflow_installed",
    ],
)

py_library(
    name = "plugin_asset_util",
    srcs = ["plugin_asset_util.py"],
    srcs_version = "PY2AND3",
    deps = [],
)
