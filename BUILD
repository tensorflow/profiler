# Description
# Xprof, ML Performance Toolbox (for TPU, GPU, CPU).
load("@python_deps//:requirements.bzl", "requirement")

package(default_visibility = [":internal"])

licenses(["notice"])

exports_files(["LICENSE"])  # Needed for internal repo.

exports_files([
    "tsconfig.json",
    "rollup.config.js",
])

py_library(
    name = "expect_tensorflow_installed",
    # This is a dummy rule used as a tensorflow dependency in open-source.
    # We expect tensorflow to already be installed on the system, e.g. via
    # `pip install tensorflow`
    visibility = ["//visibility:public"],
    deps = [
        requirement("tensorflow"),
    ],
)
