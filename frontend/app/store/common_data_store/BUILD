load("@npm_angular_bazel//:index.bzl", "ng_module")

package(default_visibility = ["//frontend:internal"])

ng_module(
    name = "common_data_store",
    srcs = [
        "actions.ts",
        "reducers.ts",
        "selectors.ts",
        "state.ts",
    ],
    deps = [
        "@npm//@angular/core",
        "@npm//@ngrx/store",
        "@npm//rxjs",
        "@org_xprof//frontend/app/common/interfaces",
        "@org_xprof//frontend/app/store:types",
    ],
)


