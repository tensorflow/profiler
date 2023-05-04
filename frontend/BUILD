load("@aspect_rules_rollup//rollup:defs.bzl", "rollup")
load("@io_bazel_rules_sass//:defs.bzl", "sass_binary", "sass_library")
load("//defs:defs.bzl", "xprof_ng_module")

package(default_visibility = [
    "//frontend:__subpackages__",
    "//plugin:__subpackages__",
])

licenses(["notice"])

package_group(
    name = "internal",
    packages = [
        "//frontend/...",
    ],
)

xprof_ng_module(
    name = "main",
    srcs = ["main.ts", "package.json", "styles.scss"],
    deps = [
        "//:node_modules/@angular/localize",
        "//:node_modules/@angular/platform-browser-dynamic",
        "@org_xprof//frontend/app",
    ],
)

rollup(
    name = "zone",
    srcs = ["//:node_modules/zone.js/dist/zone.js"],
    config_file = "//:rollup.config.js",
    entry_point = "//:node_modules/zone.js/dist/zone.js",
    node_modules = "//:node_modules",
    format = "iife",
    deps = [
        "//:node_modules/@rollup/plugin-commonjs",
        "//:node_modules/@rollup/plugin-node-resolve",
    ],
)

rollup(
    name = "bundle",
    config_file = "//:rollup.config.js",
    entry_point = "main.ts",
    node_modules = "//:node_modules",
    sourcemap = "false",
    format = "iife",
    deps = [
        ":main",
        "//:node_modules/@angular/animations",
        "//:node_modules/@angular/cdk",
        "//:node_modules/@angular/core",
        "//:node_modules/@angular/forms",
        "//:node_modules/@angular/material",
        "//:node_modules/@angular/platform-browser-dynamic",
        "//:node_modules/@angular/router",
        "//:node_modules/@ngrx/store",
        "//:node_modules/@rollup/plugin-commonjs",
        "//:node_modules/@rollup/plugin-node-resolve",
    ],
)

sass_library(
    name = "angular_material_theming",
    srcs = [
        "//:node_modules/@angular/material/_theming.scss",
    ],
)

sass_binary(
    name = "css",
    src = "styles.scss",
    output_name = "styles.css",
    sourcemap = False,
    deps = [
        ":angular_material_theming",
    ],
)

py_binary(
    name = "server",
    testonly = True,
    srcs = ["server.py"],
    data = [
        "index.html",
        ":bundle.js",
        ":css",
        ":zone.js",
    ],
    python_version = "PY3",
)
