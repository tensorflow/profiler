load("//defs:defs.bzl", "xprof_ng_module")
load("@io_bazel_rules_sass//:defs.bzl", "sass_binary")

package(default_visibility = ["//frontend:internal"])

xprof_ng_module(
    name = "capture_profile_dialog",
    srcs = [
        "capture_profile_dialog.ts",
        "capture_profile_dialog_module.ts",
    ],
    assets = [
        ":capture_profile_dialog_css",
        "capture_profile_dialog.ng.html",
    ],
    deps = [
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//@angular/forms",
        "@npm//@angular/platform-browser",
        "//third_party/javascript/angular_components:material_button",
        "//third_party/javascript/angular_components:material_dialog",
        "//third_party/javascript/angular_components:material_expansion",
        "//third_party/javascript/angular_components:material_form_field",
        "//third_party/javascript/angular_components:material_input",
        "//third_party/javascript/angular_components:material_radio",
        "//third_party/javascript/angular_components:material_select",
        "//third_party/javascript/angular_components:material_tooltip",
        "@org_xprof//frontend/app/common/interfaces",
    ],
)



sass_binary(
    name = "capture_profile_dialog_css",
    src = "capture_profile_dialog.scss",

    sourcemap = False,

    deps = [
        "@org_xprof//frontend/app/styles:common",
    ],
)
