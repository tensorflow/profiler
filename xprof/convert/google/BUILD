load("@org_tensorflow//tensorflow:tensorflow.bzl", "tf_cc_test")

# copybara:uncomment package(default_applicable_licenses = ["@org_tensorflow//tensorflow:license"])

tf_cc_test(
    name = "hlo_proto_to_graph_view_test",
    size = "small",
    srcs = ["hlo_proto_to_graph_view_test.cc"],
    deps = [
        "//net/proto2/contrib/fixtures:proto-fixture-repository",
        "@com_google_absl//absl/status:statusor",
        "@com_google_absl//absl/strings",
        "@com_google_googletest//:gtest_main",
        "@local_xla//xla/service:hlo_graph_dumper",
        "@local_xla//xla/service:hlo_proto_cc",
        "@local_xla//xla/tsl/platform:statusor",
        "@org_tensorflow//tensorflow/core:test",
        "@org_tensorflow//tensorflow/core:test_main",
        "@org_tensorflow//tensorflow/core/profiler/convert:hlo_proto_to_graph_view",
    ],
)

tf_cc_test(
    name = "xspace_to_dcn_slack_analysis_test",
    srcs = ["xspace_to_dcn_slack_analysis_test.cc"],
    deps = [
        "@com_google_absl//absl/container:flat_hash_map",
        "@com_google_absl//absl/strings",
        "@com_google_googletest//:gtest_main",
        "@local_tsl//tsl/profiler/protobuf:xplane_proto_cc",
        "@local_xla//xla/hlo/ir:hlo",
        "@local_xla//xla/tsl/profiler/utils:math_utils",
        "@local_xla//xla/tsl/profiler/utils:tf_xplane_visitor",
        "@local_xla//xla/tsl/profiler/utils:timespan",
        "@local_xla//xla/tsl/profiler/utils:xplane_builder",
        "@local_xla//xla/tsl/profiler/utils:xplane_schema",
        "@local_xla//xla/tsl/profiler/utils:xplane_visitor",
        "@org_tensorflow//tensorflow/core/profiler/convert:xspace_to_dcn_slack_analysis",
        "@org_tensorflow//tensorflow/core/profiler/utils:hlo_proto_map",
        "@org_xprof//plugin/tensorboard_plugin_profile/protobuf:dcn_collective_info_proto_cc",
        "@org_xprof//plugin/tensorboard_plugin_profile/protobuf:dcn_slack_analysis_proto_cc",
    ],
)

tf_cc_test(
    name = "dcn_slack_analysis_combiner_test",
    srcs = ["dcn_slack_analysis_combiner_test.cc"],
    deps = [
        "//net/proto2/contrib/parse_proto:parse_text_proto",
        "@com_google_googletest//:gtest_main",
        "@org_tensorflow//tensorflow/core/profiler/convert:dcn_slack_analysis_combiner",
        "@org_xprof//plugin/tensorboard_plugin_profile/protobuf:dcn_slack_analysis_proto_cc",
    ],
)

exports_files(
    ["tpu_input_pipeline_analysis_constants.cc"],
    visibility = ["@org_tensorflow//tensorflow/core/profiler/convert:__pkg__"],
)
