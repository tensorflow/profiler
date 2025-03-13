# Description:
#  Protobufs used by TensorBoard profile plugin.

load("@com_google_protobuf//:protobuf.bzl", "py_proto_library")
load("@local_xla//xla/tsl/platform:build_config.bzl", xprof_proto_library = "tf_proto_library")

package(
    default_visibility = [
        "//plugin:internal",
        "@org_tensorflow//tensorflow/core/profiler/protobuf:__subpackages__",
    ],
    licenses = ["notice"],  # Apache 2.0
)

xprof_proto_library(
    name = "dcn_slack_analysis_proto",
    srcs = ["dcn_slack_analysis.proto"],
)

xprof_proto_library(
    name = "diagnostics_proto",
    srcs = ["diagnostics.proto"],
)

xprof_proto_library(
    name = "hlo_stats_proto",
    srcs = ["hlo_stats.proto"],
)

xprof_proto_library(
    name = "inference_stats_proto",
    srcs = ["inference_stats.proto"],
)

xprof_proto_library(
    name = "input_pipeline_proto",
    srcs = ["input_pipeline.proto"],
    protodeps = [":diagnostics_proto"],
)

xprof_proto_library(
    name = "kernel_stats_proto",
    srcs = ["kernel_stats.proto"],
)

xprof_proto_library(
    name = "overview_page_proto",
    srcs = ["overview_page.proto"],
    protodeps = [
        ":diagnostics_proto",
        ":input_pipeline_proto",
        ":power_metrics_proto",
    ],
)

xprof_proto_library(
    name = "power_metrics_proto",
    srcs = ["power_metrics.proto"],
)

xprof_proto_library(
    name = "roofline_model_proto",
    srcs = ["roofline_model.proto"],
    protodeps = [":diagnostics_proto"],
)

xprof_proto_library(
    name = "tf_data_stats_proto",
    srcs = ["tf_data_stats.proto"],
)

xprof_proto_library(
    name = "tf_stats_proto",
    srcs = ["tf_stats.proto"],
)

xprof_proto_library(
    name = "tpu_input_pipeline_proto",
    srcs = ["tpu_input_pipeline.proto"],
    protodeps = [":input_pipeline_proto"],
)

xprof_proto_library(
    name = "trace_events_proto",
    srcs = ["trace_events.proto"],
)

xprof_proto_library(
    name = "protos_all",
    create_go_proto = False,
    create_java_proto = False,
    protodeps = [
        ":dcn_slack_analysis_proto",
        ":diagnostics_proto",
        ":hlo_stats_proto",
        ":inference_stats_proto",
        ":input_pipeline_proto",
        ":kernel_stats_proto",
        ":overview_page_proto",
        ":power_metrics_proto",
        ":roofline_model_proto",
        ":tf_data_stats_proto",
        ":tf_stats_proto",
        ":tpu_input_pipeline_proto",
        ":trace_events_proto",
    ],
)

exports_files(
    srcs = [
        "dcn_slack_analysis.proto",
        "diagnostics.proto",
        "hlo_stats.proto",
        "inference_stats.proto",
        "input_pipeline.proto",
        "kernel_stats.proto",
        "overview_page.proto",
        "power_metrics.proto",
        "roofline_model.proto",
        "tf_data_stats.proto",
        "tf_stats.proto",
        "tpu_input_pipeline.proto",
        "trace_events.proto",
    ],
    visibility = [
        "@org_tensorflow//tensorflow/core/profiler/protobuf:__pkg__",
    ],
)
