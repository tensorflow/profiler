load("@npm_angular_bazel//:index.bzl", "ng_module")
load("@npm_bazel_typescript//:index.bzl", "ts_library")
load("@io_bazel_rules_sass//:defs.bzl", "sass_binary")

package(default_visibility = ["//frontend:internal"])

ng_module(
    name = "device_side_analysis_detail",
    srcs = [
        "device_side_analysis_detail.ts",
        "device_side_analysis_detail_module.ts",
    ],
    assets = [
        ":device_side_analysis_detail_css",
        "device_side_analysis_detail.ng.html",
    ],
    deps = [
        ":device_side_analysis_detail_data_provider",
        "@npm//@angular/core",
        "@org_xprof//frontend/app/common/interfaces",
        "@org_xprof//frontend/app/common/interfaces:chart",
        "@org_xprof//frontend/app/components/chart",
    ],
)

ts_library(
    name = "device_side_analysis_detail_data_provider",
    srcs = [
        "device_side_analysis_detail_data_provider.ts",
    ],
    deps = [
        "@org_xprof//frontend/app/common/interfaces",
        "@org_xprof//frontend/app/common/typing/google_visualization",
        "@org_xprof//frontend/app/components/chart:default_data_provider",
    ],
)



sass_binary(
    name = "device_side_analysis_detail_css",
    src = "device_side_analysis_detail.scss",

    sourcemap = False,

    deps = [
        "@org_xprof//frontend/app/styles:common",
    ],
)
