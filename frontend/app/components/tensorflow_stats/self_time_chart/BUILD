load("@npm_angular_bazel//:index.bzl", "ng_module")
load("@npm_bazel_typescript//:index.bzl", "ts_library")
load("@io_bazel_rules_sass//:defs.bzl", "sass_binary")

package(default_visibility = ["//frontend:internal"])

ng_module(
    name = "self_time_chart",
    srcs = [
        "self_time_chart.ts",
        "self_time_chart_module.ts",
    ],
    assets = [
        ":self_time_chart_css",
        "self_time_chart.ng.html",
    ],
    deps = [
        ":self_time_chart_data_provider",
        "@npm//@angular/core",
        "@org_xprof//frontend/app/common/angular:angular_material_card",
        "@org_xprof//frontend/app/common/constants",
        "@org_xprof//frontend/app/common/interfaces",
        "@org_xprof//frontend/app/common/interfaces:chart",
        "@org_xprof//frontend/app/components/chart",
    ],
)

ts_library(
    name = "self_time_chart_data_provider",
    srcs = [
        "self_time_chart_data_provider.ts",
    ],
    deps = [
        "@npm//@angular/core",
        "@org_xprof//frontend/app/common/constants",
        "@org_xprof//frontend/app/common/typing/google_visualization",
        "@org_xprof//frontend/app/components/chart:default_data_provider",
    ],
)



sass_binary(
    name = "self_time_chart_css",
    src = "self_time_chart.scss",

    sourcemap = False,
    deps = [
        "@org_xprof//frontend/app/styles:common",
    ],
)
