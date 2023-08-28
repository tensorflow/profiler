load("@io_bazel_rules_sass//:defs.bzl", "sass_binary")
load("//defs:defs.bzl", "xprof_ng_module")

package(default_visibility = ["//frontend:internal"])

xprof_ng_module(
    name = "dcn_collective_stats",
    srcs = [
        "dcn_collective_stats.ts",
        "dcn_collective_stats_module.ts",
    ],
    assets = [
        ":dcn_collective_stats_css",
        "dcn_collective_stats.ng.html",
    ],
    deps = [
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//@angular/router",
        "@npm//@ngrx/store",
        "@npm//@types/google.visualization",
        "@npm//rxjs",
        "@org_xprof//frontend/app/common/interfaces",
        "@org_xprof//frontend/app/common/interfaces:chart",
        "@org_xprof//frontend/app/common/utils",
        "@org_xprof//frontend/app/components/chart",
        "@org_xprof//frontend/app/components/chart:chart_options",
        "@org_xprof//frontend/app/components/chart:default_data_provider",
        "@org_xprof//frontend/app/components/chart/dashboard",
        "@org_xprof//frontend/app/services/data_service",
        "@org_xprof//frontend/app/store",
    ],
)

sass_binary(
    name = "dcn_collective_stats_css",
    src = "dcn_collective_stats.scss",
    sourcemap = False,
    deps = [
        "@org_xprof//frontend/app/styles:common",
    ],
)
