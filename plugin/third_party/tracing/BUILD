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
