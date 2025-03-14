/* Copyright 2023 The TensorFlow Authors. All Rights Reserved.

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
#include "xprof/convert/dcn_slack_analysis_combiner.h"

#include "net/proto2/contrib/parse_proto/parse_text_proto.h"
#include "testing/base/public/gmock.h"
#include "<gtest/gtest.h>"
#include "plugin/tensorboard_plugin_profile/protobuf/dcn_slack_analysis.pb.h"

namespace tensorflow {
namespace profiler {
namespace {
using proto2::contrib::parse_proto::ParseTextProtoOrDie;
using tensorflow::profiler::DcnSlackAnalysis;
using testing::EqualsProto;
using testing::proto::IgnoringRepeatedFieldOrdering;

TEST(DcnSlackAnalysisTest, VerifyCombinedSlackSummary) {
  DcnSlackAnalysis analysis1 =
      ParseTextProtoOrDie(R"pb(dcn_slack_summary {
                                 rendezvous: "collective-1"
                                 slack_us: 2
                                 occurrences: 1
                               }
                               dcn_slack_summary {
                                 rendezvous: "collective-2"
                                 slack_us: 2
                                 occurrences: 1
                               })pb");
  DcnSlackAnalysis analysis2 =
      ParseTextProtoOrDie(R"pb(dcn_slack_summary {
                                 rendezvous: "collective-1"
                                 slack_us: 2
                                 occurrences: 1
                               }
                               dcn_slack_summary {
                                 rendezvous: "collective-2"
                                 slack_us: 2
                                 occurrences: 1
                               })pb");

  DcnSlackAnalysisCombiner combiner;
  combiner.Combine(analysis1);
  combiner.Combine(analysis2);

  DcnSlackAnalysis combined = combiner.Finalize();

  EXPECT_THAT(combined, IgnoringRepeatedFieldOrdering(EqualsProto(
                            R"pb(dcn_slack_summary {
                                   rendezvous: "collective-1"
                                   slack_us: 2
                                   occurrences: 2
                                 }
                                 dcn_slack_summary {
                                   rendezvous: "collective-2"
                                   slack_us: 2
                                   occurrences: 2
                                 })pb")));
}

}  // namespace

}  // namespace profiler
}  // namespace tensorflow
