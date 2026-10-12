#include "frontend/app/components/trace_viewer_v2/helper/counter_formatter.h"

#include <string>

#include <gtest/gtest.h>
#include "absl/strings/str_cat.h"
#include "absl/strings/string_view.h"
#include "frontend/app/components/trace_viewer_v2/trace_helper/trace_event.h"

namespace traceviewer {
namespace {

constexpr absl::string_view kNonBreakingSpace = "\xc2\xa0";

// Returns a value string with number and unit separated by a non-breaking
// space.
std::string WithUnit(absl::string_view number, absl::string_view unit) {
  return absl::StrCat(number, kNonBreakingSpace, unit);
}

TEST(CounterFormatterTest, FormatCounterValueWithoutUnitIsPlainNumber) {
  EXPECT_EQ(FormatCounterValue(0.75, CounterUnit::kNone), "0.75");
  EXPECT_EQ(FormatCounterValue(12.0, CounterUnit::kNone), "12.00");
  EXPECT_EQ(FormatCounterValue(-3.14159, CounterUnit::kNone), "-3.14");
}

TEST(CounterFormatterTest, FormatCounterValueFractionAsPercent) {
  EXPECT_EQ(FormatCounterValue(0.0, CounterUnit::kFraction), "0%");
  EXPECT_EQ(FormatCounterValue(0.75, CounterUnit::kFraction), "75%");
  EXPECT_EQ(FormatCounterValue(1.0, CounterUnit::kFraction), "100%");
  EXPECT_EQ(FormatCounterValue(0.125, CounterUnit::kFraction), "12.5%");
  // One decimal place, trailing zeros dropped.
  EXPECT_EQ(FormatCounterValue(0.1234, CounterUnit::kFraction), "12.3%");
  EXPECT_EQ(FormatCounterValue(0.9996, CounterUnit::kFraction), "100%");
  EXPECT_EQ(FormatCounterValue(0.0004, CounterUnit::kFraction), "0%");
  // Ratios above 1 are not clamped (e.g. a zero-denominator fallback).
  EXPECT_EQ(FormatCounterValue(2.0, CounterUnit::kFraction), "200%");
}

TEST(CounterFormatterTest, FormatCounterValueBytes) {
  EXPECT_EQ(FormatCounterValue(0.0, CounterUnit::kBytes), WithUnit("0", "B"));
  EXPECT_EQ(FormatCounterValue(512.0, CounterUnit::kBytes),
            WithUnit("512", "B"));
  EXPECT_EQ(FormatCounterValue(1024.0, CounterUnit::kBytes),
            WithUnit("1.0", "KiB"));
  EXPECT_EQ(FormatCounterValue(1536.0, CounterUnit::kBytes),
            WithUnit("1.5", "KiB"));
  EXPECT_EQ(FormatCounterValue(12345678.0, CounterUnit::kBytes),
            WithUnit("11.8", "MiB"));
  EXPECT_EQ(FormatCounterValue(3.0 * 1024 * 1024 * 1024, CounterUnit::kBytes),
            WithUnit("3.0", "GiB"));
  EXPECT_EQ(FormatCounterValue(-2048.0, CounterUnit::kBytes),
            WithUnit("-2.0", "KiB"));
}

TEST(CounterFormatterTest, FormatCounterTooltipOnTimeAxis) {
  EXPECT_EQ(FormatCounterTooltip(TimeAxisUnit::kTime, 1234.567, 0.75,
                                 CounterUnit::kNone),
            absl::StrCat("Time: ", WithUnit("1.235", "ms"), "\nValue: 0.75"));
  EXPECT_EQ(FormatCounterTooltip(TimeAxisUnit::kTime, 1234.567, 0.75,
                                 CounterUnit::kFraction),
            absl::StrCat("Time: ", WithUnit("1.235", "ms"), "\nValue: 75%"));
}

TEST(CounterFormatterTest, FormatCounterTooltipOnUnitlessAxis) {
  // The position is the integer bundle that contains the hovered coordinate.
  EXPECT_EQ(FormatCounterTooltip(TimeAxisUnit::kUnitless, 1234.7, 0.75,
                                 CounterUnit::kFraction),
            "Bundle: 1234\nValue: 75%");
  EXPECT_EQ(FormatCounterTooltip(TimeAxisUnit::kUnitless, 0.0, 0.5,
                                 CounterUnit::kNone),
            "Bundle: 0\nValue: 0.50");
}

}  // namespace
}  // namespace traceviewer
