"""Shared filtering, windowing, grouping, and percentile helpers for XPlane events."""

from collections.abc import Callable, Mapping, Sequence
import dataclasses
import re
import statistics
from typing import Any

WINDOW_CONTAINMENT = "containment"
WINDOW_OVERLAP = "overlap"
VALID_WINDOW_SEMANTICS = frozenset({WINDOW_CONTAINMENT, WINDOW_OVERLAP})

VALID_GROUP_BY_FIELDS = frozenset({"event", "plane", "line"})

_UNIT_TO_PS = {
    "ps": 1.0,
    "ns": 1_000.0,
    "us": 1_000_000.0,
    "ms": 1_000_000_000.0,
    "s": 1_000_000_000_000.0,
}

_NUMBER_UNIT_RE = re.compile(
    r"^(?P<num>[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)"
    r"\s*(?P<unit>ps|ns|us|ms|s)?$"
)

_TOKEN_SPEC = re.compile(
    r"""
    \s*(?:
        (?P<LPAREN>\()
      | (?P<RPAREN>\))
      | (?P<OP>==|!=|=~|!~|<=|>=|=|<|>|~)
      | (?P<BANG>!)
      | (?P<STRING>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')
      | (?P<WORD>[^\s()=!<>~"']+)
    )
    """,
    re.VERBOSE,
)


@dataclasses.dataclass(frozen=True)
class EventRecord:
  """Normalized timeline event record used for filtering and aggregation."""

  plane: str
  line: str
  event: str
  offset_ps: int
  duration_ps: int
  line_id: str = ""

  @property
  def end_ps(self) -> int:
    """Absolute/relative end timestamp in picoseconds."""
    return self.offset_ps + self.duration_ps


def validate_window_semantics(window_semantics: str) -> str:
  """Validates and normalizes `window_semantics` (`containment` or `overlap`)."""
  norm = window_semantics.strip().lower()
  if norm not in VALID_WINDOW_SEMANTICS:
    raise ValueError(
        "window_semantics must be 'containment' or 'overlap', got"
        f" {window_semantics!r}"
    )
  return norm


def matches_window(
    offset_ps: int,
    duration_ps: int,
    start_time_ps: int | None,
    end_time_ps: int | None,
    window_semantics: str = WINDOW_CONTAINMENT,
) -> bool:
  """Returns True if an event `[offset_ps, offset_ps + duration_ps)` matches the window."""
  if (
      start_time_ps is not None
      and end_time_ps is not None
      and start_time_ps > end_time_ps
  ):
    raise ValueError(
        f"start_time_ps ({start_time_ps}) must be <= end_time_ps"
        f" ({end_time_ps})"
    )
  event_end = offset_ps + duration_ps
  if window_semantics == WINDOW_CONTAINMENT:
    if start_time_ps is not None and offset_ps < start_time_ps:
      return False
    if end_time_ps is not None and event_end > end_time_ps:
      return False
    return True
  if window_semantics == WINDOW_OVERLAP:
    if duration_ps > 0:
      if start_time_ps is not None and event_end <= start_time_ps:
        return False
      if end_time_ps is not None and offset_ps >= end_time_ps:
        if not (start_time_ps == end_time_ps == offset_ps):
          return False
    else:
      if start_time_ps is not None and offset_ps < start_time_ps:
        return False
      if end_time_ps is not None and offset_ps > end_time_ps:
        return False
    return True
  raise ValueError(
      "window_semantics must be 'containment' or 'overlap', got"
      f" {window_semantics!r}"
  )


def matches_duration(
    duration_ps: int,
    min_duration_ps: int | None = None,
    max_duration_ps: int | None = None,
) -> bool:
  """Returns True if `duration_ps` is within `[min_duration_ps, max_duration_ps]`."""
  if (
      min_duration_ps is not None
      and max_duration_ps is not None
      and min_duration_ps > max_duration_ps
  ):
    raise ValueError(
        f"min_duration_ps ({min_duration_ps}) must be <= max_duration_ps"
        f" ({max_duration_ps})"
    )
  if min_duration_ps is not None and duration_ps < min_duration_ps:
    return False
  if max_duration_ps is not None and duration_ps > max_duration_ps:
    return False
  return True


def _unquote(token: str) -> str:
  if len(token) >= 2 and token[0] == token[-1] and token[0] in ('"', "'"):
    return bytes(token[1:-1], "utf-8").decode("unicode_escape")
  return token


def _tokenize(expr: str) -> list[tuple[str, str]]:
  """Splits a filter expression into `(kind, text)` tokens.

  Args:
    expr: The raw filter expression.

  Returns:
    The tokens, in order, with whitespace dropped.

  Raises:
    ValueError: If `expr` contains a character that starts no token.
  """
  tokens: list[tuple[str, str]] = []
  pos = 0
  n = len(expr)
  while pos < n:
    if expr[pos].isspace():
      pos += 1
      continue
    match = _TOKEN_SPEC.match(expr, pos)
    if not match or not match.lastgroup:
      raise ValueError(
          f"Invalid filter syntax near {expr[pos:pos + 20]!r} in {expr!r}"
      )
    kind = match.lastgroup
    val = match.group(kind)
    if kind == "WORD":
      upper = val.upper()
      if upper in ("AND", "&&"):
        tokens.append(("AND", val))
      elif upper in ("OR", "||"):
        tokens.append(("OR", val))
      elif upper in ("NOT", "!"):
        tokens.append(("NOT", val))
      elif upper == "CONTAINS":
        tokens.append(("OP", "CONTAINS"))
      elif val.startswith("!") and len(val) > 1:
        tokens.append(("NOT", "!"))
        tokens.append(("WORD", val[1:]))
      else:
        tokens.append(("WORD", val))
    elif kind == "STRING":
      tokens.append(("VALUE", _unquote(val)))
    elif kind == "BANG":
      tokens.append(("NOT", val))
    else:
      tokens.append((kind, val))
    pos = match.end()
  return tokens


def _parse_numeric_ps(raw: str, default_scale: float) -> float:
  match = _NUMBER_UNIT_RE.match(raw.strip())
  if not match:
    raise ValueError(f"Expected numeric value in filter, got {raw!r}")
  num = float(match["num"])
  unit = match["unit"]
  scale = _UNIT_TO_PS[unit] if unit else default_scale
  return num * scale


def _build_comparison(
    field: str, op: str, raw_val: str
) -> Callable[[EventRecord], bool]:
  """Builds a predicate for a single `<field> <op> <value>` atom."""
  key = field.strip().lower()
  if key in ("plane", "line", "line_id", "line_name", "event", "name"):
    if key == "plane":
      getter = lambda r: r.plane
    elif key == "line_id":
      getter = lambda r: r.line_id or r.line
    elif key in ("line", "line_name"):
      getter = lambda r: r.line or r.line_id
    else:
      getter = lambda r: r.event

    if op in ("=", "=="):
      return lambda r: getter(r) == raw_val
    if op == "!=":
      return lambda r: getter(r) != raw_val
    if op == "CONTAINS":
      return lambda r: raw_val in getter(r)
    if op in ("~", "=~"):
      pattern = re.compile(raw_val)
      return lambda r: bool(pattern.search(getter(r)))
    if op == "!~":
      pattern = re.compile(raw_val)
      return lambda r: not bool(pattern.search(getter(r)))
    raise ValueError(f"Unsupported operator {op!r} for string field {field!r}")

  numeric_scales = {
      "duration": 1.0,
      "duration_ps": 1.0,
      "duration_ns": 1_000.0,
      "duration_us": 1_000_000.0,
      "duration_ms": 1_000_000_000.0,
      "offset_ps": 1.0,
      "start_ps": 1.0,
      "end_ps": 1.0,
  }
  if key in numeric_scales:
    target_ps = _parse_numeric_ps(raw_val, numeric_scales[key])
    if key.startswith("duration"):
      num_getter = lambda r: float(r.duration_ps)
    elif key in ("offset_ps", "start_ps"):
      num_getter = lambda r: float(r.offset_ps)
    else:
      num_getter = lambda r: float(r.end_ps)

    if op in ("=", "=="):
      return lambda r: num_getter(r) == target_ps
    if op == "!=":
      return lambda r: num_getter(r) != target_ps
    if op == "<":
      return lambda r: num_getter(r) < target_ps
    if op == "<=":
      return lambda r: num_getter(r) <= target_ps
    if op == ">":
      return lambda r: num_getter(r) > target_ps
    if op == ">=":
      return lambda r: num_getter(r) >= target_ps
    raise ValueError(f"Unsupported operator {op!r} for numeric field {field!r}")

  raise ValueError(
      f"Unknown filter field {field!r}; supported fields are plane, line,"
      " event, duration_ps, duration_ns, duration_us, duration_ms, offset_ps,"
      " start_ps, end_ps"
  )


class _Parser:
  """Recursive-descent parser for boolean event filter expressions."""

  def __init__(self, tokens: Sequence[tuple[str, str]], raw: str):
    self._tokens = tokens
    self._pos = 0
    self._raw = raw

  def parse(self) -> Callable[[EventRecord], bool]:
    """Parses the full token stream into a predicate function."""
    pred = self._parse_or()
    if self._pos < len(self._tokens):
      raise ValueError(
          f"Unexpected token {self._tokens[self._pos][1]!r} in filter"
          f" {self._raw!r}"
      )
    return pred

  def _peek(self) -> tuple[str, str] | None:
    return self._tokens[self._pos] if self._pos < len(self._tokens) else None

  def _consume(self) -> tuple[str, str]:
    tok = self._tokens[self._pos]
    self._pos += 1
    return tok

  def _parse_or(self) -> Callable[[EventRecord], bool]:
    left = self._parse_and()
    while (tok := self._peek()) is not None and tok[0] == "OR":
      self._consume()
      right = self._parse_and()
      prev_left, prev_right = left, right
      left = lambda r, a=prev_left, b=prev_right: a(r) or b(r)
    return left

  def _parse_and(self) -> Callable[[EventRecord], bool]:
    left = self._parse_not()
    while (tok := self._peek()) is not None and tok[0] == "AND":
      self._consume()
      right = self._parse_not()
      prev_left, prev_right = left, right
      left = lambda r, a=prev_left, b=prev_right: a(r) and b(r)
    return left

  def _parse_not(self) -> Callable[[EventRecord], bool]:
    tok = self._peek()
    if tok is not None and tok[0] == "NOT":
      self._consume()
      inner = self._parse_not()
      return lambda r, fn=inner: not fn(r)
    return self._parse_atom()

  def _parse_atom(self) -> Callable[[EventRecord], bool]:
    """Parses a parenthesized expression or a single comparison."""
    tok = self._peek()
    if tok is None:
      raise ValueError(f"Unexpected end of filter expression {self._raw!r}")
    if tok[0] == "LPAREN":
      self._consume()
      inner = self._parse_or()
      closing = self._peek()
      if closing is None or closing[0] != "RPAREN":
        raise ValueError(f"Unclosed '(' in filter expression {self._raw!r}")
      self._consume()
      return inner
    if tok[0] != "WORD":
      raise ValueError(
          f"Expected field name in filter {self._raw!r}, got {tok[1]!r}"
      )
    _, field = self._consume()
    op_tok = self._peek()
    if op_tok is None or op_tok[0] != "OP":
      raise ValueError(
          f"Expected comparison operator after {field!r} in filter"
          f" {self._raw!r}"
      )
    _, op = self._consume()
    val_tok = self._peek()
    if val_tok is None or val_tok[0] not in ("WORD", "VALUE"):
      raise ValueError(
          f"Expected value after {field} {op} in filter {self._raw!r}"
      )
    _, val = self._consume()
    return _build_comparison(field, op, val)


def compile_filter(expr: str) -> Callable[[EventRecord], bool]:
  """Compiles a boolean filter expression into an `EventRecord` predicate."""
  if not expr or not expr.strip():
    return lambda _: True
  tokens = _tokenize(expr)
  return _Parser(tokens, expr).parse()


def parse_group_by(group_by: str | Sequence[str]) -> tuple[str, ...]:
  """Validates and normalizes a `group_by` specification.

  Args:
    group_by: Either a comma-separated string (e.g. "plane,event") or a sequence
      of field names. Sequence elements may themselves contain commas.
      Command-line parsers such as python-fire turn `--group_by=a,b` into a
      tuple, so both forms are accepted.

  Returns:
    The de-duplicated, lower-cased group fields in their original order.

  Raises:
    ValueError: If no fields are given or a field is not supported.
  """
  raw_items = [group_by] if isinstance(group_by, str) else list(group_by)
  parts: list[str] = []
  for item in raw_items:
    parts.extend(p.strip().lower() for p in str(item).split(",") if p.strip())
  if not parts:
    raise ValueError(
        "group_by must specify at least one of: event, plane, line"
    )
  seen: list[str] = []
  for part in parts:
    if part not in VALID_GROUP_BY_FIELDS:
      raise ValueError(
          f"Unsupported group_by field {part!r}; valid fields are event,"
          " plane, line"
      )
    if part not in seen:
      seen.append(part)
  return tuple(seen)


def record_group_key(
    record: EventRecord, group_fields: Sequence[str]
) -> tuple[str, ...]:
  """Extracts the tuple key for `record` corresponding to `group_fields`."""
  values: list[str] = []
  for field in group_fields:
    if field == "event":
      values.append(record.event)
    elif field == "plane":
      values.append(record.plane)
    elif field == "line":
      values.append(record.line or record.line_id)
  return tuple(values)


def percentile(sorted_values: Sequence[int | float], q: float) -> float:
  """Computes linear-interpolated quantile `q` (`0 <= q <= 1`) on sorted values."""
  if not sorted_values:
    return 0.0
  if len(sorted_values) == 1:
    return float(sorted_values[0])
  pos = q * (len(sorted_values) - 1)
  lo = int(pos)
  hi = min(lo + 1, len(sorted_values) - 1)
  frac = pos - lo
  return float(sorted_values[lo]) + frac * float(
      sorted_values[hi] - sorted_values[lo]
  )


def summarize_groups(
    grouped_durations: Mapping[tuple[str, ...], Sequence[int]],
    group_fields: Sequence[str],
) -> list[dict[str, Any]]:
  """Computes count, total, avg, min, p50, p90, p99, max, std_dev per group."""
  rows: list[dict[str, Any]] = []
  for key_tuple, durations in grouped_durations.items():
    if not durations:
      continue
    sorted_durs = sorted(durations)
    count = len(sorted_durs)
    total_duration = sum(sorted_durs)
    row: dict[str, Any] = {
        field: val for field, val in zip(group_fields, key_tuple)
    }
    row.update({
        "count": count,
        "total_duration_ps": total_duration,
        "avg_duration_ps": total_duration / count,
        "min_duration_ps": sorted_durs[0],
        "p50_duration_ps": percentile(sorted_durs, 0.50),
        "p90_duration_ps": percentile(sorted_durs, 0.90),
        "p99_duration_ps": percentile(sorted_durs, 0.99),
        "max_duration_ps": sorted_durs[-1],
        "std_dev_ps": statistics.stdev(sorted_durs) if count > 1 else 0.0,
    })
    rows.append(row)
  rows.sort(key=lambda x: x["total_duration_ps"], reverse=True)
  return rows
