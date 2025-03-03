load("@npm//@bazel/concatjs:index.bzl", "ts_library")

package(default_visibility = [
    "//perftools/accelerators/xprof/contrib:__subpackages__",
    "//perftools/accelerators/xprof/frontend:__subpackages__",
    "@org_xprof//contrib:__subpackages__",
    "@org_xprof//frontend:__subpackages__",
])

ts_library(
    name = "classes",
    srcs = [
        "throbber.ts",
    ],
    deps = [
        "@org_xprof//frontend/app/common/interfaces",
    ],
)
