#include "frontend/app/components/trace_viewer_v2/helper/counter_formatter.h"

#include <cmath>
#include <cstddef>
#include <iterator>
#include <string>

#include "absl/strings/match.h"
#include "absl/strings/str_cat.h"
#include "absl/strings/str_format.h"
#include "absl/strings/string_view.h"
#include "frontend/app/components/trace_viewer_v2/helper/time_formatter.h"
#include "frontend/app/components/trace_viewer_v2/trace_helper/trace_event.h"

namespace traceviewer {
namespace {

// Separates a number from its unit without allowing a line break between them,
// like the time formats in time_formatter.cc.
constexpr absl::string_view kNonBreakingSpace = "\xc2\xa0";

// Fractions are shown as percentages to one decimal place, with trailing zeros
// dropped by %g: 0.75 -> "75%", 0.125 -> "12.5%", 0.1234 -> "12.3%".
constexpr absl::string_view kPercentFormat = "%g%%";
constexpr double kPercentPerFraction = 100.0;

constexpr absl::string_view kByteUnits[] = {"B",   "KiB", "MiB",
                                            "GiB", "TiB", "PiB"};
constexpr double kBytesPerUnit = 1024.0;

std::string FormatFraction(double value) {
  const double percent = value * kPercentPerFraction;
  return absl::StrFormat(kPercentFormat, std::round(percent * 10.0) / 10.0);
}

std::string FormatBytes(double value) {
  double scaled = value;
  size_t unit_index = 0;
  while (std::abs(scaled) >= kBytesPerUnit &&
         unit_index + 1 < std::size(kByteUnits)) {
    scaled /= kBytesPerUnit;
    ++unit_index;
  }
  // Whole bytes have no fraction; scaled units get one decimal.
  const std::string number = unit_index == 0 ? absl::StrFormat("%.0f", scaled)
                                             : absl::StrFormat("%.1f", scaled);
  return absl::StrCat(number, kNonBreakingSpace, kByteUnits[unit_index]);
}

}  // namespace

std::string FormatCounterValue(double value, CounterUnit unit) {
  switch (unit) {
    case CounterUnit::kFraction:
      return FormatFraction(value);
    case CounterUnit::kBytes:
      return FormatBytes(value);
    case CounterUnit::kNone:
      break;
  }
  return absl::StrFormat("%.2f", value);
}

std::string FormatCounterAxisLabel(absl::string_view track_name, double value,
                                   CounterUnit unit) {
  if (absl::StartsWith(track_name, kCanaryCounterPrefix)) {
    return absl::StrFormat("[sci:%.3g]", value);
  }
  return FormatCounterValue(value, unit);
}

std::string FormatCounterTooltip(TimeAxisUnit axis_unit, Microseconds position,
                                 double value, CounterUnit counter_unit) {
  return absl::StrCat(AxisPositionLabel(axis_unit), ": ",
                      FormatAxisPosition(position, axis_unit),
                      "\nValue: ", FormatCounterValue(value, counter_unit));
}

}  // namespace traceviewer
