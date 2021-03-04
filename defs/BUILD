load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_binary")

nodejs_binary(
    name = "tsc_wrapped_with_angular",
    data = [
        "@npm//@angular/compiler-cli",
        "@npm//@bazel/typescript",
    ],
    entry_point = "@npm//:node_modules/@bazel/typescript/internal/tsc_wrapped/tsc_wrapped.js",
    visibility = ["//:__subpackages__"],
)
