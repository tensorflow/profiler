load("//defs:defs.bzl", "xprof_ng_module")
load("@io_bazel_rules_sass//:defs.bzl", "sass_binary")

package(default_visibility = ["//frontend:internal"])

xprof_ng_module(
    name = "string_filter",
    srcs = [
        "string_filter.ts",
        "string_filter_module.ts",
    ],
    assets = [
        "string_filter.ng.html",
        "string_filter_css",
    ],
    
    deps = [
        "@npm//@angular/common",
        "@npm//@angular/core",
        "//third_party/javascript/angular_components:material_form_field",
        "//third_party/javascript/angular_components:material_icon",
        "//third_party/javascript/angular_components:material_input",
        "@npm//@types/google.visualization",
    ],
)

sass_binary(
    name = "string_filter_css",
    src = "string_filter.scss",

    sourcemap = False,

    deps = [
        "@org_xprof//frontend/app/styles:common",
    ],
)
