load("//defs:defs.bzl", "xprof_ng_module")
load("@io_bazel_rules_sass//:defs.bzl", "sass_binary")

package(default_visibility = ["//frontend:internal"])

xprof_ng_module(
    name = "export_as_csv",
    srcs = [
        "export_as_csv.ts",
        "export_as_csv_module.ts",
    ],
    assets = [
        "export_as_csv.ng.html",
        ":export_as_csv_css",
    ],
    deps = [
        "@npm//@angular/common",
        "@npm//@angular/core",
        "//third_party/javascript/angular_components:material_icon",
        "@npm//@ngrx/store",
        "@org_xprof//frontend/app/store",
    ],
)

sass_binary(
    name = "export_as_csv_css",
    src = "export_as_csv.scss",

    sourcemap = False,

    deps = [
        "@org_xprof//frontend/app/styles:common",
    ],
)
