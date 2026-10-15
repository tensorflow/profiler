// Copyright 2026 The OpenXLA Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// ==============================================================================

#ifndef THIRD_PARTY_XPROF_CONVERT_UNIFIED_OVERVIEW_PAGE_PROCESSOR_H_
#define THIRD_PARTY_XPROF_CONVERT_UNIFIED_OVERVIEW_PAGE_PROCESSOR_H_

#include "absl/status/status.h"
#include "absl/status/statusor.h"
#include "tsl/profiler/protobuf/xplane.pb.h"
#include "xprof/convert/base_op_stats_processor.h"
#include "xprof/convert/tool_options.h"
#include "xprof/convert/unified_session_snapshot.h"
#include "plugin/xprof/protobuf/inference_stats.pb.h"
#include "plugin/xprof/protobuf/op_stats.pb.h"

namespace xprof {

class UnifiedOverviewPageProcessor : public BaseOpStatsProcessor {
 public:
  explicit UnifiedOverviewPageProcessor(
      const tensorflow::profiler::ToolOptions& options)
      : BaseOpStatsProcessor(options) {}

  absl::Status ProcessCombinedOpStats(
      const XprofSessionSnapshot& session_snapshot,
      const tensorflow::profiler::OpStats& combined_op_stats,
      const tensorflow::profiler::ToolOptions& options) override;

 protected:
  // Returns the inference stats that back the inference latency section of the
  // overview page. Only called for profiles that are not training runs.
  // The default derives them from the session's XSpaces; environments that
  // keep precomputed inference stats next to the OpStats (1P stores them in
  // its TfOpStats cache and never loads XSpaces in the analysis server)
  // override this to return those instead.
  virtual absl::StatusOr<tensorflow::profiler::InferenceStats>
  GetInferenceStats(const XprofSessionSnapshot& session_snapshot,
                    const tensorflow::profiler::OpStats& combined_op_stats);
};

}  // namespace xprof

#endif  // THIRD_PARTY_XPROF_CONVERT_UNIFIED_OVERVIEW_PAGE_PROCESSOR_H_
