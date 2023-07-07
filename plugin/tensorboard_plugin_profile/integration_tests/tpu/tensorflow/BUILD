load("//plugin/tensorboard_plugin_profile/build_utils:strict.default.bzl", "py_strict_library", "py_strict_test")
load("@org_xprof//plugin/tensorboard_plugin_profile/build_utils:profiler_test.bzl", "profiler_test")

# NOTE: need blaze test --define='with_tpu_support=true' for these tests.
profiler_test(
    name = "tpu_tf2_keras_xla_test",
    srcs = ["tpu_tf2_keras_test.py"],
    main = "tpu_tf2_keras_test.py",
    platforms = [
        "v2",
        "v3",
        "v4",
    ],
    deps = [
        "//:expect_tensorflow_installed",
        "//plugin/tensorboard_plugin_profile/convert:raw_to_tool_data",
        "//plugin/tensorboard_plugin_profile/integration_tests:tf_mnist",
        "//plugin/tensorboard_plugin_profile/integration_tests:tf_profiler_session",
        "@com_google_absl_py//absl/flags",
        "@com_google_absl_py//absl/logging",
        "@com_google_absl_py//absl/testing:absltest",
    ],
)

py_strict_library(
    name = "tpu_tf2_keras_xla",
    srcs = ["tpu_tf2_keras_test.py"],
    visibility = ["//plugin:__pkg__"],
    deps = [
        "//:expect_tensorflow_installed",
        "//plugin/tensorboard_plugin_profile/convert:raw_to_tool_data",
        "//plugin/tensorboard_plugin_profile/integration_tests:tf_mnist",
        "//plugin/tensorboard_plugin_profile/integration_tests:tf_profiler_session",
        "@com_google_absl_py//absl/flags",
        "@com_google_absl_py//absl/logging",
        "@com_google_absl_py//absl/testing:absltest",
    ],
)
