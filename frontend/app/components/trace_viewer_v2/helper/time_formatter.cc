#include "frontend/app/components/trace_viewer_v2/helper/time_formatter.h"

#include <algorithm>
#include <cmath>
#include <cstdint>
#include <limits>
#include <optional>
#include <string>

#include "absl/strings/str_cat.h"
#include "absl/strings/str_format.h"
#include "absl/strings/string_view.h"
#include "frontend/app/components/trace_viewer_v2/trace_helper/trace_event.h"

namespace traceviewer {
namespace {

constexpr double kPicosPerMicro = 1000'000.0;
constexpr double kNanosPerMicro = 1000.0;
constexpr double kMicrosPerMilli = 1000.0;
constexpr double kMicrosPerSecond = 1000'000.0;

constexpr int kDefaultSignificantDigits = 4;
constexpr int kMaxSignificantDigits =
    std::numeric_limits<double>::max_digits10;

// The format specifiers use a non-breaking space (\xc2\xa0) to prevent the
// time unit from being separated from the number by a line break.
constexpr absl::string_view kTimeWithUnitFormat = "%.*g\xc2\xa0%s";
constexpr absl::string_view kFixedTimeWithUnitFormat = "%.*f\xc2\xa0%s";

// Wording for a unitless x-axis. The only producer of such traces today is the
// static kernel schedule, whose positions are compiler-scheduled bundles; this
// is the one place that spells that out.
constexpr absl::string_view kNonBreakingSpace = "\xc2\xa0";
constexpr absl::string_view kUnitlessSingular = "bundle";
constexpr absl::string_view kUnitlessPlural = "bundles";
constexpr absl::string_view kUnitlessPositionLabel = "Bundle";
constexpr absl::string_view kTimePositionLabel = "Time";

// Returns the number of fixed decimal places to format `value_in_unit` when
// `step_in_unit` requires more than `kDefaultSignificantDigits`, or
// `std::nullopt` when default `%.4g` formatting is sufficient.
std::optional<int> CalculateDeepZoomDecimals(double value_in_unit,
                                             double step_in_unit) {
  if (!std::isfinite(step_in_unit) || step_in_unit <= 0.0 ||
      value_in_unit <= 0.0) {
    return std::nullopt;
  }

  const int leading_digit_exp =
      static_cast<int>(std::floor(std::log10(value_in_unit) + 1e-12));
  int step_exp = static_cast<int>(std::floor(std::log10(step_in_unit) + 1e-12));
  const double step_mantissa = step_in_unit / std::pow(10.0, step_exp);
  if (std::abs(step_mantissa - std::round(step_mantissa)) > 1e-6) {
    --step_exp;
  }

  const int needed_digits = leading_digit_exp - step_exp + 1;
  if (needed_digits <= kDefaultSignificantDigits) {
    return std::nullopt;
  }
  const int clamped_digits = std::min(needed_digits, kMaxSignificantDigits);
  return std::max(0, clamped_digits - leading_digit_exp - 1);
}

}  // namespace

std::string FormatTime(Microseconds time_us) {
  return FormatRulerTime(time_us, /*tick_interval_us=*/0.0);
}

std::string FormatRulerTime(Microseconds time_us,
                            Microseconds tick_interval_us) {
  if (!std::isfinite(time_us) || time_us < 0) {
    return "-";
  }

  if (time_us == 0.0) {
    return "0";
  }

  double value_in_unit = time_us;
  double unit_us = 1.0;
  absl::string_view unit = "us";
  if (time_us < 1 / kNanosPerMicro) {
    value_in_unit = time_us * kPicosPerMicro;
    unit_us = 1.0 / kPicosPerMicro;
    unit = "ps";
  } else if (time_us < 1.0) {
    value_in_unit = time_us * kNanosPerMicro;
    unit_us = 1.0 / kNanosPerMicro;
    unit = "ns";
  } else if (time_us < kMicrosPerMilli) {
    value_in_unit = time_us;
    unit_us = 1.0;
    unit = "us";
  } else if (time_us < kMicrosPerSecond) {
    value_in_unit = time_us / kMicrosPerMilli;
    unit_us = kMicrosPerMilli;
    unit = "ms";
  } else {  // >= 1 second
    value_in_unit = time_us / kMicrosPerSecond;
    unit_us = kMicrosPerSecond;
    unit = "s";
  }

  if (const std::optional<int> decimals =
          CalculateDeepZoomDecimals(value_in_unit, tick_interval_us / unit_us);
      decimals.has_value()) {
    return absl::StrFormat(kFixedTimeWithUnitFormat, *decimals, value_in_unit,
                           unit);
  }
  return absl::StrFormat(kTimeWithUnitFormat, kDefaultSignificantDigits,
                         value_in_unit, unit);
}

std::string FormatDuration(Microseconds duration, TimeAxisUnit unit) {
  switch (unit) {
    case TimeAxisUnit::kUnitless: {
      const int64_t count = std::llround(duration);
      return absl::StrCat(count, kNonBreakingSpace,
                          count == 1 ? kUnitlessSingular : kUnitlessPlural);
    }
    case TimeAxisUnit::kTime:
      break;
  }
  return FormatTime(duration);
}

absl::string_view AxisPositionLabel(TimeAxisUnit unit) {
  switch (unit) {
    case TimeAxisUnit::kUnitless:
      return kUnitlessPositionLabel;
    case TimeAxisUnit::kTime:
      break;
  }
  return kTimePositionLabel;
}

std::string FormatAxisPosition(Microseconds position, TimeAxisUnit unit) {
  switch (unit) {
    case TimeAxisUnit::kUnitless:
      if (!std::isfinite(position)) {
        return "-";
      }
      // Positions are integers and each one spans [n, n + 1), so the position
      // under a fractional coordinate is its floor.
      return absl::StrCat(static_cast<int64_t>(std::floor(position)));
    case TimeAxisUnit::kTime:
      break;
  }
  return FormatTime(position);
}

Microseconds MillisToMicros(double time_ms) {
  return time_ms * kMicrosPerMilli;
}

Milliseconds MicrosToMillis(Microseconds time_us) {
  return time_us / kMicrosPerMilli;
}

Microseconds CalculateNiceInterval(Microseconds min_interval) {
  if (min_interval <= 0) return 1.0;

  const double power_of_10 =
      std::pow(10.0, std::floor(std::log10(min_interval)));

  constexpr double kNiceIntervals[] = {1.0, 2.0, 5.0, 10.0};

  for (double nice_interval : kNiceIntervals) {
    Microseconds interval = nice_interval * power_of_10;
    if (interval >= min_interval) {
      return interval;
    }
  }
  // This part is unreachable because the loop is guaranteed to return.
  // The last value (10.0 * power_of_10) will always be greater than or equal to
  // min_interval. However, a return statement is required by the compiler.
  return 10.0 * power_of_10;
}

}  // namespace traceviewer
