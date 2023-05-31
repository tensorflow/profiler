load("//defs:defs.bzl", "xprof_ng_module")
load("@npm//@bazel/concatjs:index.bzl", "ts_library")

package(default_visibility = ["//frontend:internal"])

xprof_ng_module(
    name = "chart",
    srcs = [
        "chart.ts",
    ],
    deps = [
        "@npm//@angular/core",
        "@org_xprof//frontend/app/common/interfaces:chart",
    ],
)

xprof_ng_module(
    name = "default_data_provider",
    srcs = [
        "default_data_provider.ts",
    ],
    deps = [
        "@npm//@angular/core",
        "@org_xprof//frontend/app/common/interfaces",
        "@org_xprof//frontend/app/common/interfaces:chart",
    ],
)

ts_library(
    name = "data_processor",
    srcs = [
        "category_diff_table_data_processor.ts",
        "category_table_data_processor.ts",
        "filter_data_processor.ts",
        "xy_table_data_processor.ts",
    ],
    deps = [
        ":utils",
        "@org_xprof//frontend/app/common/interfaces",
        "@org_xprof//frontend/app/common/interfaces:chart",
    ],
)

ts_library(
    name = "chart_options",
    srcs = [
        "chart_options.ts",
    ],
    deps = [
        "@npm//@types/google.visualization",
    ],
)

ts_library(
    name = "utils",
    srcs = [
        "table_utils.ts",
    ],
    deps = [
        "@org_xprof//frontend/app/common/interfaces:chart",
    ],
)
