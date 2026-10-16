#ifndef THIRD_PARTY_XPROF_FRONTEND_APP_COMPONENTS_TRACE_VIEWER_V2_HELPER_COUNTER_FORMATTER_H_
#define THIRD_PARTY_XPROF_FRONTEND_APP_COMPONENTS_TRACE_VIEWER_V2_HELPER_COUNTER_FORMATTER_H_

#include <string>

#include "absl/strings/string_view.h"
#include "frontend/app/components/trace_viewer_v2/trace_helper/trace_event.h"

namespace traceviewer {

inline constexpr absl::string_view kCanaryCounterPrefix =
    "[xpress_sandbox_sci3]";

// Formats a counter value in its declared unit: "75%" / "12.5%" for a
// kFraction of 0.75 / 0.125, "11.8 MiB" for kBytes (1024-based), and a plain
// "0.75" for kNone.
std::string FormatCounterValue(double value, CounterUnit unit);

// Formats min/max counter axis labels. If the counter track's name starts with
// `[xpress_sandbox_sci3]`, formats as "[sci:%.3g]" using compact
// 3-significant-digit general format. Otherwise, falls back to
// FormatCounterValue(value, unit).
std::string FormatCounterAxisLabel(absl::string_view track_name, double value,
                                   CounterUnit unit);

// Formats the tooltip of a hovered counter point, e.g.
//   "Time: 1.235 ms\nValue: 0.75"   on a time axis with no counter unit, or
//   "Bundle: 1234\nValue: 75%"      on a unitless axis with a fraction counter.
std::string FormatCounterTooltip(TimeAxisUnit axis_unit, Microseconds position,
                                 double value, CounterUnit counter_unit);

}  // namespace traceviewer

#endif  // THIRD_PARTY_XPROF_FRONTEND_APP_COMPONENTS_TRACE_VIEWER_V2_HELPER_COUNTER_FORMATTER_H_
