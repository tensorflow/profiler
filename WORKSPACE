workspace(name = "org_xprof")

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

http_archive(
    name = "bazel_skylib",
    sha256 = "f7be3474d42aae265405a592bb7da8e171919d74c16f082a5457840f06054728",
    urls = [
        "https://github.com/bazelbuild/bazel-skylib/releases/download/1.2.1/bazel-skylib-1.2.1.tar.gz",
    ],
)

load("@bazel_skylib//:workspace.bzl", "bazel_skylib_workspace")
bazel_skylib_workspace()

http_archive(
    name = "com_google_absl_py",
    sha256 = "5b476479811ed0b8c57bc0b3f517bc379c31e2fd13e12743ba0984de0e3f254a",
    strip_prefix = "abseil-py-127c98870edf5f03395ce9cf886266fa5f24455e",
    urls = [
        "https://github.com/abseil/abseil-py/archive/127c98870edf5f03395ce9cf886266fa5f24455e.tar.gz",
    ],
)

http_archive(
    name = "rules_rust",
    sha256 = "acd759b6fe99a3ae518ea6380e8e95653d27bb9e4a6a2a443abf48cb51fecaa7",
    strip_prefix = "rules_rust-d468cfa4820a156f850dab957b895d36ee0f4beb",
    urls = [
        # Master branch as of 2021-02-03
        "http://mirror.tensorflow.org/github.com/bazelbuild/rules_rust/archive/d468cfa4820a156f850dab957b895d36ee0f4beb.tar.gz",
        "https://github.com/bazelbuild/rules_rust/archive/d468cfa4820a156f850dab957b895d36ee0f4beb.tar.gz",
    ],
)

http_archive(
    name = "rules_python",
    url = "https://github.com/bazelbuild/rules_python/releases/download/0.2.0/rules_python-0.2.0.tar.gz",
    sha256 = "778197e26c5fbeb07ac2a2c5ae405b30f6cb7ad1f5510ea6fdac03bded96cc6f",
)

http_archive(
    name = "io_bazel_rules_webtesting",
    sha256 = "f89ca8e91ac53b3c61da356c685bf03e927f23b97b086cc593db8edc088c143f",
    urls = [
        # tag 0.3.1 resolves to commit afa8c4435ed8fd832046dab807ef998a26779ecb (2019-04-03 14:10:32 -0700)
        "http://mirror.tensorflow.org/github.com/bazelbuild/rules_webtesting/releases/download/0.3.1/rules_webtesting.tar.gz",
        "https://github.com/bazelbuild/rules_webtesting/releases/download/0.3.1/rules_webtesting.tar.gz",
    ],
)

http_archive(
    name = "io_bazel_rules_closure",
    sha256 = "6a900831c1eb8dbfc9d6879b5820fd614d4ea1db180eb5ff8aedcb75ee747c1f",
    strip_prefix = "rules_closure-db4683a2a1836ac8e265804ca5fa31852395185b",
    urls = [
        "http://mirror.tensorflow.org/github.com/bazelbuild/rules_closure/archive/db4683a2a1836ac8e265804ca5fa31852395185b.tar.gz",
        "https://github.com/bazelbuild/rules_closure/archive/db4683a2a1836ac8e265804ca5fa31852395185b.tar.gz",  # 2020-01-15
    ],
)

load("@io_bazel_rules_closure//closure:repositories.bzl", "rules_closure_dependencies")
rules_closure_dependencies(
    omit_com_google_protobuf = True,
    omit_com_google_protobuf_js = True,
)

http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "94070eff79305be05b7699207fbac5d2608054dd53e6109f7d00d923919ff45a",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/5.8.2/rules_nodejs-5.8.2.tar.gz"],
)

load("@build_bazel_rules_nodejs//:repositories.bzl", "build_bazel_rules_nodejs_dependencies")
build_bazel_rules_nodejs_dependencies()
load("@build_bazel_rules_nodejs//:index.bzl", "yarn_install")

yarn_install(
    name = "npm",
    # "Some rules only work by referencing labels nested inside npm packages
    # and therefore require turning off exports_directories_only."
    # This includes "ts_library".
    # See: https://github.com/bazelbuild/rules_nodejs/wiki/Migrating-to-5.0#exports_directories_only
    exports_directories_only = False,
    package_json = "//:package.json",
    yarn_lock = "//:yarn.lock",
)

# rules_sass release information is difficult to find but it does seem to
# regularly release with same cadence and version as core sass.
# We typically upgrade this library whenever we upgrade rules_nodejs.
#
# rules_sass 1.55.0: https://github.com/bazelbuild/rules_sass/tree/1.55.0
http_archive(
    name = "io_bazel_rules_sass",
    sha256 = "1ea0103fa6adcb7d43ff26373b5082efe1d4b2e09c4f34f8a8f8b351e9a8a9b0",
    strip_prefix = "rules_sass-1.55.0",
    urls = [
        "http://mirror.tensorflow.org/github.com/bazelbuild/rules_sass/archive/1.55.0.zip",
        "https://github.com/bazelbuild/rules_sass/archive/1.55.0.zip",
    ],
)

load("@io_bazel_rules_sass//:defs.bzl", "sass_repositories")
sass_repositories()

http_archive(
    name = "org_tensorflow",
    # NOTE: when updating this, MAKE SURE to also update the protobuf_js runtime version
    # in third_party/workspace.bzl to >= the protobuf/protoc version provided by TF.
    sha256 = "638e541a4981f52c69da4a311815f1e7989bf1d67a41d204511966e1daed14f7",
    strip_prefix = "tensorflow-2.1.0",
    urls = [
        "http://mirror.tensorflow.org/github.com/tensorflow/tensorflow/archive/v2.1.0.tar.gz",  # 2020-01-06
        "https://github.com/tensorflow/tensorflow/archive/v2.1.0.tar.gz",
    ],
)

http_archive(
    name = "com_google_protobuf",
    sha256 = "9a301cf94a8ddcb380b901e7aac852780b826595075577bb967004050c835056",
    strip_prefix = "protobuf-3.19.6",
    urls = [
        "http://mirror.tensorflow.org/github.com/protocolbuffers/protobuf/archive/v3.19.6.tar.gz",
        "https://github.com/protocolbuffers/protobuf/archive/v3.19.6.tar.gz",  # 2022-09-29
    ],
)

load("@com_google_protobuf//:protobuf_deps.bzl", "protobuf_deps")
protobuf_deps()


http_archive(
    name = "org_tensorflow_tensorboard",
    sha256 = "bcd63689364fa397f4a8740349cf281a0f58f6ff93e09f7f049dc3744623fa29",
    strip_prefix = "tensorboard-0f4573b73838decf530bc8bcac53459fd4bc02e7",
    urls = ["https://github.com/tensorflow/tensorboard/archive/0f4573b73838decf530bc8bcac53459fd4bc02e7.tar.gz"], # 2021-03-08
)

load("@org_tensorflow_tensorboard//third_party:workspace.bzl", "tensorboard_workspace")
tensorboard_workspace()

load("@rules_python//python:pip.bzl", "pip_install")

pip_install(
    name = "python_deps",
    requirements = "//:requirements.txt",
)

