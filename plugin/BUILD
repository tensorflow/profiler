# Description:
#  Tools for building the Profile Tensorboard plugin pip package.
package(default_visibility = ["//visibility:private"])

licenses(["notice"])  # Apache 2.0

package_group(
    name = "internal",
    packages = [
        "//...",
    ],
)

# rm -rf /tmp/profile-pip
# bazel run plugin:build_pip_package
sh_binary(
    name = "build_pip_package",
    srcs = ["build_pip_package.sh"],
    data = [
        "setup.py",
        "//:README.md",
        "@org_tensorflow//tensorflow/python/profiler/internal:_pywrap_profiler_plugin",
        "@org_xprof//frontend:bundle.js",
        "@org_xprof//frontend:css",
        "@org_xprof//frontend:zone.js",
        "@org_xprof//plugin/tensorboard_plugin_profile:profile_plugin_loader",
        "@org_xprof//plugin/tensorboard_plugin_profile:resources",
        "@org_xprof//plugin/tensorboard_plugin_profile:version",
        "@org_xprof//plugin/tensorboard_plugin_profile/convert:all_libs",
        "@org_xprof//plugin/tensorboard_plugin_profile/integration_tests/tpu/tensorflow:tpu_tf2_keras_xla",
        "@org_xprof//plugin/tensorboard_plugin_profile/protobuf:protos_all",
        "@org_xprof//plugin/trace_viewer:trace_viewer_index.html",
        "@org_xprof//plugin/trace_viewer:trace_viewer_index.js",
    ],
    tags = [
        "local",
        "manual",
    ],
)
