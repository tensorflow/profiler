load("@npm_angular_bazel//:index.bzl", "ng_module")
load("@npm_bazel_typescript//:index.bzl", "ts_library")

package(default_visibility = ["//frontend:internal"])

ng_module(
    name = "chart",
    srcs = [
        "chart.ts",
    ],
    deps = [
        "@npm//@angular/core",
        "@org_xprof//frontend/app/common/interfaces",
        "@org_xprof//frontend/app/common/interfaces:chart",
        "@org_xprof//frontend/app/common/typing/google_visualization",
    ],
)

ts_library(
    name = "default_data_provider",
    srcs = [
        "default_data_provider.ts",
    ],
    deps = [
        ":utils",
        "@npm//@angular/core",
        "@org_xprof//frontend/app/common/interfaces:chart",
        "@org_xprof//frontend/app/common/typing/google_visualization",
    ],
)

ts_library(
    name = "data_processor",
    srcs = [
        "category_diff_table_data_processor.ts",
        "category_table_data_processor.ts",
        "xy_table_data_processor.ts",
    ],
    deps = [
        ":utils",
        "@org_xprof//frontend/app/common/interfaces",
        "@org_xprof//frontend/app/common/interfaces:chart",
        "@org_xprof//frontend/app/common/typing/google_visualization",
    ],
)

ts_library(
    name = "chart_options",
    srcs = [
        "chart_options.ts",
    ],
    deps = [
        "@org_xprof//frontend/app/common/typing/google_visualization",
    ],
)

ts_library(
    name = "utils",
    srcs = [
        "table_utils.ts",
    ],
    deps = [
        "@org_xprof//frontend/app/common/interfaces:chart",
        "@org_xprof//frontend/app/common/typing/google_visualization",
    ],
)

ts_library(
    name = "data_info_utils",
    srcs = [
        "data_info_utils.ts",
    ],
    deps = [
        ":chart_options",
        ":data_processor",
        ":default_data_provider",
        "@org_xprof//frontend/third_party/google_visualization",
        "@org_xprof//frontend/app/common/interfaces",
        "@org_xprof//frontend/app/common/interfaces:chart",
    ],
)


