#ifndef THIRD_PARTY_XPROF_FRONTEND_APP_COMPONENTS_TRACE_VIEWER_V2_FONTS_FONTS_H_
#define THIRD_PARTY_XPROF_FRONTEND_APP_COMPONENTS_TRACE_VIEWER_V2_FONTS_FONTS_H_
struct ImFont;

namespace traceviewer::fonts {

void LoadFonts(float pixel_ratio);

extern ImFont* body_large;
extern ImFont* caption;
extern ImFont* label_large;
extern ImFont* label_medium;
// Same size as `label_medium`, using the Medium (wght 500) weight when the font
// loader can select variable-font instances (FreeType). With stb_truetype it
// renders at the regular weight.
extern ImFont* label_medium_strong;
extern ImFont* label_small;
extern ImFont* title_small;
// Same size as `title_small`, using the Medium (wght 500) weight when the font
// loader can select variable-font instances (FreeType). With stb_truetype it
// renders at the regular weight.
extern ImFont* title_small_strong;

}  // namespace traceviewer::fonts

#endif  // THIRD_PARTY_XPROF_FRONTEND_APP_COMPONENTS_TRACE_VIEWER_V2_FONTS_FONTS_H_
