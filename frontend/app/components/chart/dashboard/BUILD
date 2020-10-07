load("@npm_bazel_typescript//:index.bzl", "ts_library")

package(default_visibility = ["//perftools/accelerators/xprof/frontend:__subpackages__"])

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
