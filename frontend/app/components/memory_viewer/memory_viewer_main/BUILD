load("//defs:defs.bzl", "xprof_ng_module")
load("@io_bazel_rules_sass//:defs.bzl", "sass_binary")

package(default_visibility = ["//frontend:internal"])

xprof_ng_module(
    name = "memory_viewer_main",
    srcs = [
        "memory_viewer_main.ts",
        "memory_viewer_main_module.ts",
    ],
    assets = [
        ":memory_viewer_main_css",
        "memory_viewer_main.ng.html",
    ],
    deps = [
        "@npm//@angular/core",
        "@npm//@angular/forms",
        "@npm//@angular/router",
        "//third_party/javascript/angular_components:material_checkbox",
        "//third_party/javascript/angular_components:material_divider",
        "//third_party/javascript/angular_components:material_icon",
        "//third_party/javascript/angular_components:material_tooltip",
        "@npm//@ngrx/store",
        "@org_xprof//frontend/app/common/interfaces",
        "@org_xprof//frontend/app/common/utils",
        "@org_xprof//frontend/app/components/diagnostics_view",
        "@org_xprof//frontend/app/components/memory_viewer/max_heap_chart",
        "@org_xprof//frontend/app/components/memory_viewer/memory_usage",
        "@org_xprof//frontend/app/components/memory_viewer/program_order_chart",
        "@org_xprof//frontend/app/services/data_service",
        "@org_xprof//frontend/app/store",
    ],
)



sass_binary(
    name = "memory_viewer_main_css",
    src = "memory_viewer_main.scss",

    sourcemap = False,

    deps = [
        "@org_xprof//frontend/app/styles:common",
    ],
)
