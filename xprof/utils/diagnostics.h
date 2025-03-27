/* Copyright 2020 The TensorFlow Authors. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==============================================================================*/

#ifndef XPROF_UTILS_DIAGNOSTICS_H_
#define XPROF_UTILS_DIAGNOSTICS_H_

#include "absl/strings/string_view.h"
#include "xla/tsl/platform/macros.h"
#include "plugin/tensorboard_plugin_profile/protobuf/diagnostics.pb.h"
#include "plugin/tensorboard_plugin_profile/protobuf/op_stats.pb.h"

namespace tensorflow {
namespace profiler {

// Error message that the visualization is based on incomplete step.
TF_CONST_INIT extern const absl::string_view kErrorIncompleteStep;

// Error message that no step marker is seen and visualization contains no
// step info.
TF_CONST_INIT extern const absl::string_view kErrorNoStepMarker;

TF_CONST_INIT extern const absl::string_view kNoDeviceTraceCollected;

TF_CONST_INIT extern const absl::string_view kStepsDropped;

void PopulateStepDiagnostics(const OpStats& op_stats, Diagnostics* diag);

void PopulateOverviewDiagnostics(const OpStats& op_stats, Diagnostics* diag);

}  // namespace profiler
}  // namespace tensorflow

#endif  // XPROF_UTILS_DIAGNOSTICS_H_
