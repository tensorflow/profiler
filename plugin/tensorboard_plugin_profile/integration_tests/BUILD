load("//plugin/tensorboard_plugin_profile/build_utils:pytype.default.bzl", "pytype_strict_library")

visibility = ["//plugin:internal"]

package(
    default_visibility = visibility,
    licenses = ["notice"],  # Apache 2.0
)

pytype_strict_library(
    name = "tf_mnist",
    srcs = ["tf_mnist.py"],
    srcs_version = "PY2AND3",
    visibility = visibility,
    deps = [],
)

pytype_strict_library(
    name = "tf_profiler_session",
    srcs = ["tf_profiler_session.py"],
    srcs_version = "PY2AND3",
    visibility = visibility,
    deps = [],
)

filegroup(
    name = "resources",
    srcs = [
        "__init__.py",
    ],
)
