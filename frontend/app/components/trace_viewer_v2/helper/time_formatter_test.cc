#include "frontend/app/components/trace_viewer_v2/helper/time_formatter.h"

#include <limits>
#include <string>

#include <gtest/gtest.h>
#include "absl/strings/str_cat.h"
#include "absl/strings/string_view.h"
#include "frontend/app/components/trace_viewer_v2/trace_helper/trace_event.h"

namespace traceviewer {
namespace {

constexpr absl::string_view kNonBreakingSpace = "\xc2\xa0";

// Returns a time string with value and unit separated by a non-breaking space.
std::string TimeWithUnit(absl::string_view time, absl::string_view unit) {
  return absl::StrCat(time, kNonBreakingSpace, unit);
}

TEST(TimeFormatterTest, FormatTime) {
  EXPECT_EQ(FormatTime(0.0), "0");
  EXPECT_EQ(FormatTime(0.000000456), TimeWithUnit("0.456", "ps"));
  EXPECT_EQ(FormatTime(0.00000123), TimeWithUnit("1.23", "ps"));
  EXPECT_EQ(FormatTime(0.0005), TimeWithUnit("500", "ps"));
  EXPECT_EQ(FormatTime(0.001), TimeWithUnit("1", "ns"));
  EXPECT_EQ(FormatTime(0.5), TimeWithUnit("500", "ns"));
  EXPECT_EQ(FormatTime(1.2345), TimeWithUnit("1.234", "us"));
  EXPECT_EQ(FormatTime(999.9995), TimeWithUnit("1000", "us"));
  EXPECT_EQ(FormatTime(1000.0), TimeWithUnit("1", "ms"));
  EXPECT_EQ(FormatTime(1234.567), TimeWithUnit("1.235", "ms"));
  EXPECT_EQ(FormatTime(999999.9), TimeWithUnit("1000", "ms"));
  EXPECT_EQ(FormatTime(1000000.0), TimeWithUnit("1", "s"));
  EXPECT_EQ(FormatTime(1234567.0), TimeWithUnit("1.235", "s"));
  EXPECT_EQ(FormatTime(60000000.0), TimeWithUnit("60", "s"));
}

TEST(TimeFormatterTest, FormatTimeNotFiniteOrNegative) {
  EXPECT_EQ(FormatTime(std::numeric_limits<double>::infinity()), "-");
  EXPECT_EQ(FormatTime(-std::numeric_limits<double>::infinity()), "-");
  EXPECT_EQ(FormatTime(std::numeric_limits<double>::quiet_NaN()), "-");
  EXPECT_EQ(FormatTime(-0.5), "-");
  EXPECT_EQ(FormatTime(-100.0), "-");
}

TEST(TimeFormatterTest, FormatRulerTimeScalesPrecisionForDeepZoom) {
  // Without a tick interval (or with a coarse interval), defaults to 4
  // significant digits.
  EXPECT_EQ(FormatRulerTime(9025941.0, 0.0), TimeWithUnit("9.026", "s"));
  EXPECT_EQ(FormatRulerTime(9025941.0, 1000.0), TimeWithUnit("9.026", "s"));

  // Zoomed into 10us ticks around 9.026s: adjacent ticks must be distinct and
  // keep uniform trailing zeros.
  EXPECT_EQ(FormatRulerTime(9026000.0, 10.0), TimeWithUnit("9.02600", "s"));
  EXPECT_EQ(FormatRulerTime(9026010.0, 10.0), TimeWithUnit("9.02601", "s"));
  EXPECT_EQ(FormatRulerTime(9026020.0, 10.0), TimeWithUnit("9.02602", "s"));

  // Zoomed into 1us ticks around 9.026s.
  EXPECT_EQ(FormatRulerTime(9025941.0, 1.0), TimeWithUnit("9.025941", "s"));
  EXPECT_EQ(FormatRulerTime(9025942.0, 1.0), TimeWithUnit("9.025942", "s"));

  // Zoomed into 1ns (0.001us) ticks around 9.026s.
  EXPECT_EQ(FormatRulerTime(9025941.001, 0.001),
            TimeWithUnit("9.025941001", "s"));
  EXPECT_EQ(FormatRulerTime(9025941.002, 0.001),
            TimeWithUnit("9.025941002", "s"));

  // Zoomed into 50ps (5e-5us) ticks around 9.025941s: trailing zeros are
  // preserved so adjacent ticks have uniform decimal places.
  EXPECT_EQ(FormatRulerTime(9025941.0, 5e-5),
            TimeWithUnit("9.02594100000", "s"));
  EXPECT_EQ(FormatRulerTime(9025941.0 + 5e-5, 5e-5),
            TimeWithUnit("9.02594100005", "s"));

  // Zoomed into 1ps (1e-6us) ticks around 9.026s.
  EXPECT_EQ(FormatRulerTime(9025941.001001, 1e-6),
            TimeWithUnit("9.025941001001", "s"));
  EXPECT_EQ(FormatRulerTime(9025941.001002, 1e-6),
            TimeWithUnit("9.025941001002", "s"));

  // Zoomed into 50fs (5e-8us) ticks at 12s (requires 16 significant digits,
  // up to max_digits10 = 17).
  EXPECT_NE(FormatRulerTime(12e6, 5e-8), FormatRulerTime(12e6 + 5e-8, 5e-8));

  // Zoomed into 1ns ticks around 500ms.
  EXPECT_EQ(FormatRulerTime(500000.001, 0.001),
            TimeWithUnit("500.000001", "ms"));
  EXPECT_EQ(FormatRulerTime(500000.002, 0.001),
            TimeWithUnit("500.000002", "ms"));
}

TEST(TimeFormatterTest, FormatDurationOnTimeAxisMatchesFormatTime) {
  EXPECT_EQ(FormatDuration(1234.567, TimeAxisUnit::kTime),
            TimeWithUnit("1.235", "ms"));
  EXPECT_EQ(FormatDuration(0.0, TimeAxisUnit::kTime), "0");
}

TEST(TimeFormatterTest, FormatDurationOnUnitlessAxisCountsBundles) {
  EXPECT_EQ(FormatDuration(1.0, TimeAxisUnit::kUnitless),
            TimeWithUnit("1", "bundle"));
  EXPECT_EQ(FormatDuration(32.0, TimeAxisUnit::kUnitless),
            TimeWithUnit("32", "bundles"));
  EXPECT_EQ(FormatDuration(0.0, TimeAxisUnit::kUnitless),
            TimeWithUnit("0", "bundles"));
  // Durations are integers on this axis; stray fractions round.
  EXPECT_EQ(FormatDuration(2.6, TimeAxisUnit::kUnitless),
            TimeWithUnit("3", "bundles"));
}

TEST(TimeFormatterTest, AxisPositionLabel) {
  EXPECT_EQ(AxisPositionLabel(TimeAxisUnit::kTime), "Time");
  EXPECT_EQ(AxisPositionLabel(TimeAxisUnit::kUnitless), "Bundle");
}

TEST(TimeFormatterTest, FormatAxisPosition) {
  EXPECT_EQ(FormatAxisPosition(1234.567, TimeAxisUnit::kTime),
            TimeWithUnit("1.235", "ms"));
  // Each unitless position spans [n, n + 1): a fractional coordinate names
  // the position it falls in, not the nearest one.
  EXPECT_EQ(FormatAxisPosition(1234.7, TimeAxisUnit::kUnitless), "1234");
  EXPECT_EQ(FormatAxisPosition(1234.0, TimeAxisUnit::kUnitless), "1234");
  EXPECT_EQ(FormatAxisPosition(0.2, TimeAxisUnit::kUnitless), "0");
  EXPECT_EQ(FormatAxisPosition(std::numeric_limits<double>::infinity(),
                               TimeAxisUnit::kUnitless),
            "-");
  EXPECT_EQ(FormatAxisPosition(-std::numeric_limits<double>::infinity(),
                               TimeAxisUnit::kUnitless),
            "-");
  EXPECT_EQ(FormatAxisPosition(std::numeric_limits<double>::quiet_NaN(),
                               TimeAxisUnit::kUnitless),
            "-");
}

TEST(TimeFormatterTest, CalculateNiceInterval) {
  EXPECT_DOUBLE_EQ(CalculateNiceInterval(0.0), 1.0);
  EXPECT_DOUBLE_EQ(CalculateNiceInterval(-1.0), 1.0);
  EXPECT_DOUBLE_EQ(CalculateNiceInterval(0.8), 1.0);
  EXPECT_DOUBLE_EQ(CalculateNiceInterval(1.0), 1.0);
  EXPECT_DOUBLE_EQ(CalculateNiceInterval(1.1), 2.0);
  EXPECT_DOUBLE_EQ(CalculateNiceInterval(2.0), 2.0);
  EXPECT_DOUBLE_EQ(CalculateNiceInterval(3.5), 5.0);
  EXPECT_DOUBLE_EQ(CalculateNiceInterval(5.0), 5.0);
  EXPECT_DOUBLE_EQ(CalculateNiceInterval(7.0), 10.0);
  EXPECT_DOUBLE_EQ(CalculateNiceInterval(10.0), 10.0);
  EXPECT_DOUBLE_EQ(CalculateNiceInterval(12.0), 20.0);
  EXPECT_DOUBLE_EQ(CalculateNiceInterval(35.0), 50.0);
  EXPECT_DOUBLE_EQ(CalculateNiceInterval(80.0), 100.0);
  EXPECT_DOUBLE_EQ(CalculateNiceInterval(100.0), 100.0);
  EXPECT_DOUBLE_EQ(CalculateNiceInterval(120.0), 200.0);
  EXPECT_DOUBLE_EQ(CalculateNiceInterval(0.0012), 0.002);
  EXPECT_DOUBLE_EQ(CalculateNiceInterval(0.0035), 0.005);
}
}  // namespace
}  // namespace traceviewer
