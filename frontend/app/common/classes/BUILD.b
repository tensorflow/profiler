load("//javascript/typescript:build_defs.bzl", "ts_library")

package(default_visibility = [
    "//third_party/xprof/contrib:__subpackages__",
    "//third_party/xprof/frontend:__subpackages__",
])

ts_library(
    name = "classes",
    srcs = [
        "throbber.ts",
    ],
)
