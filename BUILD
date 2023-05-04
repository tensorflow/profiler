# Description
# Xprof, ML Performance Toolbox (for TPU, GPU, CPU).
load("@python_deps//:requirements.bzl", "requirement")
load("@npm//:defs.bzl", "npm_link_all_packages")
load("@aspect_rules_ts//ts:defs.bzl", "ts_config")

package(default_visibility = [":internal"])

licenses(["notice"])

# Link npm packages
npm_link_all_packages(name = "node_modules")

# The root repo tsconfig
ts_config(
    name = "tsconfig",
    src = "tsconfig.json",
    visibility = ["//visibility:public"],
)

exports_files(["LICENSE"])  # Needed for internal repo.

exports_files([
    "tsconfig.json",
    "rollup.config.js",
], visibility = ["//visibility:public"])

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
