load("@npm_angular_bazel//:index.bzl", "ng_module")
load("@npm_bazel_typescript//:index.bzl", "ts_library")

package(default_visibility = ["//frontend:internal"])

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


