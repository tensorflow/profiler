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
# git checkout d9d7213a6c08cd636ae27cea934259f7fa03ee65
# tracing/bin/vulcanize_trace_viewer
# gzip tracing/bin/trace_viewer_full.html
exports_files(["trace_viewer_full.html.gz"])
