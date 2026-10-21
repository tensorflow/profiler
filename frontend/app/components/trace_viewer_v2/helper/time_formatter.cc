#include "frontend/app/components/trace_viewer_v2/helper/time_formatter.h"

#include <algorithm>
#include <cmath>
#include <cstdint>
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

// The format specifiers use a non-breaking space (\xc2\xa0) to prevent the
// time unit from being separated from the number by a line break.
constexpr absl::string_view kPicosecondsFormat = "%.4g\xc2\xa0ps";
constexpr absl::string_view kNanosecondsFormat = "%.4g\xc2\xa0ns";
constexpr absl::string_view kMicrosecondsFormat = "%.4g\xc2\xa0us";
constexpr absl::string_view kMillisecondsFormat = "%.4g\xc2\xa0ms";
constexpr absl::string_view kSecondsFormat = "%.4g\xc2\xa0s";

// Wording for a unitless x-axis. The only producer of such traces today is the
// static kernel schedule, whose positions are compiler-scheduled bundles; this
// is the one place that spells that out.
constexpr absl::string_view kNonBreakingSpace = "\xc2\xa0";
constexpr absl::string_view kUnitlessSingular = "bundle";
constexpr absl::string_view kUnitlessPlural = "bundles";
constexpr absl::string_view kUnitlessPositionLabel = "Bundle";
constexpr absl::string_view kTimePositionLabel = "Time";

// The most decimal places a ruler label shows (nanoseconds when the label is in
// seconds). This keeps labels narrower than the minimum major tick spacing.
constexpr int kMaxRulerLabelDecimals = 9;

}  // namespace

std::string FormatTime(Microseconds time_us) {
  if (!std::isfinite(time_us) || time_us < 0) {
    return "-";
  }

  if (time_us == 0.0) {
    return "0";
  }

  if (time_us < 1 / kNanosPerMicro) {
    return absl::StrFormat(kPicosecondsFormat, time_us * kPicosPerMicro);
  } else if (time_us < 1.0) {
    return absl::StrFormat(kNanosecondsFormat, time_us * kNanosPerMicro);
  } else if (time_us < kMicrosPerMilli) {
    return absl::StrFormat(kMicrosecondsFormat, time_us);
  } else if (time_us < kMicrosPerSecond) {
    return absl::StrFormat(kMillisecondsFormat, time_us / kMicrosPerMilli);
  } else {  // >= 1 second
    return absl::StrFormat(kSecondsFormat, time_us / kMicrosPerSecond);
  }
}

std::string FormatRulerTime(Microseconds time_us,
                            Microseconds tick_interval_us) {
  if (!std::isfinite(tick_interval_us) || tick_interval_us <= 0 ||
      !std::isfinite(time_us) || time_us <= 0) {
    return FormatTime(time_us);
  }

  // Use the same unit as FormatTime().
  double micros_per_unit = kMicrosPerSecond;
  absl::string_view unit = "s";
  if (time_us < 1 / kNanosPerMicro) {
    micros_per_unit = 1 / kPicosPerMicro;
    unit = "ps";
  } else if (time_us < 1.0) {
    micros_per_unit = 1 / kNanosPerMicro;
    unit = "ns";
  } else if (time_us < kMicrosPerMilli) {
    micros_per_unit = 1.0;
    unit = "us";
  } else if (time_us < kMicrosPerSecond) {
    micros_per_unit = kMicrosPerMilli;
    unit = "ms";
  }

  // Show as many decimal places as the tick interval needs in that unit, e.g. 6
  // for 2us ticks in seconds. The epsilon keeps an interval that is an exact
  // power of 10 from getting an extra digit due to rounding in log10.
  const int decimals = std::clamp(
      static_cast<int>(
          std::ceil(-std::log10(tick_interval_us / micros_per_unit) - 1e-9)),
      0, kMaxRulerLabelDecimals);
  std::string number =
      absl::StrFormat("%.*f", decimals, time_us / micros_per_unit);
  // Drop trailing zeros so that round ticks stay short ("1.50" -> "1.5",
  // "2.000" -> "2"), as with FormatTime().
  if (decimals > 0) {
    number.erase(number.find_last_not_of('0') + 1);
    if (number.back() == '.') number.pop_back();
  }
  return absl::StrCat(number, kNonBreakingSpace, unit);
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
