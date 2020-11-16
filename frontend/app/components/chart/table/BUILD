load("@npm_angular_bazel//:index.bzl", "ng_module")
load("@io_bazel_rules_sass//:defs.bzl", "sass_binary")

package(default_visibility = ["//frontend:internal"])

ng_module(
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
        "@org_xprof//frontend/app/common/typing/google_visualization",
    ],
)

sass_binary(
    name = "table_css",
    src = "table.scss",

    sourcemap = False,

)
