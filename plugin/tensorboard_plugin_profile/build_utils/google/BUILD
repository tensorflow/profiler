load("//tools/build_defs/testing:bzl_library.bzl", "bzl_library")

visibility = ["//plugin:internal"]

package(
    default_visibility = visibility,
    licenses = ["notice"],  # Apache 2.0
)

bzl_library(
    name = "build_config_bzl",
    srcs = ["build_config.bzl"],
    parse_tests = False,
    visibility = ["//visibility:private"],
    deps = [
        "//dart:dart_proto_library",
        "//devtools/build_cleaner/skylark:build_defs_lib",
        "//net/grpc:cc_grpc_library_bzl",
        "//net/proto2/compiler/stubby/cc:cc_stubby_library_bzl",
        "//third_party/protobuf/bazel:java_lite_proto_library_bzl",
        "//third_party/protobuf/bazel:java_proto_library_bzl",
        "//third_party/protobuf/bazel:proto_library_bzl",
        "//tools/build_defs/go:go_proto_library_bzl",
        "//tools/build_defs/proto/cpp:cc_proto_library_bzl",
        "@rules_python//python:proto_bzl",
    ],
)
