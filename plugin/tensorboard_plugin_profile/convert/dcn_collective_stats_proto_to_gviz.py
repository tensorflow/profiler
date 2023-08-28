# Copyright 2020 The TensorFlow Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# ==============================================================================
"""For conversion of Dcn Collective Stats page protos to GViz DataTables.

Usage:
    gviz_data_tables = generate_all_chart_tables(dcn_slack_analysis)
"""

from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import gviz_api

from tensorboard_plugin_profile.protobuf import dcn_slack_analysis_pb2


def get_dcn_collective_stats_table_args(dcn_slack_analysis):
  """Creates a gviz DataTable object from DcnSlackAnalysis proto.

  Args:
    dcn_slack_analysis: dcn_slack_analysis_pb2.DcnSlackAnalysis.

  Returns:
    Returns a gviz_api.DataTable
  """

  table_description = [
      ("dcnCollectiveName", "string", "DCN Collective Name"),
      ("recvOpName", "string", "Recv Op Name"),
      ("sendOpName", "string", "Send Op Name"),
      ("slackTime", "number", "Slack Time (ms)"),
      ("observedDuration", "number", "Observed Duration (ms)"),
      ("stallDuration", "number", "Stall Duration (ms)"),
      ("occurrences", "number", "Occurrences"),
  ]

  data = []
  for slack in dcn_slack_analysis.dcn_slack_summary:
    row = [
        slack.rendezvous,
        slack.recv_op_name,
        slack.send_op_name,
        slack.slack_us / 1000,
        slack.observed_duration_us / 1000,
        slack.stall_duration_us / 1000,
        slack.occurrences,
    ]
    data.append(row)

  return (table_description, data, [])


def generate_dcn_collective_stats_table(dcn_slack_analysis):
  (table_description, data, custom_properties) = (
      get_dcn_collective_stats_table_args(dcn_slack_analysis)
  )
  return gviz_api.DataTable(table_description, data, custom_properties)


def generate_all_chart_tables(dcn_slack_analysis):
  """Converts a DcnSlackAnalysis proto to gviz DataTables."""
  return [
      generate_dcn_collective_stats_table(dcn_slack_analysis),
  ]


def to_json(raw_data):
  """Converts a serialized DcnCollectiveAnalysis string to json."""
  dcn_slack_analysis = dcn_slack_analysis_pb2.DcnSlackAnalysis()
  dcn_slack_analysis.ParseFromString(raw_data)
  all_chart_tables = generate_all_chart_tables(dcn_slack_analysis)
  json_join = ",".join(x.ToJSon() if x else "{}" for x in all_chart_tables)
  return "[" + json_join + "]"
