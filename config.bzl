"""Configuration for the xprof repository."""

def _repository_configuration(repository_ctx):
    python_version = repository_ctx.os.environ.get("PROFILER_PYTHON_VERSION", "3.11")
    repository_ctx.file("BUILD")

    repository_ctx.file("repository_config.bzl", content = """
PROFILER_PYTHON_VERSION={python_version}
""".format(python_version = repr(python_version)))

repository_configuration = repository_rule(
    implementation = _repository_configuration,
    environ = ["PROFILER_PYTHON_VERSION"],
)
