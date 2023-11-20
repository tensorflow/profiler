load("@python_deps//:requirements.bzl", "requirement")

# Description:
#  Demos for profiler plugin.

load("@rules_python//python:defs.bzl", "py_binary")

package(
    licenses = ["notice"],  # Apache 2.0
)

py_binary(
    name = "profile_demo",
    srcs = [
        "profile_demo.py",
        "profile_demo_data.py",
    ],
    data = [
        "data/profile_demo.input_pipeline.json",
        "data/profile_demo.input_pipeline.pb",
        "data/profile_demo.memory_viewer.json",
        "data/profile_demo.op_profile.json",
        "data/profile_demo.overview_page.json",
        "data/profile_demo.overview_page.pb",
        "data/profile_demo.pod_viewer.json",
        "data/profile_demo.tensorflow_stats.pb",
    ],
    python_version = "PY3",
    srcs_version = "PY2AND3",
    deps = [
        requirement("absl-py"),
        "//:expect_tensorflow_installed",
        "//third_party/py/google/protobuf:use_fast_cpp_protos",  # Automatically added go/proto_python_upb_flip
        "@org_tensorflow_tensorboard//tensorboard/backend/event_processing:plugin_asset_util",
        "@org_xprof//plugin/tensorboard_plugin_profile:profile_plugin",
        "@org_xprof//plugin/tensorboard_plugin_profile/protobuf:protos_all_py_pb2",
    ],
)
