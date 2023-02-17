load("//defs:defs.bzl", "xprof_ng_module")
load("@io_bazel_rules_sass//:defs.bzl", "sass_binary")

package(default_visibility = ["//frontend:internal"])

xprof_ng_module(
    name = "max_heap_chart",
    srcs = [
        "max_heap_chart.ts",
        "max_heap_chart_module.ts",
    ],
    allow_warnings = True,
    assets = [
        ":max_heap_chart_css",
        "max_heap_chart.ng.html",
    ],
    deps = [
        "@npm//@angular/core",
        "@npm//@types/google.visualization",
        "@org_xprof//frontend/app/common/interfaces",
        "@org_xprof//frontend/app/common/utils",
    ],
)

sass_binary(
    name = "max_heap_chart_css",
    src = "max_heap_chart.scss",
    sourcemap = False,
    deps = [
        "@org_xprof//frontend/app/styles:common",
    ],
)
