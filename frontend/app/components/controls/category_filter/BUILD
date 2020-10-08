load("@npm_angular_bazel//:index.bzl", "ng_module")
load("@io_bazel_rules_sass//:defs.bzl", "sass_binary")

package(default_visibility = ["//frontend:internal"])

ng_module(
    name = "category_filter",
    srcs = [
        "category_filter.ts",
        "category_filter_module.ts",
    ],
    assets = [
        "category_filter.ng.html",
        ":category_filter_css",
    ],
    deps = [
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@org_xprof//frontend/app/common/angular:angular_material_core",
        "@org_xprof//frontend/app/common/angular:angular_material_form_field",
        "@org_xprof//frontend/app/common/angular:angular_material_select",
        "@org_xprof//frontend/app/common/typing/google_visualization",
    ],
)

sass_binary(
    name = "category_filter_css",
    src = "category_filter.scss",

    sourcemap = False,
)
