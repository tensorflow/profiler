load("@com_google_protobuf//:protobuf.bzl", "py_proto_library")

# Description:
#  Protobufs used by TensorBoard profile plugin.
package(
    default_visibility = ["//plugin:internal"],
    licenses = ["notice"],  # Apache 2.0
)

py_proto_library(
    name = "protos_all_py_pb2",
    deps = [
        "@org_tensorflow/core/profiler/protobuf:protos_all_tbp_pb2"
    ],
    default_runtime = "@com_google_protobuf//:protobuf_python",
    protoc = "@com_google_protobuf//:protoc",
    srcs_version = "PY2AND3",
    deps = ["@com_google_protobuf//:protobuf_python"],
)
