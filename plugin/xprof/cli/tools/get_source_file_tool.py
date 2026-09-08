"""Resolves source file locations and Python stack traces for HLO ops in an XProf session."""

import json
from typing import Any, Sequence

from absl import app
from absl import flags

from xprof.cli.internal.oss import hlo_tools

_SESSION_ID = flags.DEFINE_string("session_id", None, "XProf session ID.")
_OPS = flags.DEFINE_list("ops", [], "Comma-separated HLO instruction names.")


def _resolve_stack_trace(stack_frame_id: int, stack_frame_index: Any) -> str:
  """Resolves a stack_frame_id into a human-readable stack trace string."""
  if not stack_frame_id or stack_frame_id < 1 or not stack_frame_index:
    return ""

  frames = []
  current_frame_id = stack_frame_id
  visited_frame_ids = set()

  while current_frame_id > 0:
    if current_frame_id in visited_frame_ids:
      break
    visited_frame_ids.add(current_frame_id)

    if not (1 <= current_frame_id <= len(stack_frame_index.stack_frames)):
      break
    frame = stack_frame_index.stack_frames[current_frame_id - 1]

    file_loc_id = frame.file_location_id
    if 1 <= file_loc_id <= len(stack_frame_index.file_locations):
      file_loc = stack_frame_index.file_locations[file_loc_id - 1]

      file_name = ""
      if 1 <= file_loc.file_name_id <= len(stack_frame_index.file_names):
        file_name = stack_frame_index.file_names[file_loc.file_name_id - 1]

      func_name = ""
      if (
          1
          <= file_loc.function_name_id
          <= len(stack_frame_index.function_names)
      ):
        func_name = stack_frame_index.function_names[
            file_loc.function_name_id - 1
        ]

      line = file_loc.line
      frames.append(f"{func_name} ({file_name}:{line})")
    else:
      frames.append(f"Unknown frame {current_frame_id}")

    current_frame_id = frame.parent_frame_id

  return " -> ".join(reversed(frames))


def get_source_info(session_id: str, ops: Sequence[str]) -> str:
  """Fetches HLO op debug info and returns it as JSON string."""
  hlo_protos = hlo_tools.get_hlo_proto_files(session_id)
  if not hlo_protos:
    return json.dumps({
        "error": f"No HLO protos found in debug info for session {session_id}."
    })

  name_to_instr = {}
  name_to_stack_index = {}
  for hlo_proto in hlo_protos:
    stack_frame_index = hlo_proto.hlo_module.stack_frame_index
    for computation in hlo_proto.hlo_module.computations:
      for instr in computation.instructions:
        name_to_instr[instr.name] = instr
        name_to_stack_index[instr.name] = stack_frame_index

  results = {}
  for op in ops:
    op_alt = op.replace("_", "-")
    instr = name_to_instr.get(op)
    stack_frame_index = name_to_stack_index.get(op)

    if not instr:
      instr = name_to_instr.get(op_alt)
      if instr:
        stack_frame_index = name_to_stack_index.get(op_alt)

    matched_search = None
    if not instr and op:
      for k, v in name_to_instr.items():
        if op in k or op_alt in k or v.metadata.op_name == op:
          instr = v
          stack_frame_index = name_to_stack_index.get(k)
          matched_search = k
          break

    if not instr:
      results[op] = {"error": "NOT FOUND in HLO module."}
      continue

    source = ""
    if instr.metadata.source_file:
      source = f"{instr.metadata.source_file}:{instr.metadata.source_line}"

    source_stack = ""
    if instr.metadata.stack_frame_id:
      source_stack = _resolve_stack_trace(
          instr.metadata.stack_frame_id, stack_frame_index
      )

    op_result = {
        "op_name": instr.metadata.op_name,
        "stack_frame_id": instr.metadata.stack_frame_id,
        "source": source,
        "source_stack": source_stack,
    }
    if matched_search:
      op_result["matched_search"] = matched_search

    results[op] = op_result

  return json.dumps(results)


def main(argv: Sequence[str]) -> None:
  del argv
  if not _SESSION_ID.value:
    raise app.UsageError("--session_id is required.")
  session_id = _SESSION_ID.value
  ops = list(dict.fromkeys(_OPS.value))
  print(get_source_info(session_id, ops))


if __name__ == "__main__":
  app.run(main)
