load("@npm_angular_bazel//:index.bzl", "ng_module")

package(default_visibility = ["//perftools/accelerators/xprof/frontend:__subpackages__"])

ng_module(
    name = "string_filter",
    srcs = [
        "string_filter.ts",
        "string_filter_module.ts",
    ],
    assets = [
        "string_filter.ng.html",
    ],
    deps = [
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@org_xprof//frontend/app/common/angular:angular_material_form_field",
        "@org_xprof//frontend/app/common/angular:angular_material_input",
        "@org_xprof//frontend/app/common/typing/google_visualization",
    ],
)
