load("@io_bazel_rules_sass//:defs.bzl", "sass_binary")
load("//defs:defs.bzl", "xprof_ng_module")

package(default_visibility = ["//frontend:internal"])

xprof_ng_module(
    name = "graph_config",
    srcs = [
        "graph_config.ts",
        "graph_config_module.ts",
    ],
    assets = [
        ":graph_config_css",
        "graph_config.ng.html",
    ],
    deps = [
        "@npm//@angular/core",
        # "//perftools/accelerators/xprof/frontend/app/common/classes",
        # "//perftools/accelerators/xprof/frontend/app/common/constants",
        # "//perftools/accelerators/xprof/frontend/app/components/controls/download_hlo",
        # "//perftools/accelerators/xprof/frontend/app/components/graph_viewer/hlo_text_view",
        # "//perftools/accelerators/xprof/frontend/app/services/data_service",
        "@npm//@angular/common",
        "@npm//@angular/forms",
        "@org_xprof//frontend/app/common/angular:angular_material_checkbox",
        "@org_xprof//frontend/app/common/angular:angular_material_core",
        "@org_xprof//frontend/app/common/angular:angular_material_form_field",
        "@org_xprof//frontend/app/common/angular:angular_material_icon",
        "@org_xprof//frontend/app/common/angular:angular_material_input",
        "@org_xprof//frontend/app/common/angular:angular_material_mdc_button",
        "@org_xprof//frontend/app/common/angular:angular_material_select",
        "@org_xprof//frontend/app/common/angular:angular_material_sidenav",
        "@org_xprof//frontend/app/common/angular:angular_material_tooltip",
        # "@npm//@angular/router",
        # "@npm//@ngrx/store",
        "@npm//rxjs",
        "@org_xprof//frontend/app/common/interfaces",
        # "@org_xprof//frontend/app/pipes",
        # "@org_xprof//frontend/app/store",
    ],
)

# xprof_ng_module(
#     name = "tests",
#     testonly = True,
#     srcs = ["graph_viewer_test.ts"],
#     deps = [
#         ":graph_viewer",
#         "//javascript/angular2/testing/catalyst",
#         "//perftools/accelerators/xprof/frontend/app/services/data_service",
#         "@org_xprof//frontend/app/common/angular:angular_platform-browser_animation",
#         "@npm//@angular/router",
#         "@npm//rxjs",
#         "//third_party/javascript/typings/jasmine",
#         "@org_xprof//frontend/app/common/utils:testing",
#         "@org_xprof//frontend/app/store",
#     ],
# )

sass_binary(
    name = "graph_config_css",
    src = "graph_config.scss",

    sourcemap = False,

    deps = [
        "@org_xprof//frontend/app/styles:common",
    ],
)
