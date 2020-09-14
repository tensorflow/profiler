load("@npm_angular_bazel//:index.bzl", "ng_module")
load("@npm_bazel_typescript//:index.bzl", "ts_library")
load("@io_bazel_rules_sass//:defs.bzl", "sass_binary")

package(default_visibility = ["//frontend:internal"])

ng_module(
    name = "pie_chart",
    srcs = [
        "pie_chart.ts",
        "pie_chart_module.ts",
    ],
    assets = [
        ":pie_chart_css",
        "pie_chart.ng.html",
    ],
    deps = [
        ":pie_chart_data_provider",
        "@npm//@angular/core",
        "@org_xprof//frontend/app/common/angular:angular_material_card",
        "@org_xprof//frontend/app/common/constants",
        "@org_xprof//frontend/app/common/interfaces",
        "@org_xprof//frontend/app/common/interfaces:chart",
        "@org_xprof//frontend/app/components/chart",
    ],
)

ts_library(
    name = "pie_chart_data_provider",
    srcs = [
        "pie_chart_data_provider.ts",
    ],
    deps = [
        "@npm//@angular/core",
        "@org_xprof//frontend/app/common/constants",
        "@org_xprof//frontend/app/common/interfaces",
        "@org_xprof//frontend/app/common/typing/google_visualization",
        "@org_xprof//frontend/app/components/chart:default_data_provider",
        "@org_xprof//frontend/app/components/chart:utils",
    ],
)



sass_binary(
    name = "pie_chart_css",
    src = "pie_chart.scss",

    sourcemap = False,
    deps = [
        "@org_xprof//frontend/app/styles:common",
    ],
)
