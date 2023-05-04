workspace(name = "org_xprof")

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

http_archive(
    name = "bazel_skylib",
    sha256 = "2c62d8cd4ab1e65c08647eb4afe38f51591f43f7f0885e7769832fa137633dcb",
    strip_prefix = "bazel-skylib-0.7.0",
    urls = [
        # tag 0.7.0 resolves to commit 6741f733227dc68137512161a5ce6fcf283e3f58 (2019-02-08 18:37:26 +0100)
        "http://mirror.tensorflow.org/github.com/bazelbuild/bazel-skylib/archive/0.7.0.tar.gz",
        "https://github.com/bazelbuild/bazel-skylib/archive/0.7.0.tar.gz",
    ],
)

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
    name = "aspect_bazel_lib",
    sha256 = "80897b673c2b506d21f861ae316689aa8abcc3e56947580a41bf9e68ff13af58",
    strip_prefix = "bazel-lib-1.27.1",
    url = "https://github.com/aspect-build/bazel-lib/releases/download/v1.27.1/bazel-lib-v1.27.1.tar.gz",
)
load("@aspect_bazel_lib//lib:repositories.bzl", "aspect_bazel_lib_dependencies", "register_jq_toolchains")
aspect_bazel_lib_dependencies()
register_jq_toolchains()

http_archive(
    name = "aspect_rules_js",
    sha256 = "124ed29fb0b3d0cba5b44f8f8e07897cf61b34e35e33b1f83d1a943dfd91b193",
    strip_prefix = "rules_js-1.24.0",
    url = "https://github.com/aspect-build/rules_js/releases/download/v1.24.0/rules_js-v1.24.0.tar.gz",
)
load("@aspect_rules_js//js:repositories.bzl", "rules_js_dependencies")
rules_js_dependencies()
load("@aspect_rules_js//npm:npm_import.bzl", "npm_translate_lock", "pnpm_repository")
pnpm_repository(name = "pnpm")
npm_translate_lock(
    name = "npm",
    npmrc = "//:.npmrc",
    pnpm_lock = "//:pnpm-lock.yaml",
    # Set this to True when the lock file needs to be updated, commit the
    # changes, then set to False again.
    update_pnpm_lock = False,
    verify_node_modules_ignored = "//:.bazelignore",
)

http_archive(
    name = "aspect_rules_ts",
    sha256 = "8eb25d1fdafc0836f5778d33fb8eaac37c64176481d67872b54b0a05de5be5c0",
    strip_prefix = "rules_ts-1.3.3",
    url = "https://github.com/aspect-build/rules_ts/releases/download/v1.3.3/rules_ts-v1.3.3.tar.gz",
)
##################
# rules_ts setup #
##################
# Fetches the rules_ts dependencies.
# If you want to have a different version of some dependency,
# you should fetch it *before* calling this.
# Alternatively, you can skip calling this function, so long as you've
# already fetched all the dependencies.
load("@aspect_rules_ts//ts:repositories.bzl", "rules_ts_dependencies")
rules_ts_dependencies(
    ts_version_from = "//:package.json",
)

load("@rules_nodejs//nodejs:repositories.bzl", "DEFAULT_NODE_VERSION", "nodejs_register_toolchains")
nodejs_register_toolchains(
    name = "nodejs",
    node_version = DEFAULT_NODE_VERSION,
)

load("@npm//:repositories.bzl", "npm_repositories")
npm_repositories()

http_archive(
    name = "aspect_rules_esbuild",
    sha256 = "2ea31bd97181a315e048be693ddc2815fddda0f3a12ca7b7cc6e91e80f31bac7",
    strip_prefix = "rules_esbuild-0.14.4",
    url = "https://github.com/aspect-build/rules_esbuild/releases/download/v0.14.4/rules_esbuild-v0.14.4.tar.gz",
)

# Register a toolchain containing esbuild npm package and native bindings
load("@aspect_rules_esbuild//esbuild:repositories.bzl", "LATEST_VERSION", "esbuild_register_toolchains")

esbuild_register_toolchains(
    name = "esbuild",
    esbuild_version = LATEST_VERSION,
)

http_archive(
    name = "aspect_rules_rollup",
    sha256 = "55aec79b04d84b489895ac6f57a7ed7e4a1ef94dc4680701634463dd1720802d",
    strip_prefix = "rules_rollup-0.15.0",
    url = "https://github.com/aspect-build/rules_rollup/releases/download/v0.15.0/rules_rollup-v0.15.0.tar.gz",
)

######################
# rules_rollup setup #
######################
load("@aspect_rules_rollup//rollup:dependencies.bzl", "rules_rollup_dependencies")

# Fetches the rules_rollup dependencies.
# If you want to have a different version of some dependency,
# you should fetch it *before* calling this.
# Alternatively, you can skip calling this function, so long as you've
# already fetched all the dependencies.
rules_rollup_dependencies()

################################################################################
# rules_nodejs
################################################################################
http_archive(
    name = "rules_nodejs",
    sha256 = "764a3b3757bb8c3c6a02ba3344731a3d71e558220adcb0cf7e43c9bba2c37ba8",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/5.8.2/rules_nodejs-core-5.8.2.tar.gz"],
)
http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "94070eff79305be05b7699207fbac5d2608054dd53e6109f7d00d923919ff45a",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/5.8.2/rules_nodejs-5.8.2.tar.gz"],
)

#http_archive(
#    name = "build_bazel_rules_nodejs",
#    sha256 = "c911b5bd8aee8b0498cc387cacdb5f917098ce477fb4182db07b0ef8a9e045c0",
#    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/4.7.1/rules_nodejs-4.7.1.tar.gz"],
#)

# load("@build_bazel_rules_nodejs//:index.bzl", "yarn_install")

#yarn_install(
#    name = "npm",
#    package_json = "//:package.json",
#    # symlink_node_modules must be explicitly disabled in rules_nodejs 4.7.1
#    symlink_node_modules = False,
#    yarn_lock = "//:yarn.lock",
#)

http_archive(
    name = "io_bazel_rules_sass",
    sha256 = "9dcfba04e4af896626f4760d866f895ea4291bc30bf7287887cefcf4707b6a62",
    strip_prefix = "rules_sass-1.26.3",
    # Make sure to check for the latest version when you install
    url = "https://github.com/bazelbuild/rules_sass/archive/1.26.3.zip",
)

load("@io_bazel_rules_sass//sass:sass_repositories.bzl", "sass_repositories")
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

load("@org_tensorflow//tensorflow:workspace.bzl", "tf_workspace")
tf_workspace()

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

