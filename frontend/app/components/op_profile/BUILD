load("//defs:defs.bzl", "xprof_ng_module")
load("@npm//@bazel/typescript:index.bzl", "ts_library")
load("@io_bazel_rules_sass//:defs.bzl", "sass_binary", "sass_library")

package(default_visibility = ["//frontend:internal"])

xprof_ng_module(
    name = "op_profile",
    srcs = [
        "op_profile.ts",
        "op_profile_module.ts",
    ],
    assets = [
        ":op_profile_css",
        "op_profile.ng.html",
    ],
    
    deps = [
        ":op_profile_base",
        "@npm//@angular/core",
        "@npm//@angular/router",
        "//third_party/javascript/angular_components:material_form_field",
        "//third_party/javascript/angular_components:material_icon",
        "//third_party/javascript/angular_components:material_input",
        "//third_party/javascript/angular_components:material_slide_toggle",
        "//third_party/javascript/angular_components:material_slider",
        "//third_party/javascript/angular_components:material_tooltip",
        "@npm//@ngrx/store",
        "@npm//rxjs",
        "@org_xprof//frontend/app/common/interfaces",
        "@org_xprof//frontend/app/components/op_profile/op_table",
        "@org_xprof//frontend/app/services/data_service",
        "@org_xprof//frontend/app/store",
    ],
)

ts_library(
    name = "op_profile_base",
    srcs = [
        "op_profile_base.ts",
        "op_profile_data.ts",
    ],
    deps = [
        "@org_xprof//frontend/app/common/interfaces",
        "@org_xprof//frontend/app/common/interfaces:op_profile_proto_defs",
        "@org_xprof//frontend/app/common/utils",
    ],
)



sass_binary(
    name = "op_profile_css",
    src = "op_profile.scss",

    sourcemap = False,

    deps = [
        ":op_profile_common",
    ],
)

sass_library(
    name = "op_profile_common",
    srcs = ["op_profile_common.scss"],

    deps = [
        "@org_xprof//frontend/app/styles:common",
    ],
)
