load("//defs:defs.bzl", "xprof_ng_module")
load("@io_bazel_rules_sass//:defs.bzl", "sass_binary")

package(default_visibility = ["//frontend:internal"])

xprof_ng_module(
    name = "main_page",
    srcs = [
        "main_page.ts",
        "main_page_module.ts",
    ],
    assets = [
        ":main_page_css",
        "main_page.ng.html",
    ],
    deps = [
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//@angular/router",
        "@npm//@ngrx/store",
        "@npm//rxjs",
        "@org_xprof//frontend/app/common/angular:angular_material_icon",
        "@org_xprof//frontend/app/common/angular:angular_material_progress_bar",
        "@org_xprof//frontend/app/common/angular:angular_material_sidenav",
        "@org_xprof//frontend/app/common/angular:angular_material_toolbar",
        "@org_xprof//frontend/app/common/constants",
        "@org_xprof//frontend/app/common/interfaces",
        "@org_xprof//frontend/app/components/dcn_collective_stats",
        "@org_xprof//frontend/app/components/empty_page",
        "@org_xprof//frontend/app/components/graph_viewer",
        "@org_xprof//frontend/app/components/input_pipeline",
        "@org_xprof//frontend/app/components/kernel_stats:kernel_stats_adapter",
        "@org_xprof//frontend/app/components/memory_profile",
        "@org_xprof//frontend/app/components/memory_viewer",
        "@org_xprof//frontend/app/components/op_profile",
        "@org_xprof//frontend/app/components/overview",
        "@org_xprof//frontend/app/components/pod_viewer",
        "@org_xprof//frontend/app/components/sidenav",
        "@org_xprof//frontend/app/components/tensorflow_stats:tensorflow_stats_adapter",
        "@org_xprof//frontend/app/components/tf_data_bottleneck_analysis",
        "@org_xprof//frontend/app/components/trace_viewer",
        "@org_xprof//frontend/app/store",
    ],
)

sass_binary(
    name = "main_page_css",
    src = "main_page.scss",
    sourcemap = False,
    deps = [
        "@org_xprof//frontend/app/styles:common",
    ],
)
