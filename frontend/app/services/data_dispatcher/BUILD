load("@npm_angular_bazel//:index.bzl", "ng_module")
load("@npm_bazel_typescript//:index.bzl", "ts_library")

package(default_visibility = ["//frontend:internal"])

ts_library(
    name = "data_dispatcher_base",
    srcs = [
        "data_dispatcher_base.ts",
    ],
    deps = [
        ":data_request_queue",
        "@npm//@ngrx/store",
        "@npm//rxjs",
        "@org_xprof//frontend/app/store",
    ],
)

ts_library(
    name = "data_request_queue",
    srcs = [
        "data_request_queue.ts",
    ],
    deps = [
        "@org_xprof//frontend/app/common/constants",
        "@org_xprof//frontend/app/store",
    ],
)


