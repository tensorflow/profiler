// Tests for the HLO dependency lookup in timeline_hlo_dependencies.cc.

#include <cstddef>
#include <cstdint>
#include <initializer_list>
#include <numeric>
#include <string>
#include <vector>

#include <gmock/gmock.h>
#include <gtest/gtest.h>
#include "absl/strings/string_view.h"
#include "absl/types/span.h"
#include "frontend/app/components/trace_viewer_v2/color/colors.h"
#include "frontend/app/components/trace_viewer_v2/event_data.h"
#include "frontend/app/components/trace_viewer_v2/timeline/constants.h"
#include "frontend/app/components/trace_viewer_v2/timeline/timeline.h"
#include "frontend/app/components/trace_viewer_v2/trace_helper/trace_event.h"

namespace traceviewer {
namespace testing {
namespace {

using ::testing::ElementsAre;
using ::testing::IsEmpty;

// Compact multi-event builder specification.
struct EventSpec {
  std::string name = "Event";
  double start = 100.0;
  double dur = 50.0;
  uint16_t level = 0;
  EventId id = 1;
};

// Compactly appends events to timeline data parallel vectors.
inline void AddEvents(FlameChartTimelineData& data,
                      std::initializer_list<EventSpec> specs) {
  for (const EventSpec& s : specs) {
    data.entry_names.push_back(s.name);
    data.entry_start_times.push_back(s.start);
    data.entry_total_times.push_back(s.dur);
    data.entry_levels.push_back(s.level);
    data.entry_event_ids.push_back(s.id);
    data.entry_args.push_back({});
  }
}

// Helpers for concise timeline test data construction and verification.
Group MakeThreadGroup(absl::string_view name, int parent_index,
                      int start_level = 0, int level_count = 1,
                      bool expanded = true, ProcessId pid = 0,
                      ThreadId tid = 0) {
  return {.type = Group::Type::kFlame,
          .name = std::string(name),
          .start_level = start_level,
          .nesting_level = kThreadNestingLevel,
          .expanded = expanded,
          .parent_index = parent_index,
          .level_count = level_count,
          .pid = pid,
          .tid = tid};
}

// Builds data for the HLO dependency tests: an "XLA Ops" track with levels 0
// and 1, followed by an "Other" track with level 2. `events` must be sorted by
// level, then by start time.
FlameChartTimelineData MakeDependencyTestData(
    absl::Span<const EventSpec> events) {
  FlameChartTimelineData data;
  data.groups = {MakeThreadGroup("XLA Ops", /*parent_index=*/-1,
                                 /*start_level=*/0, /*level_count=*/2),
                 MakeThreadGroup("Other", /*parent_index=*/-1,
                                 /*start_level=*/2, /*level_count=*/1)};
  for (const EventSpec& event : events) AddEvents(data, {event});
  data.level_offsets.assign(/*total_levels=*/3 + 1, 0);
  for (const uint16_t level : data.entry_levels) {
    ++data.level_offsets[level + 1];
  }
  std::partial_sum(data.level_offsets.begin(), data.level_offsets.end(),
                   data.level_offsets.begin());
  data.level_event_indices.resize(data.entry_levels.size());
  std::iota(data.level_event_indices.begin(), data.level_event_indices.end(),
            0);
  return data;
}

TEST(TimelineTest, SelectedEventDependenciesResolveToClosestEvents) {
  ColorPalette palette = ColorPalette::Default();
  Timeline timeline(palette);
  timeline.set_hlo_dependency_arrows_enabled(true);
  // level 0:  operand   operand   selected   consumer   consumer
  //                     ^ closest            ^ closest
  timeline.SetTimelineData(MakeDependencyTestData({
      {.name = "operand", .start = 0.0, .dur = 10.0, .level = 0, .id = 1},
      {.name = "operand", .start = 20.0, .dur = 10.0, .level = 0, .id = 2},
      {.name = "selected", .start = 40.0, .dur = 10.0, .level = 0, .id = 3},
      {.name = "consumer", .start = 60.0, .dur = 10.0, .level = 0, .id = 4},
      {.name = "consumer", .start = 80.0, .dur = 10.0, .level = 0, .id = 5},
  }));
  timeline.set_selected_event_index_for_test(2);

  timeline.SetSelectedEventDependencies({"operand"}, {"consumer"});

  EXPECT_THAT(timeline.producer_event_indices(), ElementsAre(1));
  EXPECT_THAT(timeline.consumer_event_indices(), ElementsAre(3));
}

TEST(TimelineTest, SelectedEventDependenciesResolveAcrossLevelsOfTrack) {
  ColorPalette palette = ColorPalette::Default();
  Timeline timeline(palette);
  timeline.set_hlo_dependency_arrows_enabled(true);
  // level 0:  operand             selected             consumer
  // level 1:            operand               consumer
  //                     ^ closest             ^ closest
  timeline.SetTimelineData(MakeDependencyTestData({
      {.name = "operand", .start = 10.0, .dur = 10.0, .level = 0, .id = 1},
      {.name = "selected", .start = 40.0, .dur = 10.0, .level = 0, .id = 2},
      {.name = "consumer", .start = 70.0, .dur = 10.0, .level = 0, .id = 3},
      {.name = "operand", .start = 20.0, .dur = 10.0, .level = 1, .id = 4},
      {.name = "consumer", .start = 60.0, .dur = 10.0, .level = 1, .id = 5},
  }));
  timeline.set_selected_event_index_for_test(1);

  timeline.SetSelectedEventDependencies({"operand"}, {"consumer"});

  EXPECT_THAT(timeline.producer_event_indices(), ElementsAre(3));
  EXPECT_THAT(timeline.consumer_event_indices(), ElementsAre(4));
}

TEST(TimelineTest, SelectedEventDependenciesIgnoreOtherTracks) {
  ColorPalette palette = ColorPalette::Default();
  Timeline timeline(palette);
  timeline.set_hlo_dependency_arrows_enabled(true);
  // XLA Ops, level 0:  operand             selected
  // Other,   level 2:            operand             consumer   (not searched)
  timeline.SetTimelineData(MakeDependencyTestData({
      {.name = "operand", .start = 0.0, .dur = 10.0, .level = 0, .id = 1},
      {.name = "selected", .start = 40.0, .dur = 10.0, .level = 0, .id = 2},
      {.name = "operand", .start = 30.0, .dur = 10.0, .level = 2, .id = 3},
      {.name = "consumer", .start = 60.0, .dur = 10.0, .level = 2, .id = 4},
  }));
  timeline.set_selected_event_index_for_test(1);

  timeline.SetSelectedEventDependencies({"operand"}, {"consumer"});

  EXPECT_THAT(timeline.producer_event_indices(), ElementsAre(0));
  EXPECT_THAT(timeline.consumer_event_indices(), IsEmpty());
}

TEST(TimelineTest, SelectedEventDependenciesSkipUnknownAndRepeatedNames) {
  ColorPalette palette = ColorPalette::Default();
  Timeline timeline(palette);
  timeline.set_hlo_dependency_arrows_enabled(true);
  timeline.SetTimelineData(MakeDependencyTestData({
      {.name = "a", .start = 0.0, .dur = 10.0, .level = 0, .id = 1},
      {.name = "b", .start = 10.0, .dur = 10.0, .level = 0, .id = 2},
      {.name = "selected", .start = 40.0, .dur = 10.0, .level = 0, .id = 3},
  }));
  timeline.set_selected_event_index_for_test(2);

  timeline.SetSelectedEventDependencies({"b", "missing", "a", "b"},
                                        {"missing"});

  EXPECT_THAT(timeline.producer_event_indices(), ElementsAre(1, 0));
  EXPECT_THAT(timeline.consumer_event_indices(), IsEmpty());
}

TEST(TimelineTest, SelectedEventDependenciesExcludeEventsStartingAtSameTime) {
  ColorPalette palette = ColorPalette::Default();
  Timeline timeline(palette);
  timeline.set_hlo_dependency_arrows_enabled(true);
  // level 0:  selected
  // level 1:  child      (same start: neither before nor after)
  timeline.SetTimelineData(MakeDependencyTestData({
      {.name = "selected", .start = 40.0, .dur = 10.0, .level = 0, .id = 1},
      {.name = "child", .start = 40.0, .dur = 5.0, .level = 1, .id = 2},
  }));
  timeline.set_selected_event_index_for_test(0);

  timeline.SetSelectedEventDependencies({"child"}, {"child"});

  EXPECT_THAT(timeline.producer_event_indices(), IsEmpty());
  EXPECT_THAT(timeline.consumer_event_indices(), IsEmpty());
}

TEST(TimelineTest, SelectedEventDependenciesMatchNamesExactly) {
  ColorPalette palette = ColorPalette::Default();
  Timeline timeline(palette);
  timeline.set_hlo_dependency_arrows_enabled(true);
  timeline.SetTimelineData(MakeDependencyTestData({
      {.name = "fusion.1", .start = 0.0, .dur = 10.0, .level = 0, .id = 1},
      {.name = "fusion.10", .start = 20.0, .dur = 10.0, .level = 0, .id = 2},
      {.name = "selected", .start = 40.0, .dur = 10.0, .level = 0, .id = 3},
  }));
  timeline.set_selected_event_index_for_test(2);

  timeline.SetSelectedEventDependencies({"fusion.1"}, {});

  EXPECT_THAT(timeline.producer_event_indices(), ElementsAre(0));
}

TEST(TimelineTest, SelectedEventDependenciesResolveFromNestedLevel) {
  ColorPalette palette = ColorPalette::Default();
  Timeline timeline(palette);
  timeline.set_hlo_dependency_arrows_enabled(true);
  // level 0:  operand   [ parent          ]   consumer
  // level 1:                selected
  timeline.SetTimelineData(MakeDependencyTestData({
      {.name = "operand", .start = 0.0, .dur = 10.0, .level = 0, .id = 1},
      {.name = "parent", .start = 30.0, .dur = 30.0, .level = 0, .id = 2},
      {.name = "consumer", .start = 70.0, .dur = 10.0, .level = 0, .id = 3},
      {.name = "selected", .start = 40.0, .dur = 10.0, .level = 1, .id = 4},
  }));
  timeline.set_selected_event_index_for_test(3);

  timeline.SetSelectedEventDependencies({"operand"}, {"consumer"});

  EXPECT_THAT(timeline.producer_event_indices(), ElementsAre(0));
  EXPECT_THAT(timeline.consumer_event_indices(), ElementsAre(2));
}

TEST(TimelineTest, SelectedEventDependenciesIgnoreTracksAboveSelectedEvent) {
  ColorPalette palette = ColorPalette::Default();
  Timeline timeline(palette);
  timeline.set_hlo_dependency_arrows_enabled(true);
  // XLA Ops, level 0:            operand                   (not searched)
  // XLA Ops, level 1:                               consumer   (not searched)
  // Other,   level 2:  operand          selected
  timeline.SetTimelineData(MakeDependencyTestData({
      {.name = "operand", .start = 30.0, .dur = 5.0, .level = 0, .id = 1},
      {.name = "consumer", .start = 60.0, .dur = 5.0, .level = 1, .id = 2},
      {.name = "operand", .start = 0.0, .dur = 10.0, .level = 2, .id = 3},
      {.name = "selected", .start = 40.0, .dur = 10.0, .level = 2, .id = 4},
  }));
  timeline.set_selected_event_index_for_test(3);

  timeline.SetSelectedEventDependencies({"operand"}, {"consumer"});

  // Only the "Other" track of the selected event is searched, so the closer
  // `operand` and the `consumer` on the "XLA Ops" track are not found.
  EXPECT_THAT(timeline.producer_event_indices(), ElementsAre(2));
  EXPECT_THAT(timeline.consumer_event_indices(), IsEmpty());
}

TEST(TimelineTest, SelectedEventDependenciesSkipEventsBeyondSearchLimit) {
  ColorPalette palette = ColorPalette::Default();
  Timeline timeline(palette);
  timeline.set_hlo_dependency_arrows_enabled(true);
  // At most 10,000 events per level are checked on each side of the selected
  // event. With 9,999 other events in between, each `near_*` event is the
  // 10,000th event on its side and is found, and each `far_*` event is the
  // 10,001st and is not.
  //
  // level 0:  far_operand  near_operand  [other x 9,999]  selected
  //           [other x 9,999]  near_consumer  far_consumer
  constexpr int kEventsInBetween = 9999;
  std::vector<EventSpec> events;
  const auto add_event = [&events](absl::string_view name) {
    const size_t index = events.size();
    events.push_back({.name = std::string(name),
                      .start = static_cast<double>(index),
                      .dur = 0.5,
                      .id = index + 1});
  };
  add_event("far_operand");
  add_event("near_operand");
  for (int i = 0; i < kEventsInBetween; ++i) add_event("other");
  add_event("selected");
  for (int i = 0; i < kEventsInBetween; ++i) add_event("other");
  add_event("near_consumer");
  add_event("far_consumer");
  timeline.SetTimelineData(MakeDependencyTestData(events));
  timeline.set_selected_event_index_for_test(kEventsInBetween + 2);

  timeline.SetSelectedEventDependencies({"far_operand", "near_operand"},
                                        {"near_consumer", "far_consumer"});

  EXPECT_THAT(timeline.producer_event_indices(), ElementsAre(1));
  EXPECT_THAT(timeline.consumer_event_indices(),
              ElementsAre(2 * kEventsInBetween + 3));
}

TEST(TimelineTest, SelectedEventDependenciesAreEmptyForOutOfRangeSelection) {
  ColorPalette palette = ColorPalette::Default();
  Timeline timeline(palette);
  timeline.set_hlo_dependency_arrows_enabled(true);
  timeline.SetTimelineData(MakeDependencyTestData({
      {.name = "operand", .start = 0.0, .dur = 10.0, .level = 0, .id = 1},
      {.name = "consumer", .start = 60.0, .dur = 10.0, .level = 0, .id = 2},
  }));
  timeline.set_selected_event_index_for_test(2);

  timeline.SetSelectedEventDependencies({"operand"}, {"consumer"});

  EXPECT_THAT(timeline.producer_event_indices(), IsEmpty());
  EXPECT_THAT(timeline.consumer_event_indices(), IsEmpty());
}

TEST(TimelineTest, SelectedEventDependenciesAreReplacedByLaterCall) {
  ColorPalette palette = ColorPalette::Default();
  Timeline timeline(palette);
  timeline.set_hlo_dependency_arrows_enabled(true);
  timeline.SetTimelineData(MakeDependencyTestData({
      {.name = "old_operand", .start = 0.0, .dur = 10.0, .level = 0, .id = 1},
      {.name = "new_operand", .start = 20.0, .dur = 10.0, .level = 0, .id = 2},
      {.name = "selected", .start = 40.0, .dur = 10.0, .level = 0, .id = 3},
      {.name = "old_consumer", .start = 60.0, .dur = 10.0, .level = 0, .id = 4},
  }));
  timeline.set_selected_event_index_for_test(2);
  timeline.SetSelectedEventDependencies({"old_operand"}, {"old_consumer"});

  timeline.SetSelectedEventDependencies({"new_operand"}, {});

  EXPECT_THAT(timeline.producer_event_indices(), ElementsAre(1));
  EXPECT_THAT(timeline.consumer_event_indices(), IsEmpty());
}

TEST(TimelineTest, SelectedEventDependenciesAreIgnoredWhenFlagIsDisabled) {
  ColorPalette palette = ColorPalette::Default();
  Timeline timeline(palette);
  timeline.SetTimelineData(MakeDependencyTestData({
      {.name = "operand", .start = 0.0, .dur = 10.0, .level = 0, .id = 1},
      {.name = "selected", .start = 40.0, .dur = 10.0, .level = 0, .id = 2},
      {.name = "consumer", .start = 60.0, .dur = 10.0, .level = 0, .id = 3},
  }));
  timeline.set_selected_event_index_for_test(1);

  timeline.SetSelectedEventDependencies({"operand"}, {"consumer"});

  EXPECT_THAT(timeline.producer_event_indices(), IsEmpty());
  EXPECT_THAT(timeline.consumer_event_indices(), IsEmpty());
}

TEST(TimelineTest, SelectedEventDependenciesAreEmptyWithoutSelection) {
  ColorPalette palette = ColorPalette::Default();
  Timeline timeline(palette);
  timeline.set_hlo_dependency_arrows_enabled(true);
  timeline.SetTimelineData(MakeDependencyTestData({
      {.name = "operand", .start = 0.0, .dur = 10.0, .level = 0, .id = 1},
      {.name = "consumer", .start = 60.0, .dur = 10.0, .level = 0, .id = 2},
  }));

  timeline.SetSelectedEventDependencies({"operand"}, {"consumer"});

  EXPECT_THAT(timeline.producer_event_indices(), IsEmpty());
  EXPECT_THAT(timeline.consumer_event_indices(), IsEmpty());
}

TEST(TimelineTest, SelectedEventDependenciesAreHiddenAfterSelectionChange) {
  ColorPalette palette = ColorPalette::Default();
  Timeline timeline(palette);
  timeline.set_hlo_dependency_arrows_enabled(true);
  timeline.SetTimelineData(MakeDependencyTestData({
      {.name = "operand", .start = 0.0, .dur = 10.0, .level = 0, .id = 1},
      {.name = "selected", .start = 40.0, .dur = 10.0, .level = 0, .id = 2},
      {.name = "consumer", .start = 60.0, .dur = 10.0, .level = 0, .id = 3},
  }));
  timeline.set_selected_event_index_for_test(1);
  timeline.SetSelectedEventDependencies({"operand"}, {"consumer"});

  timeline.set_selected_event_index_for_test(0);

  EXPECT_THAT(timeline.producer_event_indices(), IsEmpty());
  EXPECT_THAT(timeline.consumer_event_indices(), IsEmpty());
}

TEST(TimelineTest, SelectedEventDependenciesAreResolvedAgainBySetTimelineData) {
  ColorPalette palette = ColorPalette::Default();
  Timeline timeline(palette);
  timeline.set_hlo_dependency_arrows_enabled(true);
  // before:  operand   selected   consumer             (indices 0, 1, 2)
  // after:   earlier   operand    selected   consumer  (indices 0, 1, 2, 3)
  timeline.SetTimelineData(MakeDependencyTestData({
      {.name = "operand", .start = 10.0, .dur = 10.0, .level = 0, .id = 1},
      {.name = "selected", .start = 40.0, .dur = 10.0, .level = 0, .id = 2},
      {.name = "consumer", .start = 60.0, .dur = 10.0, .level = 0, .id = 3},
  }));
  timeline.set_selected_event_index_for_test(1);
  timeline.SetSelectedEventDependencies({"operand"}, {"consumer"});

  // The new data has an earlier event, which shifts all event indices.
  timeline.SetTimelineData(MakeDependencyTestData({
      {.name = "earlier", .start = 0.0, .dur = 5.0, .level = 0, .id = 4},
      {.name = "operand", .start = 10.0, .dur = 10.0, .level = 0, .id = 1},
      {.name = "selected", .start = 40.0, .dur = 10.0, .level = 0, .id = 2},
      {.name = "consumer", .start = 60.0, .dur = 10.0, .level = 0, .id = 3},
  }));

  EXPECT_EQ(timeline.selected_event_index(), 2);
  EXPECT_THAT(timeline.producer_event_indices(), ElementsAre(1));
  EXPECT_THAT(timeline.consumer_event_indices(), ElementsAre(3));
}

TEST(TimelineTest, SelectedEventDependenciesPickUpEventsLoadedByRefetch) {
  ColorPalette palette = ColorPalette::Default();
  Timeline timeline(palette);
  timeline.set_hlo_dependency_arrows_enabled(true);
  // before:  operand             selected
  // after:   operand   operand   selected   consumer
  //                    ^ closer now         ^ new
  timeline.SetTimelineData(MakeDependencyTestData({
      {.name = "operand", .start = 0.0, .dur = 10.0, .level = 0, .id = 1},
      {.name = "selected", .start = 40.0, .dur = 10.0, .level = 0, .id = 2},
  }));
  timeline.set_selected_event_index_for_test(1);
  timeline.SetSelectedEventDependencies({"operand"}, {"consumer"});

  // The refetched data has a closer `operand` and a `consumer` that were not
  // loaded before, e.g. after zooming in.
  timeline.SetTimelineData(MakeDependencyTestData({
      {.name = "operand", .start = 0.0, .dur = 10.0, .level = 0, .id = 1},
      {.name = "operand", .start = 20.0, .dur = 10.0, .level = 0, .id = 3},
      {.name = "selected", .start = 40.0, .dur = 10.0, .level = 0, .id = 2},
      {.name = "consumer", .start = 60.0, .dur = 10.0, .level = 0, .id = 4},
  }));

  EXPECT_EQ(timeline.selected_event_index(), 2);
  EXPECT_THAT(timeline.producer_event_indices(), ElementsAre(1));
  EXPECT_THAT(timeline.consumer_event_indices(), ElementsAre(3));
}

TEST(TimelineTest, SelectedEventDependenciesDropEventsMissingAfterRefetch) {
  ColorPalette palette = ColorPalette::Default();
  Timeline timeline(palette);
  timeline.set_hlo_dependency_arrows_enabled(true);
  // before:  operand   selected   consumer
  // after:             selected   consumer
  timeline.SetTimelineData(MakeDependencyTestData({
      {.name = "operand", .start = 0.0, .dur = 10.0, .level = 0, .id = 1},
      {.name = "selected", .start = 40.0, .dur = 10.0, .level = 0, .id = 2},
      {.name = "consumer", .start = 60.0, .dur = 10.0, .level = 0, .id = 3},
  }));
  timeline.set_selected_event_index_for_test(1);
  timeline.SetSelectedEventDependencies({"operand"}, {"consumer"});

  // The refetched data no longer has the `operand`, e.g. at a coarser
  // resolution.
  timeline.SetTimelineData(MakeDependencyTestData({
      {.name = "selected", .start = 40.0, .dur = 10.0, .level = 0, .id = 2},
      {.name = "consumer", .start = 60.0, .dur = 10.0, .level = 0, .id = 3},
  }));

  EXPECT_EQ(timeline.selected_event_index(), 0);
  EXPECT_THAT(timeline.producer_event_indices(), IsEmpty());
  EXPECT_THAT(timeline.consumer_event_indices(), ElementsAre(1));
}

TEST(TimelineTest, SelectedEventDependenciesSurviveRepeatedRefetches) {
  ColorPalette palette = ColorPalette::Default();
  Timeline timeline(palette);
  timeline.set_hlo_dependency_arrows_enabled(true);
  const FlameChartTimelineData data = MakeDependencyTestData({
      {.name = "operand", .start = 0.0, .dur = 10.0, .level = 0, .id = 1},
      {.name = "selected", .start = 40.0, .dur = 10.0, .level = 0, .id = 2},
      {.name = "consumer", .start = 60.0, .dur = 10.0, .level = 0, .id = 3},
  });
  timeline.SetTimelineData(data);
  timeline.set_selected_event_index_for_test(1);
  timeline.SetSelectedEventDependencies({"operand"}, {"consumer"});

  timeline.SetTimelineData(data);
  timeline.SetTimelineData(data);

  EXPECT_EQ(timeline.selected_event_index(), 1);
  EXPECT_THAT(timeline.producer_event_indices(), ElementsAre(0));
  EXPECT_THAT(timeline.consumer_event_indices(), ElementsAre(2));
}

TEST(TimelineTest,
     SelectedEventDependenciesOfPreviousSelectionAreNotResolvedAgain) {
  ColorPalette palette = ColorPalette::Default();
  Timeline timeline(palette);
  timeline.set_hlo_dependency_arrows_enabled(true);
  const FlameChartTimelineData data = MakeDependencyTestData({
      {.name = "operand", .start = 0.0, .dur = 10.0, .level = 0, .id = 1},
      {.name = "selected", .start = 40.0, .dur = 10.0, .level = 0, .id = 2},
      {.name = "consumer", .start = 60.0, .dur = 10.0, .level = 0, .id = 3},
  });
  timeline.SetTimelineData(data);
  timeline.set_selected_event_index_for_test(1);
  timeline.SetSelectedEventDependencies({"operand"}, {"consumer"});
  timeline.set_selected_event_index_for_test(2);

  timeline.SetTimelineData(data);

  EXPECT_EQ(timeline.selected_event_index(), 2);
  EXPECT_THAT(timeline.producer_event_indices(), IsEmpty());
  EXPECT_THAT(timeline.consumer_event_indices(), IsEmpty());
}

TEST(TimelineTest, SelectedEventDependenciesAreNotResolvedAgainForAnotherOp) {
  ColorPalette palette = ColorPalette::Default();
  Timeline timeline(palette);
  timeline.set_hlo_dependency_arrows_enabled(true);
  const FlameChartTimelineData data = MakeDependencyTestData({
      {.name = "operand", .start = 0.0, .dur = 10.0, .level = 0, .id = 1},
      {.name = "selected", .start = 40.0, .dur = 10.0, .level = 0, .id = 2},
      {.name = "consumer", .start = 60.0, .dur = 10.0, .level = 0, .id = 3},
  });
  timeline.SetTimelineData(data);
  timeline.set_selected_event_index_for_test(1);
  timeline.SetSelectedEventDependencies({"operand"}, {"consumer"});
  // Makes `SetTimelineData` select the active search result instead.
  timeline.set_search_results_for_test({{.event_id = 3, .name = "consumer"}});
  timeline.set_current_search_result_index_for_test(0);

  timeline.SetTimelineData(data);

  EXPECT_EQ(timeline.selected_event_index(), 2);
  EXPECT_THAT(timeline.producer_event_indices(), IsEmpty());
  EXPECT_THAT(timeline.consumer_event_indices(), IsEmpty());
}

TEST(TimelineTest,
     SelectedEventDependenciesAreClearedWhenSelectedEventIsNotRefetched) {
  ColorPalette palette = ColorPalette::Default();
  Timeline timeline(palette);
  timeline.set_hlo_dependency_arrows_enabled(true);
  // before:  operand   selected   consumer
  // after:   operand              consumer
  timeline.SetTimelineData(MakeDependencyTestData({
      {.name = "operand", .start = 0.0, .dur = 10.0, .level = 0, .id = 1},
      {.name = "selected", .start = 40.0, .dur = 10.0, .level = 0, .id = 2},
      {.name = "consumer", .start = 60.0, .dur = 10.0, .level = 0, .id = 3},
  }));
  timeline.set_selected_event_index_for_test(1);
  timeline.SetSelectedEventDependencies({"operand"}, {"consumer"});

  timeline.SetTimelineData(MakeDependencyTestData({
      {.name = "operand", .start = 0.0, .dur = 10.0, .level = 0, .id = 1},
      {.name = "consumer", .start = 60.0, .dur = 10.0, .level = 0, .id = 3},
  }));

  EXPECT_EQ(timeline.selected_event_index(), -1);
  EXPECT_THAT(timeline.producer_event_indices(), IsEmpty());
  EXPECT_THAT(timeline.consumer_event_indices(), IsEmpty());
}

TEST(TimelineTest, SelectedEventDependenciesSetDuringRefetchAreKept) {
  ColorPalette palette = ColorPalette::Default();
  Timeline timeline(palette);
  timeline.set_hlo_dependency_arrows_enabled(true);
  // level 0:  operand   selected   new_operand   selected
  //                     ^ before                 ^ navigated to in the refetch
  const FlameChartTimelineData data = MakeDependencyTestData({
      {.name = "operand", .start = 0.0, .dur = 10.0, .level = 0, .id = 1},
      {.name = "selected", .start = 20.0, .dur = 10.0, .level = 0, .id = 2},
      {.name = "new_operand", .start = 40.0, .dur = 10.0, .level = 0, .id = 3},
      {.name = "selected", .start = 60.0, .dur = 10.0, .level = 0, .id = 4},
  });
  timeline.SetTimelineData(data);
  timeline.set_data_time_range({0.0, 100.0});
  timeline.set_selected_event_index_for_test(1);
  timeline.SetSelectedEventDependencies({"operand"}, {});
  // Makes `SetTimelineData` navigate to another event with the same name,
  // whose selection handler sets new dependencies.
  timeline.set_search_results_for_test({{.event_id = 4, .name = "selected"}});
  timeline.set_current_search_result_index_for_test(0);
  timeline.set_pending_navigation_event_id_for_test(4);
  timeline.set_event_callback(
      [&timeline](absl::string_view type, const EventData&) {
        if (type == kEventSelected) {
          timeline.SetSelectedEventDependencies({"new_operand"}, {});
        }
      });

  timeline.SetTimelineData(data);

  EXPECT_EQ(timeline.selected_event_index(), 3);
  EXPECT_THAT(timeline.producer_event_indices(), ElementsAre(2));
}

}  // namespace
}  // namespace testing
}  // namespace traceviewer
