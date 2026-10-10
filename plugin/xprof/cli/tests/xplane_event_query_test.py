"""Unit tests for xplane_event_query."""

from absl.testing import absltest
from absl.testing import parameterized
from xprof.cli.internal import xplane_event_query as q


def _rec(
    plane="/device:TPU:0",
    line="XLA Ops",
    event="fusion.1",
    offset_ps=100,
    duration_ps=50,
):
  return q.EventRecord(
      plane=plane,
      line=line,
      event=event,
      offset_ps=offset_ps,
      duration_ps=duration_ps,
  )


class WindowTest(parameterized.TestCase):

  @parameterized.named_parameters(
      ("inside", 120, 10, True, True),
      ("straddles_start", 90, 20, False, True),
      ("straddles_end", 190, 20, False, True),
      ("before", 50, 10, False, False),
      ("touching_start", 90, 10, False, False),
      ("after", 210, 10, False, False),
  )
  def test_containment_vs_overlap(self, offset, dur, contained, overlaps):
    self.assertEqual(
        q.matches_window(offset, dur, 100, 200, q.WINDOW_CONTAINMENT),
        contained,
    )
    self.assertEqual(
        q.matches_window(offset, dur, 100, 200, q.WINDOW_OVERLAP), overlaps
    )

  def test_invalid_window_raises(self):
    with self.assertRaises(ValueError):
      q.matches_window(0, 0, 200, 100)
    with self.assertRaises(ValueError):
      q.validate_window_semantics("partial")

  def test_duration_bounds(self):
    self.assertTrue(q.matches_duration(50, 50, 50))
    self.assertFalse(q.matches_duration(49, 50, None))
    self.assertFalse(q.matches_duration(51, None, 50))
    with self.assertRaises(ValueError):
      q.matches_duration(0, 10, 5)


class FilterTest(parameterized.TestCase):

  @parameterized.named_parameters(
      ("empty", "", True),
      ("eq", 'event == "fusion.1"', True),
      ("neq", "event != fusion.1", False),
      ("regex", "event =~ ^fus", True),
      ("not_regex", "event !~ ^fus", False),
      ("contains", "plane CONTAINS TPU", True),
      ("numeric_ps", "duration_ps >= 50", True),
      ("numeric_unit", "duration < 1ns", True),
      ("numeric_ns_field", "duration_ns == 0.05", True),
      ("end", "end_ps == 150", True),
      ("and_or", "line == x OR (event ~ fusion AND offset_ps < 200)", True),
      ("not", "NOT event ~ fusion", False),
      ("bang", "!(duration_ps > 10)", False),
      ("symbols", "event ~ fusion && duration_ps > 10 || plane == x", True),
  )
  def test_expressions(self, expr, expected):
    self.assertEqual(q.compile_filter(expr)(_rec()), expected)

  @parameterized.named_parameters(
      ("unknown_field", "bogus == 1"),
      ("missing_value", "event =="),
      ("unclosed", "(event == a"),
      ("bad_numeric", "duration_ps > abc"),
      ("bad_numeric_op", "duration_ps ~ 1"),
      ("trailing", "event == a b"),
  )
  def test_invalid_expressions(self, expr):
    with self.assertRaises(ValueError):
      q.compile_filter(expr)


class GroupingTest(absltest.TestCase):

  def test_parse_group_by(self):
    self.assertEqual(q.parse_group_by("plane, event,plane"), ("plane", "event"))
    with self.assertRaises(ValueError):
      q.parse_group_by("")
    with self.assertRaises(ValueError):
      q.parse_group_by("host")

  def test_parse_group_by_accepts_sequences(self):
    # python-fire parses `--group_by=plane,event` into a tuple.
    self.assertEqual(q.parse_group_by(("plane", "event")), ("plane", "event"))
    self.assertEqual(
        q.parse_group_by(["Plane, event", "line", "plane"]),
        ("plane", "event", "line"),
    )
    with self.assertRaises(ValueError):
      q.parse_group_by(())
    with self.assertRaises(ValueError):
      q.parse_group_by(("plane", "host"))

  def test_record_group_key(self):
    self.assertEqual(
        q.record_group_key(_rec(), ("line", "event")), ("XLA Ops", "fusion.1")
    )

  def test_percentile(self):
    vals = [100, 200, 300, 400, 500]
    self.assertEqual(q.percentile([], 0.5), 0.0)
    self.assertEqual(q.percentile([7], 0.9), 7.0)
    self.assertAlmostEqual(q.percentile(vals, 0.5), 300.0)
    self.assertAlmostEqual(q.percentile(vals, 0.9), 460.0)
    self.assertAlmostEqual(q.percentile(vals, 0.99), 496.0)

  def test_summarize_groups_sorted_by_total(self):
    rows = q.summarize_groups({("a",): [1, 2, 3], ("b",): [10]}, ("event",))
    self.assertEqual([r["event"] for r in rows], ["b", "a"])
    self.assertEqual(rows[1]["count"], 3)
    self.assertAlmostEqual(rows[1]["p50_duration_ps"], 2.0)
    self.assertAlmostEqual(rows[1]["std_dev_ps"], 1.0)
    self.assertEqual(rows[0]["std_dev_ps"], 0.0)


if __name__ == "__main__":
  absltest.main()
