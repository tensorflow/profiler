load("@npm_angular_bazel//:index.bzl", "ng_module")
load("@io_bazel_rules_sass//:defs.bzl", "sass_binary")

package(default_visibility = ["//frontend:__subpackages__"])

ng_module(
    name = "pod_viewer",
    srcs = [
        "pod_viewer.ts",
        "pod_viewer_module.ts",
    ],
    assets = [
        ":pod_viewer_css",
        "pod_viewer.ng.html",
    ],
    deps = [
        "@npm//@angular/core",
        "@org_xprof//frontend/app/common/angular:angular_material_card",
    ],
)

sass_binary(
    name = "pod_viewer_css",
    src = "pod_viewer.scss",
    sourcemap = False,
)
