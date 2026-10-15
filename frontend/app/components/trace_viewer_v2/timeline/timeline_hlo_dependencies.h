#ifndef THIRD_PARTY_XPROF_FRONTEND_APP_COMPONENTS_TRACE_VIEWER_V2_TIMELINE_TIMELINE_HLO_DEPENDENCIES_H_
#define THIRD_PARTY_XPROF_FRONTEND_APP_COMPONENTS_TRACE_VIEWER_V2_TIMELINE_TIMELINE_HLO_DEPENDENCIES_H_

#include <string>
#include <vector>

#include "imgui.h"
#include "frontend/app/components/trace_viewer_v2/timeline/constants.h"

namespace traceviewer {

struct FlameChartTimelineData;

// The HLO operands and consumers of the event at `event_index`, and the events
// they resolved to.
struct EventDependencies {
  int event_index = -1;
  std::vector<std::string> operand_names;
  std::vector<std::string> consumer_names;
  std::vector<int> producer_indices;
  std::vector<int> consumer_indices;
};

// Resolves the HLO operands and consumers of the event at
// `selected_event_index` to events with those names on the same track. An
// operand resolves to the closest such event that starts before the selected
// event, and a consumer to the closest one that starts after it. If an event
// on the `XLA Modules` track of the same process contains the selected event,
// only events in that module run are considered. Nothing is resolved if
// `selected_event_index` is out of range. The names are kept in the result, so
// that they can be resolved again in new timeline data.
//
// The names come from the HLO graph, which is the source of truth for which
// ops are the operands and users of an op (the graph viewer's `adj_nodes`
// request, see `GetAdjacentNodes` in hlo_proto_to_graph_view.cc). The trace
// does not record which run of an operand fed which run of its consumer, so
// the closest event with the right name is a best guess. It can miss or be
// wrong when:
// - the operand or consumer has no event of its own, e.g. a `bitcast`;
// - the right event is not loaded, and another event with the same name is
//   closer, e.g. from another iteration of a loop, or from another module
//   run if the trace has no `XLA Modules` track.
EventDependencies ResolveEventDependencies(
    const FlameChartTimelineData& data, int selected_event_index,
    std::vector<std::string> operand_names,
    std::vector<std::string> consumer_names);

// The screen extent of a bar and the vertical center of its row.
struct BarGeometry {
  Pixel left;
  Pixel right;
  Pixel row_y;
};

// The route of an HLO dependency arrow: from `start` on the edge of one bar,
// vertically to `lane_y`, along the lane, and vertically to `end` on the edge
// of the other bar, with corners of `corner_radius`. Routes between bars that
// are too close for an arrowhead have `with_head` unset.
struct DependencyArrowRoute {
  ImVec2 start;
  Pixel lane_y;
  ImVec2 end;
  Pixel corner_radius;
  bool with_head;
};

// Routes the arrow from `from` to `to` around the rows involved, so that it
// does not run through the bars in between. With `above` (the arrows from the
// operands of the selected op) the lane is above the rows, and the arrow runs
// from the middle of the operand to just inside the left end of the selected
// op; otherwise (the arrows to its consumers) the lane is below, from just
// inside the right end of the selected op to the middle of the consumer.
// Anchoring the other bar in its middle keeps a visible span for neighbouring
// ops. `slot` puts parallel arrows on the same side into separate lanes.
DependencyArrowRoute RouteDependencyArrow(const BarGeometry& from,
                                          const BarGeometry& to, bool above,
                                          int slot);

}  // namespace traceviewer

#endif  // THIRD_PARTY_XPROF_FRONTEND_APP_COMPONENTS_TRACE_VIEWER_V2_TIMELINE_TIMELINE_HLO_DEPENDENCIES_H_
