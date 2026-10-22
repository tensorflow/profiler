load("//defs:defs.bzl", "sass_binary", "xprof_ng_module")

package(default_visibility = ["//frontend:internal"])

sass_binary(
    name = "static_kernel_viewer_css",
    src = "static_kernel_viewer.scss",
)

sass_binary(
    name = "kernel_event_tooltip_css",
    src = "kernel_event_tooltip.scss",
)

sass_binary(
    name = "kernel_selection_panel_css",
    src = "kernel_selection_panel.scss",
)

sass_binary(
    name = "kernel_minimap_css",
    src = "kernel_minimap.scss",
)

sass_binary(
    name = "kernel_viewer_tour_css",
    src = "kernel_viewer_tour.scss",
)

sass_binary(
    name = "kernel_line_card_css",
    src = "kernel_line_card.scss",
)

sass_binary(
    name = "kernel_source_lines_css",
    src = "kernel_source_lines.scss",
)

sass_binary(
    name = "kernel_source_panel_css",
    src = "kernel_source_panel.scss",
)

xprof_ng_module(
    name = "kernel_minimap",
    srcs = [
        "kernel_minimap.ts",
    ],
    assets = [
        ":kernel_minimap_css",
        "kernel_minimap.ng.html",
    ],
    deps = [
        "//:node_modules/@angular/common",
        "//:node_modules/@angular/core",
        "@org_xprof//frontend/app/common/angular:angular_material_button",
        "@org_xprof//frontend/app/common/angular:angular_material_icon",
        "@org_xprof//frontend/app/common/angular:angular_material_tooltip",
    ],
)

xprof_ng_module(
    name = "static_kernel_viewer",
    srcs = [
        "kernel_event_tooltip.ts",
        "kernel_line_card.ts",
        "kernel_selection_panel.ts",
        "kernel_source_lines.ts",
        "kernel_source_model.ts",
        "kernel_source_panel.ts",
        "kernel_viewer_tour.ts",
        "kernel_viewer_tour_demo.ts",
        "static_kernel_viewer.ts",
        "static_kernel_viewer_module.ts",
    ],
    assets = [
        ":kernel_event_tooltip_css",
        ":kernel_line_card_css",
        ":kernel_selection_panel_css",
        ":kernel_source_lines_css",
        ":kernel_source_panel_css",
        ":kernel_viewer_tour_css",
        ":static_kernel_viewer_css",
        "kernel_event_tooltip.ng.html",
        "kernel_line_card.ng.html",
        "kernel_selection_panel.ng.html",
        "kernel_source_lines.ng.html",
        "kernel_source_panel.ng.html",
        "kernel_viewer_tour.ng.html",
        "static_kernel_viewer.ng.html",
    ],
    deps = [
        ":kernel_minimap",
        "//:node_modules/@angular/common",
        "//:node_modules/@angular/core",
        "//:node_modules/@angular/router",
        "//:node_modules/@ngrx/store",
        "//:node_modules/rxjs",
        "@org_xprof//frontend/app/common/angular:angular_material_button",
        "@org_xprof//frontend/app/common/angular:angular_material_button_toggle",
        "@org_xprof//frontend/app/common/angular:angular_material_chips",
        "@org_xprof//frontend/app/common/angular:angular_material_divider",
        "@org_xprof//frontend/app/common/angular:angular_material_icon",
        "@org_xprof//frontend/app/common/angular:angular_material_menu",
        "@org_xprof//frontend/app/common/angular:angular_material_progress_bar",
        "@org_xprof//frontend/app/common/angular:angular_material_progress_spinner",
        "@org_xprof//frontend/app/common/angular:angular_material_tooltip",
        "@org_xprof//frontend/app/common/constants",
        "@org_xprof//frontend/app/components/trace_viewer_container",
        "@org_xprof//frontend/app/components/trace_viewer_v2:app_bundle_ts",
        "@org_xprof//frontend/app/services/data_service_v2:data_service_v2_interface",
        "@org_xprof//frontend/app/services/source_code_service:source_code_service_interface",
        "@org_xprof//frontend/app/store",
    ],
)

xprof_ng_module(
    name = "tests",
    testonly = True,
    srcs = [
        "kernel_event_tooltip_test.ts",
        "kernel_line_card_test.ts",
        "kernel_minimap_test.ts",
        "kernel_selection_panel_test.ts",
        "kernel_source_lines_test.ts",
        "kernel_source_model_test.ts",
        "kernel_source_panel_test.ts",
        "kernel_viewer_tour_demo_test.ts",
        "kernel_viewer_tour_test.ts",
        "static_kernel_viewer_test.ts",
    ],
    deps = [
        ":kernel_minimap",
        ":static_kernel_viewer",
        "//javascript/angular2/testing/catalyst/fake_async",
        # ksf,
        "//:node_modules/@angular/common",
        "//:node_modules/@angular/core",
        "//:node_modules/@angular/core_testing",
        "@org_xprof//frontend/app/common/angular:angular_platform-browser_animation",
        "//:node_modules/@angular/router",
        "//:node_modules/rxjs",
        "//third_party/javascript/typings/jasmine",
        "@org_xprof//frontend/app/common/interfaces",
        "@org_xprof//frontend/app/components/source_code_editor",
        "@org_xprof//frontend/app/components/source_code_editor:fake_kernel_source_editor",
        "@org_xprof//frontend/app/components/source_code_editor:kernel_source_editor",
        "@org_xprof//frontend/app/components/trace_viewer_container",
        "@org_xprof//frontend/app/components/trace_viewer_v2:app_bundle_ts",
        "@org_xprof//frontend/app/services/data_service_v2:data_service_v2_interface",
        "@org_xprof//frontend/app/services/source_code_service:source_code_service_interface",
        "@org_xprof//frontend/app/store",
    ],
)
