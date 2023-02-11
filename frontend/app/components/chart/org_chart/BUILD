load("//defs:defs.bzl", "xprof_ng_module")
load("@io_bazel_rules_sass//:defs.bzl", "sass_binary")

package(default_visibility = ["//frontend:internal"])

xprof_ng_module(
    name = "org_chart",
    srcs = [
        "org_chart.ts",
        "org_chart_module.ts",
    ],
    assets = [
        ":org_chart_css",
        "org_chart.ng.html",
    ],
    deps = [
        "@npm//@angular/core",
        "@npm//@types/google.visualization",
    ],
)

sass_binary(
    name = "org_chart_css",
    src = "org_chart.scss",
    sourcemap = False,
)
