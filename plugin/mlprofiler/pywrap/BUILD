load("@local_xla//xla/tsl:tsl.bzl", "if_macos")
load("@local_xla//xla/tsl:tsl.default.bzl", "tsl_pybind_extension")
load("//plugin/tensorboard_plugin_profile/build_utils:strict.default.bzl", "py_strict_test")

package(default_visibility = ["//visibility:public"])

tsl_pybind_extension(
    name = "_pywrap_profiler_plugin",
    srcs = ["pywrap_profiler_plugin.cc"],
    pytype_srcs = [
        "_pywrap_profiler_plugin.pyi",
    ],
    deps = [
        "@com_google_absl//absl/container:flat_hash_map",
        "@com_google_absl//absl/log",
        "@com_google_absl//absl/status",
        "@com_google_absl//absl/status:statusor",
        "@local_tsl//tsl/profiler/protobuf:profiler_analysis_proto_cc_impl",
        "@local_tsl//tsl/profiler/protobuf:profiler_options_proto_cc_impl",
        "@local_tsl//tsl/profiler/protobuf:profiler_service_monitor_result_proto_cc_impl",
        "@local_tsl//tsl/profiler/protobuf:profiler_service_proto_cc_impl",
        "@local_xla//xla:autotune_results_proto_cc_impl",
        "@local_xla//xla:autotuning_proto_cc_impl",
        "@local_xla//xla:xla_data_proto_cc_impl",
        "@local_xla//xla:xla_proto_cc_impl",
        "@local_xla//xla/pjrt:status_casters",
        "@local_xla//xla/service:hlo_proto_cc_impl",
        "@local_xla//xla/service:metrics_proto_cc_impl",
        "@local_xla//xla/service/gpu:backend_configs_cc_impl",
        "@local_xla//xla/service/gpu/model:hlo_op_profile_proto_cc_impl",
        "@local_xla//xla/stream_executor:device_description_proto_cc_impl",
        "@local_xla//xla/stream_executor/cuda:cuda_compute_capability_proto_cc_impl",
        "@local_xla//xla/tsl/framework:allocator_registry_impl",
        "@local_xla//xla/tsl/lib/io:table",
        "@local_xla//xla/tsl/platform:env_impl",
        "@local_xla//xla/tsl/platform/cloud:gcs_file_system",
        "@local_xla//xla/tsl/profiler/backends/cpu:traceme_recorder_impl",
        "@local_xla//xla/tsl/profiler/rpc:profiler_server_impl",
        "@local_xla//xla/tsl/profiler/rpc:profiler_service_impl",
        "@local_xla//xla/tsl/profiler/rpc/client:capture_profile",
        "@local_xla//xla/tsl/profiler/rpc/client:profiler_client_impl",
        "@local_xla//xla/tsl/profiler/utils:session_manager",
        "@local_xla//xla/tsl/profiler/utils:time_utils_impl",
        "@local_xla//xla/tsl/protobuf:bfc_memory_map_proto_cc_impl",
        "@local_xla//xla/tsl/protobuf:dnn_proto_cc_impl",
        "@local_xla//xla/tsl/protobuf:error_codes_proto_impl_cc_impl",
        "@local_xla//xla/tsl/protobuf:histogram_proto_cc_impl",
        "@local_xla//xla/tsl/protobuf:rpc_options_proto_cc_impl",
        "@local_xla//xla/tsl/protobuf:test_log_proto_cc_impl",
        "@org_tensorflow//tensorflow/core/profiler/convert:repository",
        "@org_tensorflow//tensorflow/core/profiler/convert:tool_options",
        "@org_tensorflow//tensorflow/core/profiler/convert:xplane_to_tools_data",
        "@pybind11",
    ] + if_macos([
        "@local_xla//xla/tsl/lib/histogram",
        "@local_xla//xla/tsl/lib/io:record_writer",
        "@local_xla//xla/tsl/lib/monitoring:collection_registry",
        "@local_xla//xla/tsl/lib/monitoring:sampler",
        "@local_tsl//tsl/platform:random",
        "@local_xla//xla/tsl/platform:resource",
        "@local_tsl//tsl/profiler/lib:profiler_factory_impl",
        "@local_tsl//tsl/profiler/lib:profiler_session_impl",
    ]),
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
