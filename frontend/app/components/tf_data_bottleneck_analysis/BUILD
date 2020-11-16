load("@npm_bazel_typescript//:index.bzl", "ts_library")
load("@io_bazel_rules_sass//:defs.bzl", "sass_binary")
load("@npm_angular_bazel//:index.bzl", "ng_module")

package(default_visibility = ["//frontend:internal"])

ng_module(
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
        "@org_xprof//frontend/app/common/angular:angular_material_divider",
        "@npm//@angular/router",
        "@npm//@ngrx/store",
        "@org_xprof//frontend/app/common/interfaces",
        "@org_xprof//frontend/app/components/chart/dashboard",
        "@org_xprof//frontend/app/components/chart/org_chart",
        "@org_xprof//frontend/app/components/chart/table",
        "@org_xprof//frontend/app/components/controls/category_filter",
        "@org_xprof//frontend/app/services/data_service",
        "@org_xprof//frontend/app/store",
    ],
)

ts_library(
    name = "tf_data_bottleneck_analysis_tests",
    testonly = True,
)

sass_binary(
    name = "tf_data_bottleneck_analysis_css",
    src = "tf_data_bottleneck_analysis.scss",
    sourcemap = False,

)