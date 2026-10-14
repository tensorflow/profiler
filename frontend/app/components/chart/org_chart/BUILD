load("//defs:defs.bzl", "sass_binary", "xprof_ng_module")

package(default_visibility = ["//frontend:internal"])

xprof_ng_module(
    name = "org_chart",
    srcs = [
        "org_chart.ts",
    ],
    assets = [
        ":org_chart_css",
        "org_chart.ng.html",
    ],
    deps = [
        "//:node_modules/@angular/core",
        "//:node_modules/@types/google.visualization",
    ],
)

xprof_ng_module(
    name = "screenshot_tests",
    testonly = True,
    srcs = [
        "org_chart_screenshot_test.ts",
    ],
    deps = [
        ":org_chart",
        "//javascript/angular2/testing/catalyst/async",
        # ksf,
        "@org_xprof//frontend/app/common/angular:angular_platform-browser_animation",
        "//:node_modules/@types/google.visualization",
        "//:node_modules/safevalues",
        "//third_party/javascript/safevalues/dom",
        "//third_party/javascript/typings/jasmine",
        "@org_xprof//frontend/app/common/utils:testing",
    ],
)

sass_binary(
    name = "org_chart_css",
    src = "org_chart.scss",
    # stack = False,
    sourcemap = False,
)
