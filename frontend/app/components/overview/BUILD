load("//defs:defs.bzl", "xprof_ng_module")
load("@io_bazel_rules_sass//:defs.bzl", "sass_binary")

package(default_visibility = ["//frontend:internal"])

xprof_ng_module(
    name = "overview",
    srcs = [
        "overview.ts",
        "overview_common.ts",
        "overview_module.ts",
    ],
    assets = [
        ":overview_css",
        "overview.ng.html",
    ],
    deps = [
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//@angular/router",
        "@npm//@ngrx/store",
        "@npm//@types/google.visualization",
        "@npm//rxjs",
        "@org_xprof//frontend/app/common/interfaces",
        "@org_xprof//frontend/app/common/utils",
        "@org_xprof//frontend/app/components/diagnostics_view",
        "@org_xprof//frontend/app/components/overview/normalized_accelerator_performance_view",
        "@org_xprof//frontend/app/components/overview/performance_summary",
        "@org_xprof//frontend/app/components/overview/recommendation_result_view",
        "@org_xprof//frontend/app/components/overview/run_environment_view",
        "@org_xprof//frontend/app/components/overview/step_time_graph",
        "@org_xprof//frontend/app/components/overview/top_ops_table",
        "@org_xprof//frontend/app/services/data_service",
        "@org_xprof//frontend/app/store",
    ],
)

sass_binary(
    name = "overview_css",
    src = "overview.scss",
    sourcemap = False,
    deps = [
        "@org_xprof//frontend/app/styles:common",
    ],
)
