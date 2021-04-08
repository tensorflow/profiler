load("@io_bazel_rules_sass//:defs.bzl", "sass_binary")
load("//javascript/angular2:build_defs.bzl", "ng_module")

package(default_visibility = ["//frontend:internal"])

ng_module(
    name = "max_heap_chart_downloader",
    srcs = [
        "max_heap_chart_downloader.ts",
        "max_heap_chart_downloader_module.ts",
    ],
    assets = [
        ":max_heap_chart_downloader_css",
        "max_heap_chart_downloader.ng.html",
    ],
    deps = [
        "//javascript/angular2/components/download",
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@org_xprof//frontend/app/common/angular:angular_material_button",
        "@npm//@angular/router",
        "@npm//rxjs",
        "@npm//ts-csv",
        "@org_xprof//frontend/app/common/interfaces",
    ],
)

sass_binary(
    name = "max_heap_chart_downloader_css",
    src = "max_heap_chart_downloader.scss",

    sourcemap = False,

    deps = [
    ],
)
