load("@npm_angular_bazel//:index.bzl", "ng_module")
load("@io_bazel_rules_sass//:defs.bzl", "sass_binary")

package(default_visibility = ["//frontend:__subpackages__"])

ng_module(
    name = "op_profile",
    srcs = [
        "op_profile.ts",
        "op_profile_data.ts",
        "op_profile_module.ts",
    ],
    assets = [
        ":op_profile_css",
        "op_profile.ng.html",
    ],
    deps = [
        "@npm//@angular/core",
        "@org_xprof//frontend/app/common/angular:angular_material_form_field",
        "@org_xprof//frontend/app/common/angular:angular_material_input",
        "@org_xprof//frontend/app/common/angular:angular_material_slide_toggle",
        "@org_xprof//frontend/app/common/angular:angular_material_slider",
        "@npm//@angular/router",
        "@npm//@ngrx/store",
        "@org_xprof//frontend/app/common/interfaces",
        "@org_xprof//frontend/app/common/interfaces:op_profile_proto_defs",
        "@org_xprof//frontend/app/common/utils",
        "@org_xprof//frontend/app/components/op_profile/op_table",
        "@org_xprof//frontend/app/services/data_service",
        "@org_xprof//frontend/app/store",
    ],
)



sass_binary(
    name = "op_profile_css",
    src = "op_profile.scss",
    sass_stack = False,
    sourcemap = False,
    deps = [
        "@org_xprof//frontend/app/styles:common",
    ],
)
