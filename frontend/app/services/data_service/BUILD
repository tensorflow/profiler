load("//defs:defs.bzl", "xprof_ng_module")

package(default_visibility = ["//frontend:internal"])

xprof_ng_module(
    name = "data_service",
    srcs = [
        "data_service.ts",
        "mock_data.ts",
    ],
    deps = [
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//rxjs",
        "@org_xprof//frontend/app/common/angular:angular_common_http",
        "@org_xprof//frontend/app/common/constants",
        "@org_xprof//frontend/app/common/interfaces",
    ],
)

xprof_ng_module(
    name = "data_service_interface",
    srcs = [
        "data_service_interface.ts",
        "mock_interface_data.ts",
    ],
    deps = [
        "//third_party/javascript/safevalues/dom",
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//rxjs",
        "@org_xprof//frontend/app/common/angular:angular_common_http",
        "@org_xprof//frontend/app/common/constants",
        "@org_xprof//frontend/app/common/interfaces",
    ],
)
