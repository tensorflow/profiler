load("@npm_angular_bazel//:index.bzl", "ng_module")
load("@npm_bazel_typescript//:index.bzl", "ts_library")
load("@io_bazel_rules_sass//:defs.bzl", "sass_binary")

package(default_visibility = ["//frontend:internal"])

ng_module(
    name = "stats_table",
    srcs = [
        "stats_table.ts",
        "stats_table_module.ts",
    ],
    assets = [
        ":stats_table_css",
        "stats_table.ng.html",
    ],
    deps = [
        ":stats_table_data_provider",
        "@npm//@angular/core",
        "@org_xprof//frontend/app/common/angular:angular_material_form_field",
        "@org_xprof//frontend/app/common/angular:angular_material_icon",
        "@org_xprof//frontend/app/common/angular:angular_material_input",
        "@org_xprof//frontend/app/common/interfaces",
        "@org_xprof//frontend/app/common/interfaces:chart",
        "@org_xprof//frontend/app/components/chart",
    ],
)

ts_library(
    name = "stats_table_data_provider",
    srcs = [
        "stats_table_data_provider.ts",
    ],
    deps = [
        "@npm//@angular/core",
        "@org_xprof//frontend/app/common/constants",
        "@org_xprof//frontend/app/common/interfaces:chart",
        "@org_xprof//frontend/app/common/typing/google_visualization",
        "@org_xprof//frontend/app/components/chart:default_data_provider",
    ],
)



sass_binary(
    name = "stats_table_css",
    src = "stats_table.scss",

    sourcemap = False,
    deps = [
        "@org_xprof//frontend/app/styles:common",
    ],
)
