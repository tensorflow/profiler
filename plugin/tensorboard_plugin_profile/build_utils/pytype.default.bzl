"""Default (OSS) build versions of Python pytype rules."""

# Placeholder to use until bazel supports pytype_library.
def pytype_library(name, **kwargs):
    native.py_library(name = name, **kwargs)

# Placeholder to use until bazel supports pytype_strict_binary.
def pytype_strict_binary(name, **kwargs):
    native.py_binary(name = name, **kwargs)

# Placeholder to use until bazel supports pytype_strict_library.
def pytype_strict_library(name, **kwargs):
    native.py_library(name = name, **kwargs)
