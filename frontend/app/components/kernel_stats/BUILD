load("@npm_angular_bazel//:index.bzl", "ng_module")
load("@io_bazel_rules_sass//:defs.bzl", "sass_binary")

package(default_visibility = ["//frontend:internal"])

ng_module(
    name = "kernel_stats_adapter",
    srcs = [
        "kernel_stats_adapter.ts",
    ],
    deps = [
        ":kernel_stats",
        "@npm//@angular/core",
        "@npm//@angular/router",
        "@npm//@ngrx/store",
        "@npm//rxjs",
        "@org_xprof//frontend/app/common/constants",
        "@org_xprof//frontend/app/common/interfaces",
        "@org_xprof//frontend/app/store",
    ],
)

ng_module(
    name = "kernel_stats",
    srcs = [
        "kernel_stats.ts",
        "kernel_stats_module.ts",
    ],
    assets = [
        ":kernel_stats_css",
        "kernel_stats.ng.html",
    ],
    deps = [
        "@npm//@angular/core",
        "@org_xprof//frontend/app/common/angular:angular_material_divider",
        "@npm//@ngrx/store",
        "@org_xprof//frontend/app/common/interfaces",
        "@org_xprof//frontend/app/components/controls/export_as_csv",
        "@org_xprof//frontend/app/components/kernel_stats/kernel_stats_chart",
        "@org_xprof//frontend/app/components/kernel_stats/kernel_stats_table",
        "@org_xprof//frontend/app/store/common_data_store",
    ],
)



sass_binary(
    name = "kernel_stats_css",
    src = "kernel_stats.scss",

    sourcemap = False,

    deps = [
        "@org_xprof//frontend/app/styles:common",
    ],
)
