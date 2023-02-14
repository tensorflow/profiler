load("@io_bazel_rules_sass//:defs.bzl", "sass_binary")
load("//defs:defs.bzl", "xprof_ng_module")

package(default_visibility = ["//frontend:internal"])

xprof_ng_module(
    name = "tf_data_bottleneck_analysis",
    srcs = [
        "tf_data_bottleneck_analysis.ts",
        "tf_data_bottleneck_analysis_module.ts",
    ],
    assets = [
        ":tf_data_bottleneck_analysis_css",
        "tf_data_bottleneck_analysis.ng.html",
    ],
    deps = [
        "@npm//@angular/core",
        "@npm//@angular/router",
        "@npm//@ngrx/store",
        "@npm//rxjs",
        "@org_xprof//frontend/app/common/angular:angular_material_divider",
        "@org_xprof//frontend/app/common/interfaces",
        "@org_xprof//frontend/app/components/chart/dashboard",
        "@org_xprof//frontend/app/components/chart/org_chart",
        "@org_xprof//frontend/app/components/chart/table",
        "@org_xprof//frontend/app/components/controls/category_filter",
        "@org_xprof//frontend/app/services/data_service",
        "@org_xprof//frontend/app/store",
    ],
)

sass_binary(
    name = "tf_data_bottleneck_analysis_css",
    src = "tf_data_bottleneck_analysis.scss",
    sourcemap = False,
)
