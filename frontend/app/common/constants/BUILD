load("@npm//@bazel/concatjs:index.bzl", "ts_library")

package(default_visibility = ["//frontend:internal"])

ts_library(
    name = "constants",
    srcs = [
        "constants.ts",
        "enums.ts",
    ],
)

ts_library(
    name = "testing",
    srcs = [
        "testing.ts",
    ],
    deps = [
        "@org_xprof//frontend/app/common/interfaces",
    ],
)
