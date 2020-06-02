load("@npm_angular_bazel//:index.bzl", "ng_module")
load("@io_bazel_rules_sass//:defs.bzl", "sass_binary")

package(default_visibility = ["//frontend:internal"])

ng_module(
    name = "kernel_stats_chart",
    srcs = [
        "kernel_stats_chart.ts",
        "kernel_stats_chart_module.ts",
    ],
    assets = [
        ":kernel_stats_chart_css",
        "kernel_stats_chart.ng.html",
    ],
    deps = [
        "@npm//@angular/core",
        "@org_xprof//frontend/third_party/google_visualization",
        "@org_xprof//frontend/app/common/interfaces",
    ],
)



sass_binary(
    name = "kernel_stats_chart_css",
    src = "kernel_stats_chart.scss",

    sourcemap = False,
)
