load("//defs:defs.bzl", "xprof_ng_module")
load("@npm//@bazel/concatjs:index.bzl", "ts_library")

package(default_visibility = ["//frontend:internal"])

xprof_ng_module(
    name = "store",
    srcs = [
        "actions.ts",
        "reducers.ts",
        "selectors.ts",
        "state.ts",
        "store_module.ts",
    ],
    deps = [
        ":types",
        "@npm//@angular/core",
        "@npm//@ngrx/store",
        "@npm//rxjs",
        "@org_xprof//frontend/app/common/constants",
        "@org_xprof//frontend/app/common/interfaces",
        "@org_xprof//frontend/app/common/interfaces:op_profile_proto_defs",
        "@org_xprof//frontend/app/store/common_data_store",
        "@org_xprof//frontend/app/store/tensorflow_stats",
    ],
)

ts_library(
    name = "types",
    srcs = [
        "types.ts",
    ],
    deps = [
        "@npm//@ngrx/store",
    ],
)
