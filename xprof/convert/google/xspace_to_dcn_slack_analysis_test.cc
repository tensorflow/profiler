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
#include "tensorflow/core/profiler/convert/xspace_to_dcn_slack_analysis.h"

#include <cstdint>
#include <memory>
#include <string>

#include "testing/base/public/gmock.h"
#include "testing/base/public/gunit.h"
#include "absl/container/flat_hash_map.h"
#include "absl/strings/match.h"
#include "xla/hlo/ir/hlo_opcode.h"
#include "xla/tsl/profiler/utils/math_utils.h"
#include "xla/tsl/profiler/utils/tf_xplane_visitor.h"
#include "xla/tsl/profiler/utils/timespan.h"
#include "xla/tsl/profiler/utils/xplane_builder.h"
#include "xla/tsl/profiler/utils/xplane_schema.h"
#include "xla/tsl/profiler/utils/xplane_visitor.h"
#include "plugin/tensorboard_plugin_profile/protobuf/dcn_collective_info.pb.h"
#include "plugin/tensorboard_plugin_profile/protobuf/dcn_slack_analysis.pb.h"
#include "tensorflow/core/profiler/utils/hlo_proto_map.h"
#include "tsl/profiler/protobuf/xplane.pb.h"

namespace tensorflow {
namespace profiler {
namespace dcn_analysis_internal {
namespace {

using tensorflow::profiler::DcnSlackAnalysis;
using tensorflow::profiler::XPlane;
using testing::proto::IgnoringRepeatedFieldOrdering;
using tsl::profiler::NanoToPico;
using tsl::profiler::XEventBuilder;
using tsl::profiler::XEventVisitor;
using tsl::profiler::XLineBuilder;
using tsl::profiler::XPlaneBuilder;
using tsl::profiler::XPlaneVisitor;
using ::tsl::profiler::XStatsBuilder;
using xla::HloOpcode;

class DcnAnalysisTest : public ::testing::Test {
 protected:
  DcnTracker dcn_tracker_;
  std::unique_ptr<XPlane> xplane_;
  int metadata_id_ = 0;
  absl::flat_hash_map<int, InstrMetadata> instr_metadata_map_;

  DcnAnalysisTest()
      : dcn_tracker_(DcnTracker(tensorflow::profiler::HloProtoMap(), true)) {
    xplane_ = std::make_unique<XPlane>();
  }

  void PopulateXPlane(XPlane& xplane, uint64_t start_timestamp,
                      uint64_t end_timestamp,
                      DcnCollectiveInfoProto dcn_collective_info) {
    XPlaneBuilder xplane_builder(&xplane);
    XEventMetadata* event_metadata =
        xplane_builder.GetOrCreateEventMetadata(metadata_id_);

    XLineBuilder xline_builder = xplane_builder.GetOrCreateLine(0);
    xline_builder.SetTimestampNs(1000);

    XEventBuilder event_builder = xline_builder.AddEvent(*event_metadata);
    event_builder.SetOffsetPs(NanoToPico(start_timestamp));
    event_builder.SetDurationPs(NanoToPico(end_timestamp - start_timestamp));

    XStatsBuilder<XEventMetadata> stats(event_metadata, &xplane_builder);
    if (dcn_collective_info.ByteSizeLong()) {
      const XStatMetadata& dcn_collective_info_stat =
          *xplane_builder.GetOrCreateStatMetadata(
              GetStatTypeStr(tsl::profiler::StatType::kDcnCollectiveInfo));
      stats.AddStatValue(dcn_collective_info_stat, dcn_collective_info);
    }
  }

  void UpdateDcnTransferType(std::string rendezvous,
                             DcnCollectiveInfoProto& dcn_collective_info,
                             InstrMetadata& instr_metadata) {
    if (absl::StartsWith(rendezvous, "all-reduce")) {
      instr_metadata.transfer_type = "ALL_REDUCE";
      dcn_collective_info.set_transfer_type(DcnCollectiveInfoProto::ALL_REDUCE);
    } else if (absl::StartsWith(rendezvous, "all-gather")) {
      instr_metadata.transfer_type = "ALL_GATHER";
      dcn_collective_info.set_transfer_type(DcnCollectiveInfoProto::ALL_GATHER);
    } else if (absl::StartsWith(rendezvous, "all-to-all")) {
      instr_metadata.transfer_type = "ALL_TO_ALL";
      dcn_collective_info.set_transfer_type(DcnCollectiveInfoProto::ALL_TO_ALL);
    } else if (absl::StartsWith(rendezvous, "one-to-one")) {
      instr_metadata.transfer_type = "ONE_TO_ONE";
      dcn_collective_info.set_transfer_type(DcnCollectiveInfoProto::ONE_TO_ONE);
    } else if (absl::StartsWith(rendezvous, "reduce-scatter")) {
      instr_metadata.transfer_type = "REDUCE_SCATTER";
      dcn_collective_info.set_transfer_type(
          DcnCollectiveInfoProto::REDUCE_SCATTER);
    } else {
      dcn_collective_info.set_transfer_type(
          DcnCollectiveInfoProto::UNKNOWN_TRANSFER_TYPE);
    }
  }

  void UpdateReplicaGroups(DcnCollectiveInfoProto& dcn_collective_info) {
    if (dcn_collective_info.transfer_type() ==
        DcnCollectiveInfoProto::ONE_TO_ONE) {
      DcnCollectiveInfoProto::OneToOneGroup* group =
          dcn_collective_info.add_one_to_one_groups();
      DcnCollectiveInfoProto::Endpoint* source = group->mutable_source();
      source->set_slice_id(1);
      source->set_device_id(1);
      DcnCollectiveInfoProto::Endpoint* destination =
          group->mutable_destination();
      destination->set_slice_id(2);
      destination->set_device_id(1);
    } else {
      DcnCollectiveInfoProto::EndpointGroup* group =
          dcn_collective_info.add_endpoint_groups();
      for (int i = 0; i < 4; ++i) {
        DcnCollectiveInfoProto::Endpoint* endpoint = group->add_endpoints();
        endpoint->set_slice_id(i + 1);
        endpoint->set_device_id(0);
      }
    }
  }

  void VisitOp(HloOpcode opcode, uint64_t channel_id, uint64_t start_timestamp,
               uint64_t end_timestamp, std::string rendezvous,
               bool add_replica_group = true) {
    InstrMetadata instr_metadata;
    DcnCollectiveInfoProto dcn_collective_info;

    instr_metadata.opcode = opcode;
    instr_metadata.channel_id = channel_id;
    instr_metadata.size = 1024;
    if (!rendezvous.empty()) {
      instr_metadata.rendezvous_name = rendezvous;
    }

    if (opcode == HloOpcode::kSend) {
      UpdateDcnTransferType(rendezvous, dcn_collective_info, instr_metadata);
      if (add_replica_group) {
        UpdateReplicaGroups(dcn_collective_info);
      }
    }

    instr_metadata_map_[metadata_id_] = instr_metadata;
    PopulateXPlane(*xplane_, start_timestamp, end_timestamp,
                   dcn_collective_info);

    metadata_id_ += 1;
  }

  void VisitHostOp(std::string rendezvous_name, uint64_t start_timestamp,
                   uint64_t end_timestamp) {
    DcnHostEvent event;
    tsl::profiler::Timespan timespan(
        NanoToPico(start_timestamp),
        NanoToPico(end_timestamp - start_timestamp));
    event.rendezvous_name = rendezvous_name;
    event.timespan = timespan;
    event.multi_slice_device_id = 0;
    dcn_tracker_.VisitHostEvent(event);
  }

  DcnSlackAnalysis Finalize() {
    XPlaneVisitor xplane_visitor =
        tsl::profiler::CreateTfXPlaneVisitor(xplane_.get());

    xplane_visitor.ForEachLine([&](const tsl::profiler::XLineVisitor& line) {
      line.ForEachEvent([&](const XEventVisitor& event_visitor) {
        if (instr_metadata_map_.contains(event_visitor.Id())) {
          dcn_tracker_.VisitOp(instr_metadata_map_[event_visitor.Id()],
                               event_visitor);
        }
      });
    });

    return dcn_tracker_.Finalize();
  }
};

TEST_F(DcnAnalysisTest, BasicTest) {
  VisitOp(HloOpcode::kSend, 1, 2000, 4000, "collective-1");
  VisitOp(HloOpcode::kSendDone, 1, 4000, 5000, "");
  VisitOp(HloOpcode::kRecv, 2, 8000, 9000, "collective-1");
  VisitOp(HloOpcode::kRecvDone, 2, 9000, 10000, "");
  EXPECT_THAT(
      Finalize(),
      IgnoringRepeatedFieldOrdering(
          testing::proto::Partially(testing::EqualsProto(
              R"pb(dcn_slack {
                     rendezvous: "collective-1"
                     send_start_time_us: 3
                     recv_done_end_time_us: 11
                     slack_us: 3
                     stall_duration_us: 5
                     send { start_time_ps: 3000000 duration_ps: 2000000 }
                     send_done { start_time_ps: 5000000 duration_ps: 1000000 }
                     recv { start_time_ps: 9000000 duration_ps: 1000000 }
                     recv_done { start_time_ps: 10000000 duration_ps: 1000000 }
                   }
                   dcn_slack_summary {
                     rendezvous: "collective-1"
                     slack_us: 3
                     occurrences: 1
                     stall_duration_us: 5
                     observed_duration_us: 8
                     send_duration_us: 2
                     send_done_duration_us: 1
                     recv_done_duration_us: 1
                   })pb"))));
}

TEST_F(DcnAnalysisTest, OverlappingSendRecvs) {
  VisitOp(HloOpcode::kSend, 1, 2000, 4000, "collective-1");
  VisitOp(HloOpcode::kSend, 2, 4000, 5000, "collective-2");
  VisitOp(HloOpcode::kSendDone, 1, 7000, 8000, "");
  VisitOp(HloOpcode::kSendDone, 2, 8000, 10000, "");
  VisitOp(HloOpcode::kRecv, 3, 10000, 11000, "collective-1");
  VisitOp(HloOpcode::kRecvDone, 3, 11000, 13000, "");
  VisitOp(HloOpcode::kRecv, 4, 13000, 14000, "collective-2");
  VisitOp(HloOpcode::kRecvDone, 4, 14000, 150000, "");
  EXPECT_THAT(
      Finalize(),
      IgnoringRepeatedFieldOrdering(
          testing::proto::Partially(testing::EqualsProto(
              R"pb(dcn_slack {
                     rendezvous: "collective-1"
                     send_start_time_us: 3
                     recv_done_end_time_us: 14
                     slack_us: 2
                     stall_duration_us: 6
                     send { start_time_ps: 3000000 duration_ps: 2000000 }
                     send_done { start_time_ps: 8000000 duration_ps: 1000000 }
                     recv { start_time_ps: 11000000 duration_ps: 1000000 }
                     recv_done { start_time_ps: 12000000 duration_ps: 2000000 }
                   }
                   dcn_slack {
                     rendezvous: "collective-2"
                     send_start_time_us: 5
                     recv_done_end_time_us: 151
                     slack_us: 2
                     stall_duration_us: 140
                     send { start_time_ps: 5000000 duration_ps: 1000000 }
                     send_done { start_time_ps: 9000000 duration_ps: 2000000 }
                     recv { start_time_ps: 14000000 duration_ps: 1000000 }
                     recv_done {
                       start_time_ps: 15000000
                       duration_ps: 136000000
                     }
                   }
                   dcn_slack_summary {
                     rendezvous: "collective-2"
                     slack_us: 2
                     occurrences: 1
                     stall_duration_us: 140
                     observed_duration_us: 146
                     send_duration_us: 1
                     send_done_duration_us: 2
                     recv_done_duration_us: 136
                   }
                   dcn_slack_summary {
                     rendezvous: "collective-1"
                     slack_us: 2
                     occurrences: 1
                     stall_duration_us: 6
                     observed_duration_us: 11
                     send_duration_us: 2
                     send_done_duration_us: 1
                     recv_done_duration_us: 2
                   })pb"))));
}

TEST_F(DcnAnalysisTest, HostEventTest) {
  VisitOp(HloOpcode::kSend, 1, 2000, 4000, "collective-1");
  VisitOp(HloOpcode::kSendDone, 1, 4000, 5000, "");
  VisitOp(HloOpcode::kRecv, 2, 8000, 9000, "collective-1");
  VisitOp(HloOpcode::kRecvDone, 2, 9000, 12000, "");
  VisitHostOp("collective-1", 4000, 11000);
  EXPECT_THAT(Finalize(), IgnoringRepeatedFieldOrdering(
                              testing::proto::Partially(testing::EqualsProto(
                                  R"pb(dcn_slack {
                                         rendezvous: "collective-1"
                                         host_graph_execution {
                                           start_time_ps: 4000000
                                           duration_ps: 7000000
                                         }
                                       }
                                       dcn_slack_summary {
                                         rendezvous: "collective-1"
                                         host_stall_us: 1
                                       })pb"))));
}

TEST_F(DcnAnalysisTest, HostEventTestExcessSlack) {
  VisitOp(HloOpcode::kSend, 1, 2000, 4000, "collective-1");
  VisitOp(HloOpcode::kSendDone, 1, 4000, 5000, "");
  VisitOp(HloOpcode::kRecv, 2, 8000, 9000, "collective-1");
  VisitOp(HloOpcode::kRecvDone, 2, 9000, 12000, "");
  VisitHostOp("collective-1", 4000, 8000);
  EXPECT_THAT(Finalize(), IgnoringRepeatedFieldOrdering(
                              testing::proto::Partially(testing::EqualsProto(
                                  R"pb(dcn_slack {
                                         rendezvous: "collective-1"
                                         host_graph_execution {
                                           start_time_ps: 4000000
                                           duration_ps: 4000000
                                         }
                                       }
                                       dcn_slack_summary {
                                         rendezvous: "collective-1"
                                         host_stall_us: -2
                                       })pb"))));
}

TEST_F(DcnAnalysisTest, HostEventEndsAfterRecvDone) {
  VisitOp(HloOpcode::kSend, 1, 2000, 4000, "collective-1");
  VisitOp(HloOpcode::kSendDone, 1, 4000, 5000, "");
  VisitOp(HloOpcode::kRecv, 2, 8000, 9000, "collective-1");
  VisitOp(HloOpcode::kRecvDone, 2, 9000, 12000, "");
  VisitHostOp("collective-1", 4000, 13000);
  EXPECT_THAT(Finalize(), IgnoringRepeatedFieldOrdering(
                              testing::proto::Partially(testing::EqualsProto(
                                  R"pb(dcn_slack { rendezvous: "collective-1" }
                                       dcn_slack_summary {
                                         rendezvous: "collective-1"
                                         host_stall_us: 3
                                       })pb"))));
}

TEST_F(DcnAnalysisTest, TestTransmittedDataSizeOneToOne) {
  VisitOp(HloOpcode::kSend, 1, 2000, 4000, "one-to-one-1");
  VisitOp(HloOpcode::kSendDone, 1, 4000, 5000, "");
  VisitOp(HloOpcode::kRecv, 2, 8000, 9000, "one-to-one-1");
  VisitOp(HloOpcode::kRecvDone, 2, 9000, 10000, "");
  EXPECT_THAT(Finalize(), testing::proto::Partially(testing::EqualsProto(
                              R"pb(
                                dcn_slack_summary {
                                  rendezvous: "one-to-one-1"
                                  bytes_transmitted_over_network: 1024
                                })pb")));
}

TEST_F(DcnAnalysisTest, TestTransmittedDataSizeAllGather) {
  VisitOp(HloOpcode::kSend, 1, 2000, 4000, "all-gather-1");
  VisitOp(HloOpcode::kSendDone, 1, 4000, 5000, "");
  VisitOp(HloOpcode::kRecv, 2, 8000, 9000, "all-gather-1");
  VisitOp(HloOpcode::kRecvDone, 2, 9000, 10000, "");
  EXPECT_THAT(Finalize(), testing::proto::Partially(testing::EqualsProto(
                              R"pb(
                                dcn_slack_summary {
                                  rendezvous: "all-gather-1"
                                  bytes_transmitted_over_network: 768
                                })pb")));
}

TEST_F(DcnAnalysisTest, TestTransmittedDataSizeAllToAll) {
  VisitOp(HloOpcode::kSend, 1, 2000, 4000, "all-to-all-1");
  VisitOp(HloOpcode::kSendDone, 1, 4000, 5000, "");
  VisitOp(HloOpcode::kRecv, 2, 8000, 9000, "all-to-all-1");
  VisitOp(HloOpcode::kRecvDone, 2, 9000, 10000, "");
  EXPECT_THAT(Finalize(), testing::proto::Partially(testing::EqualsProto(
                              R"pb(
                                dcn_slack_summary {
                                  rendezvous: "all-to-all-1"
                                  bytes_transmitted_over_network: 768
                                })pb")));
}

TEST_F(DcnAnalysisTest, TestTransmittedDataSizeAllReduce) {
  VisitOp(HloOpcode::kSend, 1, 2000, 4000, "all-reduce-1");
  VisitOp(HloOpcode::kSendDone, 1, 4000, 5000, "");
  VisitOp(HloOpcode::kRecv, 2, 8000, 9000, "all-reduce-1");
  VisitOp(HloOpcode::kRecvDone, 2, 9000, 10000, "");
  EXPECT_THAT(Finalize(), testing::proto::Partially(testing::EqualsProto(
                              R"pb(
                                dcn_slack_summary {
                                  rendezvous: "all-reduce-1"
                                  bytes_transmitted_over_network: 1536
                                })pb")));
}

TEST_F(DcnAnalysisTest, TestTransmittedDataSizeReduceScatter) {
  VisitOp(HloOpcode::kSend, 1, 2000, 4000, "reduce-scatter-1");
  VisitOp(HloOpcode::kSendDone, 1, 4000, 5000, "");
  VisitOp(HloOpcode::kRecv, 2, 8000, 9000, "reduce-scatter-1");
  VisitOp(HloOpcode::kRecvDone, 2, 9000, 10000, "");
  EXPECT_THAT(Finalize(), testing::proto::Partially(testing::EqualsProto(
                              R"pb(
                                dcn_slack_summary {
                                  rendezvous: "reduce-scatter-1"
                                  bytes_transmitted_over_network: 3072
                                })pb")));
}

TEST_F(DcnAnalysisTest, TestTransmittedDataSizeUnknownTransferType) {
  VisitOp(HloOpcode::kSend, 1, 2000, 4000, "unknown-type-1");
  VisitOp(HloOpcode::kSendDone, 1, 4000, 5000, "");
  VisitOp(HloOpcode::kRecv, 2, 8000, 9000, "unknown-type-1");
  VisitOp(HloOpcode::kRecvDone, 2, 9000, 10000, "");
  EXPECT_THAT(Finalize(), testing::proto::Partially(testing::EqualsProto(
                              R"pb(
                                dcn_slack_summary {
                                  rendezvous: "unknown-type-1"
                                  bytes_transmitted_over_network: 0
                                })pb")));
}

TEST_F(DcnAnalysisTest, TestTransmittedDataSizeReplicaGroupNotFound) {
  VisitOp(HloOpcode::kSend, 1, 2000, 4000, "one-to-one-1", false);
  VisitOp(HloOpcode::kSendDone, 1, 4000, 5000, "", false);
  VisitOp(HloOpcode::kRecv, 2, 8000, 9000, "one-to-one-1", false);
  VisitOp(HloOpcode::kRecvDone, 2, 9000, 10000, "", false);
  EXPECT_THAT(Finalize(), testing::proto::Partially(testing::EqualsProto(
                              R"pb(
                                dcn_slack_summary {
                                  rendezvous: "one-to-one-1"
                                  bytes_transmitted_over_network: 0
                                })pb")));
}
}  // namespace
}  // namespace dcn_analysis_internal
}  // namespace profiler
}  // namespace tensorflow
