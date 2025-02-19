load("@local_xla//xla/tsl:tsl.default.bzl", "tsl_pybind_extension")
load("//plugin/tensorboard_plugin_profile/build_utils:strict.default.bzl", "py_strict_test")
load("//third_party/bazel_rules/rules_cc/cc:cc_library.bzl", "cc_library")

package(default_visibility = ["//visibility:public"])

tsl_pybind_extension(
    name = "_pywrap_profiler_plugin",
    srcs = ["pywrap_profiler_plugin.cc"],
    pytype_srcs = [
        "_pywrap_profiler_plugin.pyi",
    ],
    deps = [
        ":profiler_plugin_impl",
        "@local_xla//xla/pjrt:status_casters",
        "@local_xla//xla/tsl/platform:types",
        "@local_xla//xla/tsl/profiler/rpc/client:capture_profile",
        "@org_tensorflow//tensorflow/core/profiler/convert:tool_options",
        "@pybind11",
    ],
)

py_strict_test(
    name = "profiler_wrapper_test",
    srcs = ["profiler_wrapper_test.py"],
    tags = [
        "no_pip",
    ],
    deps = [
        ":_pywrap_profiler_plugin",
        "@com_google_absl_py//absl/testing:absltest",
    ],
)

cc_library(
    name = "profiler_plugin_impl",
    srcs = ["profiler_plugin_impl.cc"],
    hdrs =
        ["profiler_plugin_impl.h"],
    deps = [
        "@com_google_absl//absl/log",
        "@com_google_absl//absl/status",
        "@com_google_absl//absl/status:statusor",
        "@local_tsl//tsl/profiler/protobuf:xplane_proto_cc_impl",
        "@local_xla//xla/tsl/platform:errors",
        "@local_xla//xla/tsl/platform:types",
        "@local_xla//xla/tsl/profiler/rpc/client:capture_profile",
        "@local_xla//xla/tsl/profiler/utils:session_manager",
        "@org_tensorflow//tensorflow/core/profiler/convert:repository",
        "@org_tensorflow//tensorflow/core/profiler/convert:tool_options",
        "@org_tensorflow//tensorflow/core/profiler/convert:xplane_to_tools_data",
    ],
)
