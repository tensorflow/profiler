load("//defs:defs.bzl", "xprof_ng_module")
load("@npm//@bazel/concatjs:index.bzl", "ts_library")
load("@io_bazel_rules_sass//:defs.bzl", "sass_binary")

package(default_visibility = ["//frontend:internal"])

xprof_ng_module(
    name = "operations_table",
    srcs = [
        "operations_table.ts",
        "operations_table_module.ts",
    ],
    assets = [
        ":operations_table_css",
        "operations_table.ng.html",
    ],
    deps = [
        ":operations_table_data_provider",
        "@npm//@angular/core",
        "@org_xprof//frontend/app/common/constants",
        "@org_xprof//frontend/app/common/interfaces",
        "@org_xprof//frontend/app/common/interfaces:chart",
        "@org_xprof//frontend/app/components/chart",
    ],
)

ts_library(
    name = "operations_table_data_provider",
    srcs = [
        "operations_table_data_provider.ts",
    ],
    deps = [
        "@npm//@angular/core",
        "@org_xprof//frontend/app/common/constants",
        "@org_xprof//frontend/app/common/interfaces",
        "@org_xprof//frontend/app/common/interfaces:chart",
        "@org_xprof//frontend/app/components/chart:default_data_provider",
        "@org_xprof//frontend/app/components/chart:utils",
    ],
)

sass_binary(
    name = "operations_table_css",
    src = "operations_table.scss",
    sourcemap = False,
    deps = [
        "@org_xprof//frontend/app/styles:common",
    ],
)
