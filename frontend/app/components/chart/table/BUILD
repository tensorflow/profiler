load("//defs:defs.bzl", "xprof_ng_module")
load("@io_bazel_rules_sass//:defs.bzl", "sass_binary")

package(default_visibility = ["//frontend:internal"])

xprof_ng_module(
    name = "table",
    srcs = [
        "table.ts",
        "table_module.ts",
    ],
    assets = [
        ":table_css",
        "table.ng.html",
    ],
    deps = [
        "@npm//@angular/core",
        "//third_party/javascript/angular_components:material_core",
        "//third_party/javascript/angular_components:material_form_field",
        "//third_party/javascript/angular_components:material_select",
        "@npm//@types/google.visualization",
    ],
)



sass_binary(
    name = "table_css",
    src = "table.scss",

    sourcemap = False,

)
