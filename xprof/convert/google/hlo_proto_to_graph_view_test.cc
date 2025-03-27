/* Copyright 2022 The TensorFlow Authors. All Rights Reserved.

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
#include "xprof/convert/hlo_proto_to_graph_view.h"

#include <string>

#include "net/proto2/contrib/fixtures/proto-fixture-repository.h"
#include "testing/base/public/gmock.h"
#include "absl/status/statusor.h"
#include "absl/strings/string_view.h"
#include "xla/service/hlo.pb.h"
#include "xla/service/hlo_graph_dumper.h"
#include "xla/tsl/platform/statusor.h"
#include "tensorflow/core/platform/test.h"

namespace tensorflow {
namespace profiler {
namespace {

using ::proto2::contrib::fixtures::ProtoFixtureRepository;
using ::testing::Eq;
using ::testing::HasSubstr;
using ::testing::StartsWith;
using ::tsl::StatusOr;
using ::xla::HloProto;

HloProto CreateModule(absl::string_view name, int id,
                      absl::string_view computation) {
  HloProto hlo_proto =
      ProtoFixtureRepository()
          .RegisterValue("@name", name)
          .RegisterValue("@id", id)
          .RegisterValue("@computation", computation)
          .ParseTextProtoOrDie(R"pb(
            hlo_module {
              name: @name
              id: @id
              entry_computation_name: @computation
              entry_computation_id: 0
              computations {
                id: 0
                name: @computation
                instructions: {
                  name: @computation
                  id: 1
                  opcode: "constant"
                  shape: {
                    element_type: S32
                    layout {}
                  }
                  literal: {
                    shape: {
                      element_type: S32
                      layout {}
                    }
                    s32s: 0
                  }
                }
                instructions: {
                  name: "constant.7"
                  id: 0
                  opcode: "constant"
                  shape: {
                    element_type: S32
                    layout {}
                  }
                  literal: {
                    shape: {
                      element_type: S32
                      layout {}
                    }
                    s32s: 0
                  }
                }
                root_id: 1
              }
              host_program_shape: { result: { element_type: 4 } }
            })pb");
  return hlo_proto;
}

TEST(HloProtoToGraphViewTest, ConvertHloProtoToGraphView) {
  HloProto hlo_proto = CreateModule("module_name", 5, "computation_name");
  absl::StatusOr<std::string> response = ConvertHloProtoToGraph(
      hlo_proto, "computation_name", 10, xla::HloRenderOptions(),
      xla::RenderedGraphFormat::kDot);
  EXPECT_THAT(*response, StartsWith("digraph"));
  EXPECT_THAT(*response, HasSubstr("computation_name"));
}

TEST(HloProtoToGraphViewTest, ConvertHloProtoToStringView) {
  HloProto hlo_proto = CreateModule("module_name", 5, "computation_name");
  absl::StatusOr<std::string> response =
      ConvertHloProtoToStringView(hlo_proto, false, false);
  EXPECT_THAT(*response,
              Eq("HloModule module_name, "
                 "entry_computation_layout={()->s32[]}\n\nENTRY "
                 "computation_name {\n  constant.7 = s32[] constant(0)\n  ROOT "
                 "computation_name = s32[] constant(0)\n}\n\n"));
}

}  // namespace
}  // namespace profiler
}  // namespace tensorflow
