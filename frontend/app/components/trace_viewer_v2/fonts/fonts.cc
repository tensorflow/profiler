#include "frontend/app/components/trace_viewer_v2/fonts/fonts.h"

#include <tuple>
#include <vector>

#include "absl/log/log.h"
#include "imgui.h"
#include "frontend/app/components/trace_viewer_v2/fonts/roboto_wdthwght.h"
#include "frontend/app/components/trace_viewer_v2/fonts/trace_viewer_icons.h"

namespace traceviewer::fonts {

ImFont* body_large = nullptr;
ImFont* caption = nullptr;
ImFont* label_large = nullptr;
ImFont* label_medium = nullptr;
ImFont* label_medium_strong = nullptr;
ImFont* label_small = nullptr;
ImFont* title_small = nullptr;
ImFont* title_small_strong = nullptr;

// The font sizes correspond to the GM3 Typography Type scale tokens.
constexpr float kBodyLargeFontSize = 16.0f;
constexpr float kLabelLargeFontSize = 14.0f;
constexpr float kLabelMediumFontSize = 12.0f;
constexpr float kLabelSmallFontSize = 11.0f;
constexpr float kLabelSectionHeaderFontSize = 13.0f;

namespace {

// ImGui takes a mutable pointer to the font data, but it never writes to (or
// frees) it when `ImFontConfig::FontDataOwnedByAtlas` is false, so it is safe
// to pass the embedded read-only data.
void* EmbeddedFontData(const unsigned char* data) {
  return const_cast<unsigned char*>(data);
}

}  // namespace

void LoadFonts(float pixel_ratio) {
  ImGuiIO& io = ImGui::GetIO();
  io.Fonts->Clear();

  ImFontConfig config;
  // RasterizerMultiply adjusts the brightness/alpha of the rasterized glyphs.
  // A fixed value of 1.0f preserves default font appearance.
  config.RasterizerMultiply = 1.0f;
  // All fonts reference the embedded TTF data in place, which lives for the
  // whole program. This avoids keeping a separate heap copy of the TTF data
  // per font in the atlas.
  config.FontDataOwnedByAtlas = false;

  static const ImWchar kRangesBasic[] = {
      0x0020, 0x00FF,  // Basic Latin + Latin Supplement
      0x20AC, 0x20AC,  // Euro Sign
      0x2013, 0x2013,  // en dash
      0x2026, 0x2026,  // ellipsis
      0,
  };

  ImFontConfig config_large = config;
  // Typography tracking for Label Large: requires +0.1 space, but ImGui removed
  // ExtraSpacing.

  ImFontConfig config_medium = config;
  // Typography tracking for Label Medium: requires +0.5 space.

  ImFontConfig config_medium_strong = config_medium;

  // TODO: b/444025890 - Get the fonts and sizes from the UX design.
  auto styles = std::vector{
      std::tuple(&body_large, kBodyLargeFontSize, &config),
      std::tuple(&label_large, kLabelLargeFontSize, &config_large),
      std::tuple(&label_medium, kLabelMediumFontSize, &config_medium),
      std::tuple(&label_medium_strong, kLabelMediumFontSize,
                 &config_medium_strong),
      std::tuple(&label_small, kLabelSmallFontSize, &config),
      std::tuple(&title_small, kLabelSectionHeaderFontSize, &config_medium),
      std::tuple(&title_small_strong, kLabelSectionHeaderFontSize,
                 &config_medium_strong)};

  for (const auto& [font_ptr, base_size, font_config] : styles) {
    // We don't multiply the base_size by pixel_ratio because the font sizes are
    // specified in dips (points). And we
    *(font_ptr) =
        io.Fonts->AddFontFromMemoryTTF(EmbeddedFontData(roboto_wdthwght_data),
                                       static_cast<int>(roboto_wdthwght_size),
                                       base_size, font_config, kRangesBasic);

    if (*(font_ptr) == nullptr) {
      LOG(ERROR) << "Failed to load font size " << base_size
                 << ". Using default.";
      *(font_ptr) = io.Fonts->AddFontDefault();
    }

    // Merge custom icon glyphs into the successfully loaded base font.
    ImFontConfig icons_config = *font_config;
    icons_config.MergeMode = true;
    icons_config.PixelSnapH = true;
    // The icon font is not a variable font, so it has no named instances.
    icons_config.FontNo = 0;
    static const ImWchar icons_ranges[] = {0xe000, 0xe050, 0};
    io.Fonts->AddFontFromMemoryTTF(EmbeddedFontData(trace_viewer_icons_data),
                                   static_cast<int>(trace_viewer_icons_size),
                                   base_size, &icons_config, icons_ranges);
  }
  io.FontDefault = label_large;
}

}  // namespace traceviewer::fonts
