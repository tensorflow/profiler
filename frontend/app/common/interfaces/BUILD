load("@npm//@bazel/typescript:index.bzl", "ts_library")

package(default_visibility = ["//frontend:internal"])

ts_library(
    name = "op_profile_proto_defs",
    srcs = [
        ":op_profile.jsonpb_decls.d.ts",
    ],
)

ts_library(
    name = "xla_proto_defs",
    srcs = [
        ":hlo.jsonpb_decls.d.ts",
        ":xla_data.jsonpb_decls.d.ts",
    ],
)

ts_library(
    name = "memory_profile_proto_defs",
    srcs = [
        ":memory_profile.jsonpb_decls.d.ts",
    ],
)

ts_library(
    name = "memory_viewer_preprocess_proto_defs",
    srcs = [
        ":memory_viewer_preprocess.jsonpb_decls.d.ts",
    ],
)

ts_library(
    name = "interfaces",
    srcs = [
        "buffer_allocation_info.ts",
        "capture_profile.ts",
        "data_table.ts",
        "diagnostics.ts",
        "heap_object.ts",
        "navigation_event.ts",
        "op_profile_node.ts",
        "summary_info.ts",
        "tool.ts",
        "window.ts",
        "graph_viewer.ts",
    ],
    deps = [
        ":memory_profile_proto_defs",
        ":memory_viewer_preprocess_proto_defs",
        ":op_profile_proto_defs",
        ":xla_proto_defs",
    ],
)

ts_library(
    name = "chart",
    srcs = [
        "chart.ts",
    ],
    deps = [
        ":interfaces",
        "@npm//@types/google.visualization",
    ],
)
