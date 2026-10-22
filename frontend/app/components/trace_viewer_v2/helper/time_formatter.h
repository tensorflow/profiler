#ifndef THIRD_PARTY_XPROF_FRONTEND_APP_COMPONENTS_TRACE_VIEWER_V2_HELPER_TIME_FORMATTER_H_
#define THIRD_PARTY_XPROF_FRONTEND_APP_COMPONENTS_TRACE_VIEWER_V2_HELPER_TIME_FORMATTER_H_

#include <string>

#include "absl/strings/string_view.h"
#include "frontend/app/components/trace_viewer_v2/trace_helper/trace_event.h"

namespace traceviewer {

std::string FormatTime(Microseconds time_us);

// Formats `time_us` for a ruler tick given the major `tick_interval_us`,
// increasing precision beyond the default 4 significant digits (up to IEEE-754
// double precision limits) when needed so adjacent ticks at deep zoom levels
// produce distinct labels.
std::string FormatRulerTime(Microseconds time_us,
                            Microseconds tick_interval_us);

// Formats a duration along the x-axis: FormatTime() on a time axis, a count
// of positions ("1 bundle", "32 bundles") on a unitless one.
std::string FormatDuration(Microseconds duration, TimeAxisUnit unit);

// The label of an absolute x-axis position in tooltips: "Time" or "Bundle".
absl::string_view AxisPositionLabel(TimeAxisUnit unit);

// Formats an absolute x-axis position: FormatTime() on a time axis, the
// integer position that contains `position` on a unitless one.
std::string FormatAxisPosition(Microseconds position, TimeAxisUnit unit);

// Converts milliseconds to microseconds.
Microseconds MillisToMicros(double time_ms);

// Converts microseconds to milliseconds.
Milliseconds MicrosToMillis(Microseconds time_us);

// Calculates a "nice" time interval for ruler ticks. The interval is chosen
// from a set of values {1, 2, 5} scaled by a power of 10, ensuring it is
// greater than or equal to `min_interval`.
Microseconds CalculateNiceInterval(Microseconds min_interval);

}  // namespace traceviewer

#endif  // THIRD_PARTY_XPROF_FRONTEND_APP_COMPONENTS_TRACE_VIEWER_V2_HELPER_TIME_FORMATTER_H_
