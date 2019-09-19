load("@npm_angular_bazel//:index.bzl", "ng_module")
load("@io_bazel_rules_sass//:defs.bzl", "sass_binary")

package(default_visibility = ["//frontend:__subpackages__"])

ng_module(
    name = "overview",
    srcs = [
        "overview.ts",
        "overview_module.ts",
    ],
    assets = [
        ":overview_css",
        "overview.ng.html",
    ],
    deps = [
        "@npm//@angular/core",
    ],
)

sass_binary(
    name = "overview_css",
    src = "overview.scss",
    sourcemap = False,
)
