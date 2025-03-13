# Platform-specific build configurations.
"""
Build macros Xprof uses only in google3.
"""

load("//dart:dart_proto_library.bzl", "dart_proto_library")
load("//devtools/build_cleaner/skylark:build_defs.bzl", "register_extension_info")
load("//net/grpc:cc_grpc_library.bzl", "cc_grpc_library")
load("//net/proto2/compiler/stubby/cc:cc_stubby_library.bzl", "cc_stubby_library")
load("//third_party/bazel_rules/rules_python/python:proto.bzl", "py_proto_library")
load("//third_party/protobuf/bazel:java_lite_proto_library.bzl", "java_lite_proto_library")
load("//third_party/protobuf/bazel:java_proto_library.bzl", "java_proto_library")
load("//third_party/protobuf/bazel:proto_library.bzl", "proto_library")
load("//tools/build_defs/go:go_proto_library.bzl", "go_proto_library")
load("//tools/build_defs/proto/cpp:cc_proto_library.bzl", "cc_proto_library")

visibility([
    "//third_party/xprof/...",
])

def xprof_proto_library(
        name = None,
        srcs = [],
        deps = [],
        compatible_with = ["//buildenv/target:non_prod"],
        restricted_to = None,
        make_default_target_header_only = None,
        visibility = None,
        use_grpc_namespace = False,
        create_service = False,
        create_grpc_library = False,
        create_java_proto = True,
        create_go_proto = True,
        create_dart_proto = True,
        testonly = 0,
        exports = [],
        local_defines = None,
        **kwargs):
    """Make a proto library, possibly depending on other proto libraries.

    Args:
      name: The name of the proto library.
      srcs: The proto files.
      deps: The proto dependencies.
      compatible_with: The compatible_with attribute of the proto library.
      restricted_to: The restricted_to attribute of the proto library.
      make_default_target_header_only: Unused, but included for compatibility with opensource.
      visibility: The visibility attribute of the proto library.
      testonly: The testonly attribute of the proto library.
      use_grpc_namespace: Unused, but included for compatibility with opensource.
      create_service: If True, create a cc_stubby_library target.
      create_grpc_library: If True, create a cc_grpc_library target.
      create_java_proto: If True, create a java_proto_library target and a java_lite_proto_library target.
      create_go_proto: If True, create a go_proto_library target.
      create_dart_proto: If True, create a dart_proto_library target.
      exports: The exports attribute of the proto library.
      local_defines: Unused, but included for compatibility with opensource.
      **kwargs: Other arguments to pass to the proto library.
    """

    _ = [make_default_target_header_only, use_grpc_namespace, local_defines]  # buildifier: disable=unused-variable
    if "protodeps" in kwargs:
        deps = deps + kwargs.pop("protodeps")

    if name.endswith("_proto"):
        name_sans_proto = name[:-6]
    else:
        name_sans_proto = name
    proto_library(
        name = name,
        srcs = srcs,
        deps = deps,
        exports = exports,
        compatible_with = compatible_with,
        restricted_to = restricted_to,
        visibility = visibility,
        testonly = testonly,
        **kwargs
    )

    cc_proto_library(
        # google3 style would be "_cc_proto", but we're being compatible with
        # the OSS implementation.
        name = name + "_cc",
        testonly = testonly,
        compatible_with = compatible_with,
        restricted_to = restricted_to,
        visibility = visibility,
        deps = [name],
    )

    # Create a _cc_impl alias to be compatible with the OSS version of this macro which creates
    # such a target.
    native.alias(
        name = name + "_cc_impl",
        testonly = testonly,
        actual = name + "_cc",
        compatible_with = compatible_with,
        restricted_to = restricted_to,
        visibility = visibility,
    )

    py_proto_library(
        name = name + "_py",
        testonly = testonly,
        compatible_with = compatible_with,
        restricted_to = restricted_to,
        visibility = visibility,
        deps = [name],
    )

    if create_java_proto:
        java_proto_library(
            name = name + "_java_proto",
            testonly = testonly,
            compatible_with = compatible_with,
            restricted_to = restricted_to,
            visibility = visibility,
            deps = [name],
        )
        java_lite_proto_library(
            name = "%s_java_proto_lite" % name,
            testonly = testonly,
            visibility = visibility,
            deps = [":%s" % name],
        )

    if create_go_proto:
        go_proto_library(
            name = name_sans_proto + "_go_proto",
            testonly = testonly,
            compatible_with = compatible_with,
            restricted_to = restricted_to,
            visibility = ["//visibility:public"],
            deps = [":" + name],
        )

    if create_dart_proto:
        if name_sans_proto.endswith("_protos"):
            name_sans_proto_dart = name_sans_proto[:-7]
        else:
            name_sans_proto_dart = name_sans_proto

        # Dart proto targets cannot contain '-'.
        name_sans_proto_dart = name_sans_proto_dart.replace("-", "_")

        dart_proto_library(
            name = name_sans_proto_dart + "_dart_proto",
            testonly = testonly,
            compatible_with = compatible_with,
            visibility = ["//visibility:public"],
            deps = [":" + name],
        )

    if create_service:
        cc_stubby_library(
            name = name_sans_proto + "_cc_stubby",
            testonly = testonly,
            srcs = [":" + name],
            visibility = visibility,
            deps = [":" + name + "_cc"],
        )

    if create_grpc_library:
        cc_grpc_library(
            name = name_sans_proto + "_cc_grpc_proto",
            testonly = testonly,
            srcs = [":%s" % name],
            compatible_with = ["//buildenv/target:non_prod"],
            generate_mocks = True,
            service_namespace = "grpc",
            visibility = visibility,
            deps = [":%s_cc" % name],
        )

# Allow build_cleaner to clean up tf_proto_library rules.
register_extension_info(
    extension = xprof_proto_library,
    label_regex_for_dep = "{extension_name}",
)

# Not used in google3 build but needed to satisfy a load()
def xprof_proto_library_py(**kwargs):
    _ = kwargs  # buildifier: disable=unused-variable
