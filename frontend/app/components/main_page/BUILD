load("@npm_angular_bazel//:index.bzl", "ng_module")
load("@io_bazel_rules_sass//:defs.bzl", "sass_binary")

package(default_visibility = ["//frontend:__subpackages__"])

ng_module(
    name = "main_page",
    srcs = [
        "main_page.ts",
        "main_page_module.ts",
    ],
    assets = [
        ":main_page_css",
        "main_page.ng.html",
    ],
    deps = [
        "@npm//@angular/core",
        "@npm//@angular/router",
        "@org_xprof//frontend/app/components/overview",
        "@org_xprof//frontend/app/components/sidenav",
        "@org_xprof//frontend/app/components/trace_viewer",
    ],
)

sass_binary(
    name = "main_page_css",
    src = "main_page.scss",
    sourcemap = False,
)
