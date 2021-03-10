load("@npm//@bazel/typescript:index.bzl", "ts_library")

package(default_visibility = ["//frontend:internal"])

ts_library(
    name = "dashboard",
    srcs = [
        "dashboard.ts",
    ],
    deps = [
        "@org_xprof//frontend/app/common/interfaces",
        "@org_xprof//frontend/app/common/typing/google_visualization",
    ],
)
