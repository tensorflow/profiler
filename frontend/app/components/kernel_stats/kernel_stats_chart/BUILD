load("//defs:defs.bzl", "xprof_ng_module")
load("@io_bazel_rules_sass//:defs.bzl", "sass_binary")

package(default_visibility = ["//frontend:internal"])

xprof_ng_module(
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
        "//third_party/javascript/angular_components:material_form_field",
        "//third_party/javascript/angular_components:material_input",
        "//third_party/javascript/angular_components:material_slider",
        "@npm//@types/google.visualization",
        "@org_xprof//frontend/app/common/interfaces",
    ],
)



sass_binary(
    name = "kernel_stats_chart_css",
    src = "kernel_stats_chart.scss",

    sourcemap = False,

    deps = [
        "@org_xprof//frontend/app/styles:common",
    ],
)
