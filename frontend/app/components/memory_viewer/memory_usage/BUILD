load("@npm//@bazel/concatjs:index.bzl", "ts_library")

package(default_visibility = ["//frontend:internal"])

ts_library(
    name = "memory_usage",
    srcs = [
        "memory_usage.ts",
    ],
    deps = [
        "@org_xprof//frontend/app/common/interfaces",
        "@org_xprof//frontend/app/common/utils",
    ],
)
