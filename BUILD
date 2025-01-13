load("@python//:defs.bzl", "compile_pip_requirements")
load("@python_deps//:requirements.bzl", "requirement")
load("@repository_configuration//:repository_config.bzl", "PROFILER_REQUIREMENTS_FILE")

# Description
# Xprof, ML Performance Toolbox (for TPU, GPU, CPU).

licenses(["notice"])

exports_files(["LICENSE"])  # Needed for internal repo.

exports_files([
    "tsconfig.json",
    "rollup.config.js",
])

compile_pip_requirements(
    name = "requirements",
    extra_args = [
        "--allow-unsafe",
        "--build-isolation",
        "--rebuild",
    ],
    generate_hashes = True,
    requirements_in = "requirements.in",
    requirements_txt = PROFILER_REQUIREMENTS_FILE,
)
