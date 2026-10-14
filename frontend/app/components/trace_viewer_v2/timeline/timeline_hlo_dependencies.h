#ifndef THIRD_PARTY_XPROF_FRONTEND_APP_COMPONENTS_TRACE_VIEWER_V2_TIMELINE_TIMELINE_HLO_DEPENDENCIES_H_
#define THIRD_PARTY_XPROF_FRONTEND_APP_COMPONENTS_TRACE_VIEWER_V2_TIMELINE_TIMELINE_HLO_DEPENDENCIES_H_

#include <string>
#include <vector>

#include "absl/types/span.h"

namespace traceviewer {

struct FlameChartTimelineData;

// The events that the HLO operands and consumers of the event at `event_index`
// resolved to.
struct EventDependencies {
  int event_index = -1;
  std::vector<int> producer_indices;
  std::vector<int> consumer_indices;
};

// Resolves the HLO operands and consumers of the event at
// `selected_event_index` to events with those names on the same track. An
// operand resolves to the closest such event that starts before the selected
// event, and a consumer to the closest one that starts after it. Nothing is
// resolved if `selected_event_index` is out of range.
//
// The names come from the HLO graph, which is the source of truth for which
// ops are the operands and users of an op (the graph viewer's `adj_nodes`
// request, see `GetAdjacentNodes` in hlo_proto_to_graph_view.cc). The trace
// does not record which run of an operand fed which run of its consumer, so
// the closest event with the right name is a best guess. It can miss or be
// wrong when:
// - the operand or consumer has no event of its own, e.g. a `bitcast`;
// - the right event is not loaded, and an event with the same name from
//   another module or step is closer.
EventDependencies ResolveEventDependencies(
    const FlameChartTimelineData& data, int selected_event_index,
    absl::Span<const std::string> operand_names,
    absl::Span<const std::string> consumer_names);

}  // namespace traceviewer

#endif  // THIRD_PARTY_XPROF_FRONTEND_APP_COMPONENTS_TRACE_VIEWER_V2_TIMELINE_TIMELINE_HLO_DEPENDENCIES_H_
