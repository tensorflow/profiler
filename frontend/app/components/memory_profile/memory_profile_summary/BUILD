load("@io_bazel_rules_sass//:defs.bzl", "sass_binary")
load("//defs:defs.bzl", "xprof_ng_module")

package(default_visibility = ["//frontend:internal"])

xprof_ng_module(
    name = "memory_profile_summary",
    srcs = [
        "memory_profile_summary.ts",
        "memory_profile_summary_module.ts",
    ],
    assets = [
        ":memory_profile_summary_css",
        "memory_profile_summary.ng.html",
    ],
    deps = [
        "@npm//@angular/core",
        "@org_xprof//frontend/app/common/angular:angular_material_card",
        "@org_xprof//frontend/app/common/interfaces",
        "@org_xprof//frontend/app/common/utils",
    ],
)

sass_binary(
    name = "memory_profile_summary_css",
    src = "memory_profile_summary.scss",
    sourcemap = False,
    deps = [
        "@org_xprof//frontend/app/styles:common",
    ],
)
