load("@npm_angular_bazel//:index.bzl", "ng_module")
load("@io_bazel_rules_sass//:defs.bzl", "sass_binary")

package(default_visibility = ["//frontend:internal"])

ng_module(
    name = "error_msg",
    srcs = [
        "error_msg.ts",
        "error_msg_module.ts",
    ],
    assets = [
        ":error_msg_css",
        "error_msg.ng.html",
    ],
    deps = [
        "@npm//@angular/core",
        "@org_xprof//frontend/app/common/angular:angular_material_card",
        "@org_xprof//frontend/app/common/interfaces",
    ],
)



sass_binary(
    name = "error_msg_css",
    src = "error_msg.scss",

    sourcemap = False,
    deps = [
        "@org_xprof//frontend/app/styles:common",
    ],
)
