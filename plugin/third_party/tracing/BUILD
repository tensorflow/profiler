licenses(["notice"])

genrule(
    name = "trace_viewer_full",
    srcs = ["trace_viewer_full.html.gz"],
    outs = ["trace_viewer_full.html"],
    cmd = "gzip -d -c $(SRCS) > $(OUTS)",
    visibility = [
        "//plugin:__subpackages__",
    ],
)

# Catapult Trace Viewer (chrome://tracing):
# git clone https://chromium.googlesource.com/catapult
# cd catapult
# git checkout 3f5c581d3b045f00847989a9611912e022021343
# TODO(b/153902654): upstream patch, currently applied locally.
# TODO(b/176299939): upstream patch, currently applied locally.
# tracing/bin/vulcanize_trace_viewer
# gzip tracing/bin/trace_viewer_full.html
exports_files(["trace_viewer_full.html.gz"])
