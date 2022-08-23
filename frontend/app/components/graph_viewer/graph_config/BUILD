load("@io_bazel_rules_sass//:defs.bzl", "sass_binary")
load("//defs:defs.bzl", "xprof_ng_module")

package(default_visibility = ["//frontend:internal"])

xprof_ng_module(
    name = "graph_config",
    srcs = [
        "graph_config.ts",
        "graph_config_module.ts",
    ],
    assets = [
        ":graph_config_css",
        "graph_config.ng.html",
    ],
    deps = [
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//@angular/forms",
        "//third_party/javascript/angular_components:material_button",
        "//third_party/javascript/angular_components:material_checkbox",
        "//third_party/javascript/angular_components:material_core",
        "//third_party/javascript/angular_components:material_form_field",
        "//third_party/javascript/angular_components:material_icon",
        "//third_party/javascript/angular_components:material_input",
        "//third_party/javascript/angular_components:material_select",
        "//third_party/javascript/angular_components:material_sidenav",
        "//third_party/javascript/angular_components:material_tooltip",
        "@npm//rxjs",
        "@org_xprof//frontend/app/common/interfaces",
    ],
)

sass_binary(
    name = "graph_config_css",
    src = "graph_config.scss",

    sourcemap = False,

    deps = [
        "@org_xprof//frontend/app/styles:common",
    ],
)
