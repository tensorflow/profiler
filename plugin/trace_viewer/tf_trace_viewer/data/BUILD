package(default_visibility = ["//plugin:internal"])

load("@io_bazel_rules_closure//closure:defs.bzl", "web_library")

licenses(["notice"])

web_library(
    name = "data",
    srcs = glob(["*.json"]),
    path = "/tf-trace-viewer/data/plugin/profile",
)
