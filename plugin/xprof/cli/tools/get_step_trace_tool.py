"""Tool to retrieve step execution breakdowns and timing data from XProf."""

import collections
from collections.abc import Sequence
import dataclasses
import json
import logging
import math
import statistics
from typing import Any

pywraprpc = None

from xprof.cli.internal import decorators

from xprof.cli.internal.oss import xprof_client

_FETCH_EXCEPTIONS_LIST: list[type[BaseException]] = [
    RuntimeError,
]
if pywraprpc is not None:
  _FETCH_EXCEPTIONS_LIST.append(pywraprpc.RPCException)

_FETCH_EXCEPTIONS: tuple[type[BaseException], ...] = tuple(
    _FETCH_EXCEPTIONS_LIST
)

_DEFAULT_STEP_LIMIT = 20


@dataclasses.dataclass
class CommunicationBreakdown:
  """Breakdown of communication time into components.

  Attributes:
      all_reduce_ms: Time spent in All-Reduce (Cross-Replica Sum) in ms.
      send_ms: Time spent in Send operations in ms.
      recv_ms: Time spent in Recv operations in ms.
  """

  all_reduce_ms: float
  send_ms: float
  recv_ms: float


@dataclasses.dataclass
class StepInfo:
  """Step execution breakdown and timing information.

  Attributes:
      step_num: The step number (or None if unavailable).
      step_time_ms: Total step duration in ms.
      compute_time_ms: Time spent in device compute in ms.
      compute_percent: Percentage of step time spent in compute.
      communication_time_ms: Time spent in communication in ms.
      communication_percent: Percentage of step time spent in communication.
      infeed_time_ms: Time spent in host infeed in ms.
      infeed_percent: Percentage of step time spent in infeed.
      outfeed_time_ms: Time spent in host outfeed in ms.
      outfeed_percent: Percentage of step time spent in outfeed.
      bottleneck: Primary bottleneck identified for the step.
      communication_breakdown_ms: Detailed breakdown of communication
        components.
  """

  step_num: int | None
  step_time_ms: float
  compute_time_ms: float
  compute_percent: float
  communication_time_ms: float
  communication_percent: float
  infeed_time_ms: float
  infeed_percent: float
  outfeed_time_ms: float
  outfeed_percent: float
  bottleneck: str
  communication_breakdown_ms: CommunicationBreakdown | None = None


@dataclasses.dataclass
class SummaryData:
  """Aggregate summary metrics across all steps in the session.

  Attributes:
      total_steps: Total number of steps analyzed, or None if individual step
        count is unavailable.
      step_time_ms_average: Average step duration in ms.
      step_time_ms_min: Minimum step duration in ms.
      step_time_ms_max: Maximum step duration in ms.
      step_time_ms_stddev: Standard deviation of step duration in ms.
      compute_time_ms_average: Average compute duration in ms.
      compute_percent: Percentage of average step time spent in compute.
      communication_time_ms_average: Average communication duration in ms.
      communication_percent: Percentage of average step time spent in
        communication.
      infeed_time_ms_average: Average infeed duration in ms.
      infeed_percent: Percentage of average step time spent in infeed.
      outfeed_time_ms_average: Average outfeed duration in ms.
      outfeed_percent: Percentage of average step time spent in outfeed.
      primary_bottleneck: Primary bottleneck identified across steps.
      is_aggregate: Whether the summary metrics are from aggregate session
        statistics rather than individual step traces.
      conclusion: Optional summary conclusion or note.
      note: Optional additional note.
  """

  total_steps: int | None
  step_time_ms_average: float
  step_time_ms_min: float
  step_time_ms_max: float
  step_time_ms_stddev: float
  compute_time_ms_average: float
  compute_percent: float
  communication_time_ms_average: float
  communication_percent: float
  infeed_time_ms_average: float
  infeed_percent: float
  outfeed_time_ms_average: float
  outfeed_percent: float
  primary_bottleneck: str
  is_aggregate: bool = False
  conclusion: str | None = None
  note: str | None = None


def _safe_float(val: Any) -> float:
  """Safely converts a value to float, returning 0.0 for invalid, NaN, or infinite values."""
  try:
    result = float(val)
    return result if math.isfinite(result) else 0.0
  except (ValueError, TypeError):
    return 0.0


def _safe_int(val: Any) -> int | None:
  """Safely converts a value to int, returning None if invalid or non-positive."""
  try:
    result = int(val)
    return result if result > 0 else None
  except (ValueError, TypeError):
    return None


def _build_summary(
    steps: Sequence[StepInfo],
    extra_props: dict[str, Any] | None = None,
) -> SummaryData | None:
  """Computes aggregate summary metrics across all steps."""
  if not steps:
    return None
  step_times = [s.step_time_ms for s in steps]
  compute_times = [s.compute_time_ms for s in steps]
  comm_times = [s.communication_time_ms for s in steps]
  infeed_times = [s.infeed_time_ms for s in steps]
  outfeed_times = [s.outfeed_time_ms for s in steps]

  avg_step = round(sum(step_times) / len(step_times), 4)
  avg_comp = round(sum(compute_times) / len(compute_times), 4)
  avg_comm = round(sum(comm_times) / len(comm_times), 4)
  avg_infeed = round(sum(infeed_times) / len(infeed_times), 4)
  avg_outfeed = round(sum(outfeed_times) / len(outfeed_times), 4)

  bottlenecks = [s.bottleneck for s in steps if s.bottleneck]
  primary_b = (
      collections.Counter(bottlenecks).most_common(1)[0][0]
      if bottlenecks
      else ("Communication" if avg_comm > avg_comp else "Compute")
  )

  conclusion = extra_props.get("summary_conclusion") if extra_props else None

  return SummaryData(
      total_steps=len(steps),
      step_time_ms_average=avg_step,
      step_time_ms_min=round(min(step_times), 4),
      step_time_ms_max=round(max(step_times), 4),
      step_time_ms_stddev=(
          round(statistics.stdev(step_times), 4) if len(step_times) > 1 else 0.0
      ),
      compute_time_ms_average=avg_comp,
      compute_percent=(
          round(avg_comp / avg_step * 100, 2) if avg_step > 0 else 0.0
      ),
      communication_time_ms_average=avg_comm,
      communication_percent=(
          round(avg_comm / avg_step * 100, 2) if avg_step > 0 else 0.0
      ),
      infeed_time_ms_average=avg_infeed,
      infeed_percent=(
          round(avg_infeed / avg_step * 100, 2) if avg_step > 0 else 0.0
      ),
      outfeed_time_ms_average=avg_outfeed,
      outfeed_percent=(
          round(avg_outfeed / avg_step * 100, 2) if avg_step > 0 else 0.0
      ),
      primary_bottleneck=primary_b,
      conclusion=conclusion,
  )


def _step_to_dict(step: StepInfo) -> dict[str, Any]:
  """Converts StepInfo dataclass to JSON-serializable dictionary."""
  res = dataclasses.asdict(step)
  if step.communication_breakdown_ms is None:
    res.pop("communication_breakdown_ms", None)
  return res


def _avg_duration_ms(core_stats: list[dict[str, Any]], key: str) -> float:
  """Helper to average a microsecond metric across cores and convert to ms."""
  if not core_stats:
    return 0.0
  avg_us = sum(_safe_float(c.get(key)) for c in core_stats) / len(core_stats)
  return round(avg_us / 1000.0, 4)


def _parse_pod_viewer(
    raw_data: str,
    step_num: int | None = None,
    device_core: int | None = None,
) -> tuple[list[StepInfo], dict[str, Any] | None]:
  """Extracts per-step breakdowns from pod_viewer.json."""
  try:
    data = json.loads(raw_data)
  except json.JSONDecodeError:
    return [], None

  pod_map = data.get("podStatsSequence", {}).get("podStatsMap", [])
  if not isinstance(pod_map, list):
    return [], None

  steps = []
  core_found = False
  for entry in pod_map:
    if not isinstance(entry, dict):
      continue

    s_num = entry.get("stepNum")
    if s_num is not None:
      try:
        s_num = int(s_num)
      except (ValueError, TypeError):
        pass

    if step_num is not None and s_num != step_num:
      continue

    cores = entry.get("podStatsPerCore", {})
    if not isinstance(cores, dict):
      continue

    if device_core is not None:
      core_key = str(device_core)
      if core_key not in cores:
        continue
      core_found = True
      core_stats = [cores[core_key]]
    else:
      core_stats = list(cores.values())

    if not core_stats:
      continue

    total_ms = _avg_duration_ms(core_stats, "totalDurationUs")
    comp_ms = _avg_duration_ms(core_stats, "highFlopsComputeUs")
    crs_ms = _avg_duration_ms(core_stats, "crsDurationUs")
    send_ms = _avg_duration_ms(core_stats, "sendDurationUs")
    recv_ms = _avg_duration_ms(core_stats, "recvDurationUs")
    comm_ms = round(crs_ms + send_ms + recv_ms, 4)
    infeed_ms = _avg_duration_ms(core_stats, "hostInfeedDurationUs")
    outfeed_ms = _avg_duration_ms(core_stats, "hostOutfeedDurationUs")

    comp_pct = round(comp_ms / total_ms * 100, 2) if total_ms > 0 else 0.0
    comm_pct = round(comm_ms / total_ms * 100, 2) if total_ms > 0 else 0.0
    infeed_pct = round(infeed_ms / total_ms * 100, 2) if total_ms > 0 else 0.0
    outfeed_pct = round(outfeed_ms / total_ms * 100, 2) if total_ms > 0 else 0.0

    b_list = [
        str(c.get("bottleneck")) for c in core_stats if c.get("bottleneck")
    ]
    if b_list:
      bottleneck = collections.Counter(b_list).most_common(1)[0][0]
    elif (
        comm_pct > comp_pct and comm_pct > infeed_pct and comm_pct > outfeed_pct
    ):
      bottleneck = "Communication"
    elif infeed_pct > comp_pct and infeed_pct > outfeed_pct:
      bottleneck = "Input / Infeed"
    elif outfeed_pct > comp_pct:
      bottleneck = "Output / Outfeed"
    else:
      bottleneck = "Compute"

    comm_breakdown = CommunicationBreakdown(
        all_reduce_ms=crs_ms,
        send_ms=send_ms,
        recv_ms=recv_ms,
    )

    steps.append(
        StepInfo(
            step_num=s_num,
            step_time_ms=total_ms,
            compute_time_ms=comp_ms,
            compute_percent=comp_pct,
            communication_time_ms=comm_ms,
            communication_percent=comm_pct,
            infeed_time_ms=infeed_ms,
            infeed_percent=infeed_pct,
            outfeed_time_ms=outfeed_ms,
            outfeed_percent=outfeed_pct,
            bottleneck=bottleneck,
            communication_breakdown_ms=comm_breakdown,
        )
    )

  if device_core is not None and not core_found:
    return [], None

  return steps, None


def _parse_input_pipeline_row(
    cells: list[dict[str, Any]],
    col_map: dict[str, int],
    step_num: int | None,
) -> StepInfo | None:
  """Helper to parse a single Google Chart table row in input_pipeline."""
  if not cells:
    return None

  step_col = col_map.get("stepnum", 0)
  s_val = cells[step_col].get("v") if len(cells) > step_col else None
  if s_val is not None:
    try:
      s_num = int(s_val)
    except (ValueError, TypeError):
      s_num = s_val
  else:
    s_num = None

  if step_num is not None and s_num != step_num:
    return None

  comp_col = col_map.get("noninfeedtimems", 1)
  infeed_col = col_map.get("infeedtimems", 2)
  infeed_pct_col = col_map.get("infeedpercentaverage", 4)

  comp_ms = (
      _safe_float(cells[comp_col].get("v")) if len(cells) > comp_col else 0.0
  )
  infeed_ms = (
      _safe_float(cells[infeed_col].get("v"))
      if len(cells) > infeed_col
      else 0.0
  )
  total_ms = round(comp_ms + infeed_ms, 4)

  if len(cells) > infeed_pct_col and cells[infeed_pct_col].get("v") is not None:
    infeed_pct = round(_safe_float(cells[infeed_pct_col].get("v")), 2)
  else:
    infeed_pct = round(infeed_ms / total_ms * 100, 2) if total_ms > 0 else 0.0

  comp_pct = round(comp_ms / total_ms * 100, 2) if total_ms > 0 else 0.0
  bottleneck = "Input / Infeed" if infeed_pct > 50.0 else "Compute"

  return StepInfo(
      step_num=s_num,
      step_time_ms=total_ms,
      compute_time_ms=round(comp_ms, 4),
      compute_percent=comp_pct,
      communication_time_ms=0.0,
      communication_percent=0.0,
      infeed_time_ms=round(infeed_ms, 4),
      infeed_percent=infeed_pct,
      outfeed_time_ms=0.0,
      outfeed_percent=0.0,
      bottleneck=bottleneck,
      communication_breakdown_ms=None,
  )


def _parse_input_pipeline(
    raw_data: str,
    step_num: int | None = None,
) -> tuple[list[StepInfo], dict[str, Any] | None]:
  """Extracts per-step breakdowns from input_pipeline.json."""
  try:
    data = json.loads(raw_data)
  except json.JSONDecodeError:
    return [], None

  if not isinstance(data, list):
    return [], None

  step_section = None
  for section in data:
    if isinstance(section, dict) and "cols" in section and "rows" in section:
      cols = [col.get("id", "").lower() for col in section.get("cols", [])]
      if any("step" in c for c in cols) or any("infeed" in c for c in cols):
        step_section = section
        break

  if not step_section:
    return [], None

  cols = step_section.get("cols", [])
  col_map = {
      str(col.get("id")).lower(): idx
      for idx, col in enumerate(cols)
      if isinstance(col, dict) and col.get("id") is not None
  }

  steps = []
  for row in step_section.get("rows", []):
    step_info = _parse_input_pipeline_row(row.get("c", []), col_map, step_num)
    if step_info:
      steps.append(step_info)

  extra_props = step_section.get("p")
  return steps, extra_props if extra_props else None


def _parse_overview_page(
    raw_data: str,
) -> tuple[list[StepInfo], SummaryData | None]:
  """Fallback to parse aggregate overview statistics."""
  try:
    overview_data = json.loads(raw_data)
  except json.JSONDecodeError:
    return [], None

  if not isinstance(overview_data, list):
    return [], None

  all_p = {}
  for sec in overview_data:
    if isinstance(sec, dict):
      all_p.update(sec.get("p", {}))

  step_time = _safe_float(all_p.get("steptime_ms_average"))
  if step_time <= 0 and "stat_step_time" in all_p:
    step_time = _safe_float(
        str(all_p["stat_step_time"]).replace("ms", "").strip()
    )
  if step_time <= 0:
    return [], None

  step_time_min = (
      _safe_float(all_p.get("steptime_ms_min"))
      if "steptime_ms_min" in all_p
      else step_time
  )
  step_time_max = (
      _safe_float(all_p.get("steptime_ms_max"))
      if "steptime_ms_max" in all_p
      else step_time
  )

  infeed_avg = _safe_float(
      all_p.get("tc_infeed_ms_average", all_p.get("sc_infeed_ms_average"))
  )
  outfeed_avg = _safe_float(
      all_p.get("tc_outfeed_ms_average", all_p.get("sc_outfeed_ms_average"))
  )
  idle_avg = _safe_float(
      all_p.get("tc_idle_ms_average", all_p.get("sc_idle_ms_average"))
  )
  comp_avg = max(0.0, step_time - infeed_avg - outfeed_avg - idle_avg)
  infeed_pct = round(infeed_avg / step_time * 100, 2) if step_time > 0 else 0.0

  total_steps = None
  for key in ("total_steps", "num_steps", "step_count", "total_step_count"):
    if key in all_p:
      val = _safe_int(all_p[key])
      if val is not None:
        total_steps = val
        break

  if total_steps is None:
    for sec in overview_data:
      if isinstance(sec, dict) and "rows" in sec and "cols" in sec:
        cols = [
            str(col.get("id", "")).lower()
            for col in sec.get("cols", [])
            if isinstance(col, dict)
        ]
        if any("step" in c for c in cols) and sec.get("rows"):
          total_steps = len(sec["rows"])
          break

  if total_steps is not None:
    note = (
        "Aggregated overview statistics (individual step breakdown not"
        " available)."
    )
  else:
    note = (
        "Aggregated overview statistics (individual step breakdown and"
        " step count not available)."
    )

  summary = SummaryData(
      total_steps=total_steps,
      step_time_ms_average=round(step_time, 4),
      step_time_ms_min=round(step_time_min, 4),
      step_time_ms_max=round(step_time_max, 4),
      step_time_ms_stddev=round(
          _safe_float(all_p.get("steptime_ms_standard_deviation")), 4
      ),
      compute_time_ms_average=round(comp_avg, 4),
      compute_percent=(
          round(comp_avg / step_time * 100, 2) if step_time > 0 else 0.0
      ),
      communication_time_ms_average=0.0,
      communication_percent=0.0,
      infeed_time_ms_average=round(infeed_avg, 4),
      infeed_percent=infeed_pct,
      outfeed_time_ms_average=round(outfeed_avg, 4),
      outfeed_percent=(
          round(outfeed_avg / step_time * 100, 2) if step_time > 0 else 0.0
      ),
      primary_bottleneck="Input / Infeed" if infeed_pct > 50.0 else "Compute",
      is_aggregate=True,
      note=note,
  )
  return [], summary


def _fetch_tool_data(
    client: Any, session_id: str, tool_name: str, bypass_cache: bool = False
) -> str | None:
  """Helper to safely fetch payload string from XProf client."""
  try:
    result = client.fetch(
        tool_name=tool_name,
        session_id=session_id,
        format="json",
        bypass_cache=bypass_cache,
    )
  except (FileNotFoundError, ValueError):
    raise
  except _FETCH_EXCEPTIONS:
    logging.warning(
        "Error fetching %s for %s", tool_name, session_id, exc_info=True
    )
    return None

  data = result[1] if isinstance(result, tuple) and len(result) == 2 else result
  if not data:
    return None
  if isinstance(data, bytes):
    return data.decode("utf-8", errors="replace")
  return str(data)


def _format_response(
    steps: list[StepInfo],
    summary_data: SummaryData | None,
    limit: int,
    include_summary: bool,
) -> str:
  """Helper to format parsed step trace data as JSON."""
  limited_steps = steps[:limit] if limit > 0 else steps
  summary = summary_data if include_summary else None

  out: dict[str, Any] = {}
  if summary is not None:
    out["summary"] = {
        k: v
        for k, v in dataclasses.asdict(summary).items()
        if v is not None or k == "total_steps"
    }
  out["step_breakdown"] = [_step_to_dict(s) for s in limited_steps]
  return json.dumps(out, indent=2)


def _fetch_and_parse_step_data(
    client: Any,
    session_id: str,
    step_num: int | None,
    device_core: int | None,
    bypass_cache: bool = False,
) -> tuple[list[StepInfo], SummaryData | None]:
  """Helper to try fetching and parsing step trace data across tools."""
  tools = (
      (
          "pod_viewer.json",
          lambda d: _parse_pod_viewer(d, step_num, device_core),
      ),
      ("input_pipeline.json", lambda d: _parse_input_pipeline(d, step_num)),
  )
  for tool_name, parser in tools:
    data = _fetch_tool_data(client, session_id, tool_name, bypass_cache)
    if data:
      steps, extra_props = parser(data)
      if steps:
        return steps, _build_summary(steps, extra_props)

  # Fallback to aggregate overview_page.json
  overview_data = _fetch_tool_data(
      client, session_id, "overview_page.json", bypass_cache
  )
  if overview_data:
    return _parse_overview_page(overview_data)

  return [], None


@decorators.cached(expire=86400)
def get_step_trace(
    session_id: str,
    *,
    step_num: int | None = None,
    limit: int = _DEFAULT_STEP_LIMIT,
    device_core: int | None = None,
    include_summary: bool = True,
    bypass_cache: bool = False,
) -> str:
  """Retrieves step execution breakdowns and timing data from an XProf session.

  Args:
      session_id: The unique XProf session ID.
      step_num: Optional step number to filter for.
      limit: Maximum steps in breakdown (default _DEFAULT_STEP_LIMIT).
      device_core: Optional specific core ID to filter by.
      include_summary: Whether to include aggregate summary (default True).
      bypass_cache: Whether to bypass cache and recompute metrics (default
        False).

  Returns:
      Formatted step execution and timing breakdown in JSON format.
  """
  session_id = str(session_id)
  client = xprof_client.get_client()

  steps, summary_data = _fetch_and_parse_step_data(
      client, session_id, step_num, device_core, bypass_cache
  )

  if steps or summary_data:
    return _format_response(steps, summary_data, limit, include_summary)

  return json.dumps(
      {
          "status": "NO_DATA",
          "message": f"No step trace data returned for session '{session_id}'.",
      },
      indent=2,
  )
