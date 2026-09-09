load("//plugin/xprof/build_utils:pytype.default.bzl", "pytype_library", "pytype_strict_binary", "pytype_strict_contrib_test", "pytype_strict_library")

package(
    default_visibility = ["//visibility:private"],
    features = ["-use_header_modules"],
    licenses = ["notice"],
)

cc_library(
    name = "pywrap_events_db_c_api",
    srcs = ["pywrap_events_db_c_api.cc"],
    hdrs = ["pywrap_events_db_c_api.h"],
    copts = ["-fvisibility=hidden"],
    deps = [
        "@arrow//:arrow_core",
        "@arrow//:util_hdrs",
        "@com_google_absl//absl/status",
        "@com_google_absl//absl/status:statusor",
        "@com_google_absl//absl/strings",
        "@org_xprof//xprof/convert/events_db:parquet_record_consumer",
        "@org_xprof//xprof/convert/events_db:record_consumer",
        "@org_xprof//xprof/convert/events_db:schema",
        "@org_xprof//xprof/convert/events_db:xspace_parser",
        "@xla//xla/tsl/platform:errors",
        "@xla//xla/tsl/platform:statusor",
    ],
)

cc_test(
    name = "pywrap_events_db_c_api_test",
    srcs = ["pywrap_events_db_c_api_test.cc"],
    deps = [
        ":pywrap_events_db_c_api",
        "@arrow//:util_hdrs",
        "@com_google_absl//absl/algorithm:container",
        "@com_google_absl//absl/strings",
        "@com_google_googletest//:gtest_main",
        "@org_xprof//xprof/convert/events_db:parquet_record_consumer",
        "@tsl//tsl/platform:path",
        "@tsl//tsl/platform:protobuf",
        "@tsl//tsl/profiler/protobuf:xplane_proto_cc",
    ],
)
