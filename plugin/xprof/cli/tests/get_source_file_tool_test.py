"""Tests for get_source_file_tool HLO source resolution and stack trace formatting."""

import io
import json
import sys
import types
from unittest import mock

from absl import app
from absl.testing import absltest
from absl.testing import flagsaver
from absl.testing import parameterized

from xprof.cli.internal.oss import hlo_tools
from xprof.cli.tools import get_source_file_tool


class GetSourceFileToolTest(parameterized.TestCase):

  @parameterized.named_parameters(
      ("zero_none", 0, None, ""),
      ("negative_none", -1, None, ""),
      ("positive_none", 1, None, ""),
      ("zero_empty_frames", 0, types.SimpleNamespace(stack_frames=[]), ""),
      ("negative_empty_frames", -1, types.SimpleNamespace(stack_frames=[]), ""),
  )
  def test_resolve_stack_trace_empty(self, frame_id, index, expected):
    self.assertEqual(
        get_source_file_tool._resolve_stack_trace(frame_id, index), expected
    )

  def test_resolve_stack_trace_valid_chain(self):
    stack_frame_index = types.SimpleNamespace(
        stack_frames=[
            types.SimpleNamespace(file_location_id=1, parent_frame_id=2),
            types.SimpleNamespace(file_location_id=2, parent_frame_id=0),
        ],
        file_locations=[
            types.SimpleNamespace(file_name_id=1, function_name_id=1, line=42),
            types.SimpleNamespace(file_name_id=2, function_name_id=2, line=10),
        ],
        file_names=["leaf.py", "main.py"],
        function_names=["leaf_fn", "main_fn"],
    )

    result = get_source_file_tool._resolve_stack_trace(1, stack_frame_index)
    self.assertEqual(result, "main_fn (main.py:10) -> leaf_fn (leaf.py:42)")

  def test_resolve_stack_trace_cycle_detection(self):
    stack_frame_index = types.SimpleNamespace(
        stack_frames=[
            types.SimpleNamespace(file_location_id=1, parent_frame_id=2),
            types.SimpleNamespace(file_location_id=2, parent_frame_id=1),
        ],
        file_locations=[
            types.SimpleNamespace(file_name_id=1, function_name_id=1, line=10),
            types.SimpleNamespace(file_name_id=2, function_name_id=2, line=20),
        ],
        file_names=["file1.py", "file2.py"],
        function_names=["fn1", "fn2"],
    )

    # Should terminate rather than hang in an infinite loop
    result = get_source_file_tool._resolve_stack_trace(1, stack_frame_index)
    self.assertEqual(result, "fn2 (file2.py:20) -> fn1 (file1.py:10)")

  def test_resolve_stack_trace_unknown_frame(self):
    stack_frame_index = types.SimpleNamespace(
        stack_frames=[
            types.SimpleNamespace(file_location_id=99, parent_frame_id=0),
        ],
        file_locations=[],
        file_names=[],
        function_names=[],
    )

    result = get_source_file_tool._resolve_stack_trace(1, stack_frame_index)
    self.assertEqual(result, "Unknown frame 1")

  @mock.patch.object(
      hlo_tools, "get_hlo_proto_files", autospec=True, spec_set=True
  )
  def test_get_source_info_no_hlo_proto(self, mock_get_hlo_proto_files):
    mock_get_hlo_proto_files.return_value = []
    res_json = get_source_file_tool.get_source_info("session_123", ["op_1"])
    data = json.loads(res_json)
    self.assertIn("error", data)
    self.assertIn("No HLO protos found", data["error"])

  @mock.patch.object(
      hlo_tools, "get_hlo_proto_files", autospec=True, spec_set=True
  )
  def test_get_source_info_success(self, mock_get_hlo_proto_files):
    stack_frame_index = types.SimpleNamespace(
        stack_frames=[
            types.SimpleNamespace(file_location_id=1, parent_frame_id=0),
        ],
        file_locations=[
            types.SimpleNamespace(file_name_id=1, function_name_id=1, line=100),
        ],
        file_names=["model.py"],
        function_names=["train_step"],
    )

    instr_1 = types.SimpleNamespace(
        name="custom_op_add",
        metadata=types.SimpleNamespace(
            op_name="custom_op_add",
            source_file="model.py",
            source_line=100,
            stack_frame_id=1,
        ),
    )
    instr_2 = types.SimpleNamespace(
        name="matmul-fusion.1",
        metadata=types.SimpleNamespace(
            op_name="matmul_layer",
            source_file="",
            source_line=0,
            stack_frame_id=0,
        ),
    )

    comp = types.SimpleNamespace(instructions=[instr_1, instr_2])
    module = types.SimpleNamespace(
        name="module_0",
        computations=[comp],
        stack_frame_index=stack_frame_index,
    )
    hlo_proto = types.SimpleNamespace(hlo_module=module)
    mock_get_hlo_proto_files.return_value = [hlo_proto]

    res_json = get_source_file_tool.get_source_info(
        "session_123",
        ["custom_op_add", "matmul_fusion.1", "matmul_layer", "non_existent"],
    )
    data = json.loads(res_json)

    # Exact match
    self.assertIn("custom_op_add", data)
    self.assertEqual(data["custom_op_add"]["source"], "model.py:100")
    self.assertEqual(
        data["custom_op_add"]["source_stack"], "train_step (model.py:100)"
    )

    # Hyphen match
    self.assertIn("matmul_fusion.1", data)
    self.assertEqual(data["matmul_fusion.1"]["op_name"], "matmul_layer")

    # Op name match via search
    self.assertIn("matmul_layer", data)
    self.assertEqual(data["matmul_layer"]["matched_search"], "matmul-fusion.1")

    # Not found
    self.assertIn("non_existent", data)
    self.assertEqual(data["non_existent"]["error"], "NOT FOUND in HLO module.")

  @mock.patch.object(
      hlo_tools, "get_hlo_proto_files", autospec=True, spec_set=True
  )
  def test_get_source_info_empty_op_does_not_match(
      self, mock_get_hlo_proto_files
  ):
    instr = types.SimpleNamespace(
        name="some_hlo_op",
        metadata=types.SimpleNamespace(
            op_name="some_op",
            source_file="",
            source_line=0,
            stack_frame_id=0,
        ),
    )
    comp = types.SimpleNamespace(instructions=[instr])
    module = types.SimpleNamespace(
        name="module_0",
        computations=[comp],
        stack_frame_index=types.SimpleNamespace(
            stack_frames=[],
            file_locations=[],
            file_names=[],
            function_names=[],
        ),
    )
    hlo_proto = types.SimpleNamespace(hlo_module=module)
    mock_get_hlo_proto_files.return_value = [hlo_proto]

    res_json = get_source_file_tool.get_source_info("session_123", [""])
    data = json.loads(res_json)
    self.assertIn("", data)
    self.assertEqual(data[""]["error"], "NOT FOUND in HLO module.")

  @flagsaver.flagsaver(session_id=None)
  def test_main_missing_session_id(self):
    with self.assertRaises(app.UsageError):
      get_source_file_tool.main([])

  @flagsaver.flagsaver(
      session_id="session_123",
      ops=["op_z", "op_a", "op_z", "op_b", "op_a"],
  )
  @mock.patch.object(
      get_source_file_tool, "get_source_info", autospec=True, spec_set=True
  )
  def test_main_preserves_ops_order_and_deduplicates(
      self, mock_get_source_info
  ):
    mock_get_source_info.return_value = "{}"
    with mock.patch.object(
        sys, "stdout", new_callable=io.StringIO
    ) as mock_stdout:
      result = get_source_file_tool.main([])
      mock_get_source_info.assert_called_once_with(
          "session_123", ["op_z", "op_a", "op_b"]
      )
      self.assertIsNone(result)
      self.assertEqual(mock_stdout.getvalue(), "{}\n")


if __name__ == "__main__":
  absltest.main()
