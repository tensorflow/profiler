load("@npm_angular_bazel//:index.bzl", "ng_module")
load("@io_bazel_rules_sass//:defs.bzl", "sass_binary")

package(default_visibility = ["//frontend:__subpackages__"])

ng_module(
    name = "trace_viewer",
    srcs = [
        "trace_viewer.ts",
        "trace_viewer_module.ts",
    ],
    assets = [
        ":trace_viewer_css",
        "trace_viewer.ng.html",
    ],
    deps = [
        "@npm//@angular/core",
    ],
)

sass_binary(
    name = "trace_viewer_css",
    src = "trace_viewer.scss",
    sourcemap = False,
)
