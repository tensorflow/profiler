"""These are the same as blaze's native cc_libraries."""

load("//devtools/build_cleaner/skylark:build_defs.bzl", "register_extension_info")

def cc_library(**attrs):
    """A wrapper around native.cc_library that adds non_prod compatibility to xprof/utils.

    Args:
        **attrs: The arguments to pass to native.cc_library.
    """
    if "compatible_with" in attrs:
        # Always respect what users specify in cc_library(compatible_with = ...).
        native.cc_library(**attrs)
    else:
        # These packages are collectively tagged with non_prod compatibility: c, cc, core, compiler, and stream_executor.
        compatible_with = []
        name = native.package_name()
        if name.startswith("third_party/xprof/utils"):
            compatible_with = ["//buildenv/target:non_prod"]
        native.cc_library(compatible_with = compatible_with, **attrs)

register_extension_info(extension = cc_library, label_regex_for_dep = "{extension_name}")
