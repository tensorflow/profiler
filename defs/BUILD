load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_binary")

# In OSS-only, the `xprof_ng_module` rule depends on a
# tsc_wrapped_with_angular nodejs_binary target.
nodejs_binary(
    name = "tsc_wrapped_with_angular",
    data = [
        "@npm//@angular/compiler-cli",
        "@npm//@bazel/concatjs",
        "@npm//@bazel/typescript",
    ],
    entry_point = "@npm//:node_modules/@bazel/concatjs/internal/tsc_wrapped/tsc_wrapped.js",
    visibility = ["//:__subpackages__"],
)
