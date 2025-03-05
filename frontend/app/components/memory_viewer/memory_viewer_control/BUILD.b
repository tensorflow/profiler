load("//javascript/angular2:build_defs.bzl", "ng_module")
load("//third_party/bazel_rules/rules_sass/sass:sass.bzl", "sass_binary")

package(
    default_applicable_licenses = ["//third_party/xprof:license"],
    default_visibility = [
        "//third_party/xprof/frontend:__subpackages__",
        "//third_party/xprof/frontend:internal",
    ],
)

ng_module(
    name = "memory_viewer_control",
    srcs = [
        "memory_viewer_control.ts",
        "memory_viewer_control_module.ts",
    ],
    assets = [
        ":memory_viewer_control_css",
        "memory_viewer_control.ng.html",
    ],
    deps = [
        "//third_party/javascript/angular2:common",
        "//third_party/javascript/angular2:core",
        "//third_party/javascript/angular_components:material_core",
        "//third_party/javascript/angular_components:material_form_field",
        "//third_party/javascript/angular_components:material_select",
        "//third_party/xprof/frontend/app/common/interfaces",
    ],
)

ng_module(
    name = "tests",
    testonly = True,
    srcs = ["memory_viewer_control_test.ts"],
    deps = [
        ":memory_viewer_control",
        "//javascript/angular2/testing/catalyst/fake_async",
        "//third_party/javascript/angular2:platform_browser_animations",
        "//third_party/javascript/angular2:router",
        "//third_party/javascript/angular_components:cdk_testing_catalyst",
        "//third_party/javascript/angular_components:material_select_testing",
        "//third_party/javascript/rxjs",
        "//third_party/javascript/typings/jasmine",
        "//third_party/xprof/frontend/app/services/data_service_v2:data_service_v2_interface",
    ],
)

sass_binary(
    name = "memory_viewer_control_css",
    src = "memory_viewer_control.scss",
    sass_stack = True,
    sourcemap = False,
    deps = [
        "//third_party/xprof/frontend/app/styles:common",
    ],
)
