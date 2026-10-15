"""Unit tests for OSS LocalXprofClient logdir configuration and caching."""

import hashlib
import os
import pathlib
import shutil
import sys
import tempfile
import unittest
from unittest import mock

# pylint: disable=g-import-not-at-top
from xprof.cli.internal import decorators
from xprof.cli.internal.oss import xprof_client


class OssXprofClientTest(unittest.TestCase):

  def setUp(self):
    super().setUp()
    self.temp_dir = tempfile.mkdtemp()
    self.addCleanup(lambda: shutil.rmtree(self.temp_dir, ignore_errors=True))
    self.cache_dir = pathlib.Path(self.temp_dir) / 'cli_cache'
    self.cache_dir.mkdir(parents=True, exist_ok=True)
    mock.patch.object(
        decorators, '_get_cache_dir', return_value=self.cache_dir
    ).start()
    mock.patch.object(
        decorators, 'get_cache_dir', return_value=self.cache_dir
    ).start()
    if hasattr(xprof_client.convert, 'xspace_to_tool_data'):
      self.mock_converter = mock.patch.object(
          xprof_client.convert,
          'xspace_to_tool_data',
          return_value=(b'{}', 'application/json'),
      ).start()
    else:
      self.mock_converter = mock.patch.object(
          xprof_client.convert,
          'raw_to_tool_data',
          return_value=('application/json', b'{}'),
      ).start()
    self.addCleanup(mock.patch.stopall)

  def test_set_logdir_none(self):
    client = xprof_client.LocalXprofClient()
    client.set_logdir(None)
    self.assertIsNone(client.logdir)

  def test_set_logdir_str(self):
    client = xprof_client.LocalXprofClient()
    client.set_logdir('/tmp/test')
    self.assertIsNotNone(client.logdir)

  def test_get_run_dir_with_direct_dir(self):
    client = xprof_client.LocalXprofClient()
    run_dir = client.get_run_dir('/tmp')
    self.assertEqual(str(run_dir), '/tmp')

  def test_get_xspace_paths_single_file(self):
    client = xprof_client.LocalXprofClient()
    with mock.patch('pathlib.Path.is_file', return_value=True):
      paths = client.get_xspace_paths('/tmp/test.xplane.pb')
      self.assertEqual(paths, ['/tmp/test.xplane.pb'])

  def test_fetch_unknown_tool_raises_value_error(self):
    client = xprof_client.LocalXprofClient()
    with self.assertRaisesRegex(ValueError, 'Unknown XProf tool name'):
      client.fetch('non_existent_tool', 'test_session')

  def test_compute_fingerprint_uses_exact_xspace_paths(self):
    """Verifies fingerprint covers input traces only and ignores generated artifacts."""
    run_dir = pathlib.Path(self.temp_dir) / 'run1'
    nested_dir = run_dir / 'nested'
    nested_dir.mkdir(parents=True, exist_ok=True)

    trace1 = run_dir / 'host.xplane.pb'
    trace1.write_bytes(b'trace_bytes_1')
    trace2 = nested_dir / 'worker.xspace.pb'
    trace2.write_bytes(b'trace_bytes_2')

    client = xprof_client.LocalXprofClient()
    xspace_paths = client.get_xspace_paths(run_dir)
    self.assertEqual(len(xspace_paths), 2)

    fp1 = decorators._compute_path_fingerprint(
        run_dir, xspace_paths=xspace_paths
    )
    self.assertNotEqual(fp1, 'NO_TRACE_INPUTS')

    # Simulate C++ converter generating artifacts in run_dir
    (run_dir / 'ALL_HOSTS.op_stats_v2.pb').write_bytes(b'generated_op_stats')
    (run_dir / 'summary.json').write_text('{"status": "ok"}', encoding='utf-8')
    (run_dir / '.xprof_trace_fingerprint').write_text('stale', encoding='utf-8')

    xspace_paths_after = client.get_xspace_paths(run_dir)
    fp2 = decorators._compute_path_fingerprint(
        run_dir, xspace_paths=xspace_paths_after
    )

    self.assertEqual(
        fp1,
        fp2,
        msg='Fingerprint must remain identical when generated files appear',
    )

  def test_compute_fingerprint_nested_layout_sensitivity(self):
    """Verifies modifying trace files in nested directory hierarchy updates fingerprint."""
    run_dir = pathlib.Path(self.temp_dir) / 'run_nested'
    nested_dir = run_dir / 'plugins' / 'profile' / '2026_08_20'
    nested_dir.mkdir(parents=True, exist_ok=True)

    trace = nested_dir / 'worker.xspace.pb'
    trace.write_bytes(b'original_trace')

    client = xprof_client.LocalXprofClient()
    xspace_paths = client.get_xspace_paths(run_dir)
    fp1 = decorators._compute_path_fingerprint(
        run_dir, xspace_paths=xspace_paths
    )

    # Modify nested trace content and mtime
    trace.write_bytes(b'modified_trace_longer_content')
    stat = trace.stat()
    os.utime(trace, (stat.st_atime + 10, stat.st_mtime + 10))

    fp2 = decorators._compute_path_fingerprint(
        run_dir, xspace_paths=client.get_xspace_paths(run_dir)
    )
    self.assertNotEqual(
        fp1, fp2, msg='Modifying nested trace must alter fingerprint'
    )

  def test_compute_fingerprint_no_trace_inputs_sentinel(self):
    """Verifies empty directories return explicit NO_TRACE_INPUTS sentinel."""
    empty_dir = pathlib.Path(self.temp_dir) / 'empty'
    empty_dir.mkdir()

    fp = decorators._compute_path_fingerprint(empty_dir)
    self.assertEqual(fp, 'NO_TRACE_INPUTS')

    # Directory with non-trace files only
    (empty_dir / 'notes.txt').write_text('not a trace', encoding='utf-8')
    fp_non_trace = decorators._compute_path_fingerprint(empty_dir)
    self.assertEqual(fp_non_trace, 'NO_TRACE_INPUTS')

  def test_external_atomic_fingerprint_storage(self):
    """Verifies fingerprint is stored in /tmp/.../fingerprints/ and not in run_dir."""
    run_dir = pathlib.Path(self.temp_dir) / 'run_external'
    run_dir.mkdir()
    trace = run_dir / 'host.xplane.pb'
    trace.write_bytes(b'trace_data')

    client = xprof_client.LocalXprofClient()
    client.fetch('overview_page.json', str(run_dir))

    # Assert no .xprof_trace_fingerprint in run_dir
    self.assertFalse(
        (run_dir / '.xprof_trace_fingerprint').exists(),
        msg='Trace directory must not contain .xprof_trace_fingerprint',
    )

    # Assert external fingerprint file exists, keyed on the resolved scope.
    scope_key = '|'.join([str(run_dir), str(trace)])
    scope_hash = hashlib.sha256(scope_key.encode('utf-8')).hexdigest()[:16]
    fp_file = decorators._get_cache_dir() / 'fingerprints' / f'{scope_hash}.fp'
    self.assertTrue(
        fp_file.exists(), msg='External fingerprint file must exist'
    )

  def test_sibling_ranks_do_not_share_fingerprint_state(self):
    """Verifies each rank in a shared directory gets its own freshness key."""
    run_dir = pathlib.Path(self.temp_dir) / 'multi_host_fp'
    run_dir.mkdir()
    rank0 = run_dir / 'rank0.xplane.pb'
    rank0.write_bytes(b'rank0_trace_data')
    rank2 = run_dir / 'rank2.xplane.pb'
    rank2.write_bytes(b'rank2_trace_data')

    client = xprof_client.LocalXprofClient()
    client.fetch('overview_page.json', str(rank0))
    client.fetch('overview_page.json', str(rank2))

    fp_dir = decorators._get_cache_dir() / 'fingerprints'
    hashes = set()
    for trace in (rank0, rank2):
      scope_key = '|'.join([str(run_dir), str(trace)])
      hashes.add(hashlib.sha256(scope_key.encode('utf-8')).hexdigest()[:16])
    self.assertEqual(len(hashes), 2)
    for scope_hash in hashes:
      self.assertTrue((fp_dir / f'{scope_hash}.fp').exists())

  def test_fetch_readonly_trace_dir(self):
    """Verifies fetch() succeeds on read-only trace directories."""
    run_dir = pathlib.Path(self.temp_dir) / 'run_readonly'
    run_dir.mkdir()
    trace = run_dir / 'host.xplane.pb'
    trace.write_bytes(b'trace_data')

    # Set directory permissions to read-only (0o555)
    os.chmod(run_dir, 0o555)
    try:
      client = xprof_client.LocalXprofClient()
      content_type, data = client.fetch('overview_page.json', str(run_dir))
      self.assertEqual(content_type, 'application/json')
      self.assertEqual(data, b'{}')
    finally:
      os.chmod(run_dir, 0o755)

  def test_fetch_bypass_cache_flag_forwarded(self):
    """Verifies bypass_cache=True unlinks op_stats and sets use_saved_result='0'."""
    run_dir = pathlib.Path(self.temp_dir) / 'run_bypass'
    run_dir.mkdir()
    trace = run_dir / 'host.xplane.pb'
    trace.write_bytes(b'trace_data')
    op_stats = run_dir / 'ALL_HOSTS.op_stats_v2.pb'
    op_stats.write_bytes(b'existing_op_stats')

    client = xprof_client.LocalXprofClient()
    client.fetch('overview_page.json', str(run_dir), bypass_cache=True)

    # Assert op_stats was unlinked
    self.assertFalse(op_stats.exists(), msg='op_stats should be unlinked')
    # Assert use_saved_result='0' was passed to converter
    call_kwargs = self.mock_converter.call_args[1]
    self.assertEqual(call_kwargs['params']['use_saved_result'], '0')

  def test_single_file_in_multi_host_dir_preserves_file_scope(self):
    """Verifies passing a single .xplane.pb file in a multi-host dir does not glob siblings."""
    run_dir = pathlib.Path(self.temp_dir) / 'multi_host_run'
    run_dir.mkdir()
    rank0 = run_dir / 'rank0_node0.xplane.pb'
    rank0.write_bytes(b'rank0_trace_data')
    rank2 = run_dir / 'rank2_node0.xplane.pb'
    rank2.write_bytes(b'rank2_trace_data')

    client = xprof_client.LocalXprofClient()
    hosts = client.get_hosts(str(rank0), with_metadata=True)
    self.assertEqual(hosts, [{'hostname': 'rank0_node0'}])

    client.fetch('overview_page.json', str(rank0))
    call_kwargs = self.mock_converter.call_args[1]
    self.assertEqual(call_kwargs['xspace_paths'], [str(rank0)])

  def test_logdir_root_resolves_to_latest_run_only(self):
    """Verifies a logdir root selects its latest run instead of merging runs."""
    logdir = pathlib.Path(self.temp_dir) / 'logs'
    profile_dir = logdir / 'plugins' / 'profile'
    old_run = profile_dir / '2026_09_16_21_05_30'
    latest_run = profile_dir / '2026_09_17_09_12_44'
    old_run.mkdir(parents=True)
    latest_run.mkdir(parents=True)
    (old_run / 'host.xplane.pb').write_bytes(b'old_trace')
    latest_trace = latest_run / 'host.xplane.pb'
    latest_trace.write_bytes(b'latest_trace')

    client = xprof_client.LocalXprofClient()
    self.assertEqual(client.get_xspace_paths(str(logdir)), [str(latest_trace)])

    client.fetch('overview_page.json', str(logdir))
    call_kwargs = self.mock_converter.call_args[1]
    self.assertEqual(call_kwargs['xspace_paths'], [str(latest_trace)])

  def _make_two_rank_run(self) -> tuple[pathlib.Path, str, str]:
    run_dir = pathlib.Path(self.temp_dir) / 'two_rank_run'
    run_dir.mkdir()
    rank0 = run_dir / 'rank0_node0.xplane.pb'
    rank0.write_bytes(b'rank0')
    rank2 = run_dir / 'rank2_node0.xplane.pb'
    rank2.write_bytes(b'rank2')
    return run_dir, str(rank0), str(rank2)

  def test_describe_capture_file_lists_siblings_without_warning(self):
    run_dir, rank0, _ = self._make_two_rank_run()
    client = xprof_client.LocalXprofClient()
    capture = client.describe_capture(rank0, combine='summed')
    self.assertEqual(capture['run'], run_dir.name)
    self.assertEqual(capture['files_used'], ['rank0_node0'])
    self.assertEqual(capture['files_available'], ['rank0_node0', 'rank2_node0'])
    self.assertFalse(capture['combined'])
    self.assertEqual(capture['warnings'], [])

  def test_describe_capture_dir_warns_per_combine_mode(self):
    run_dir, _, _ = self._make_two_rank_run()
    client = xprof_client.LocalXprofClient()
    summed = client.describe_capture(str(run_dir), combine='summed')
    self.assertTrue(summed['combined'])
    self.assertEqual(len(summed['warnings']), 1)
    self.assertIn('summed for counts and durations', summed['warnings'][0])
    merged = client.describe_capture(str(run_dir), combine='merged')
    self.assertIn('all-hosts view', merged['warnings'][0])
    none = client.describe_capture(str(run_dir), combine='none')
    self.assertEqual(none['warnings'], [])

  def test_describe_capture_logdir_root_warns_about_ignored_runs(self):
    logdir = pathlib.Path(self.temp_dir) / 'logs'
    profile_dir = logdir / 'plugins' / 'profile'
    for run in ('2026_09_16_21_05_30', '2026_09_17_09_12_44'):
      (profile_dir / run).mkdir(parents=True)
      (profile_dir / run / 'host.xplane.pb').write_bytes(b'trace')
    client = xprof_client.LocalXprofClient()
    capture = client.describe_capture(str(logdir))
    self.assertEqual(capture['run'], '2026_09_17_09_12_44')
    self.assertEqual(len(capture['warnings']), 1)
    self.assertIn("'2026_09_16_21_05_30'", capture['warnings'][0])

  def test_resolve_host_path_matches_stem_and_host_name(self):
    run_dir, rank0, _ = self._make_two_rank_run()
    client = xprof_client.LocalXprofClient()
    self.assertEqual(
        client.resolve_host_path(str(run_dir), 'rank0_node0'), rank0
    )
    self.assertEqual(client.resolve_host_path(rank0, 'rank0_node0'), rank0)

  def test_resolve_host_path_unknown_lists_available(self):
    run_dir, _, _ = self._make_two_rank_run()
    client = xprof_client.LocalXprofClient()
    with self.assertRaisesRegex(ValueError, r'(?s)nope.*rank0_node0.*rank2'):
      client.resolve_host_path(str(run_dir), 'nope')

  def test_resolve_host_path_conflicting_file_raises(self):
    _, rank0, _ = self._make_two_rank_run()
    client = xprof_client.LocalXprofClient()
    with self.assertRaisesRegex(ValueError, 'Conflicting selection'):
      client.resolve_host_path(rank0, 'rank2_node0')

  def test_fetch_filters_by_host_and_hosts(self):
    run_dir, rank0, rank2 = self._make_two_rank_run()
    client = xprof_client.LocalXprofClient()
    client.fetch('overview_page.json', str(run_dir), host='rank2_node0')
    self.assertEqual(self.mock_converter.call_args[1]['xspace_paths'], [rank2])
    client.fetch(
        'overview_page.json', str(run_dir), hosts='rank0_node0,rank2_node0'
    )
    self.assertEqual(
        self.mock_converter.call_args[1]['xspace_paths'], [rank0, rank2]
    )
    with self.assertRaisesRegex(ValueError, 'Unknown host'):
      client.fetch('overview_page.json', str(run_dir), host='nope')

  def test_fetch_single_host_tool_rejects_multiple_traces(self):
    run_dir, _, _ = self._make_two_rank_run()
    client = xprof_client.LocalXprofClient()
    with self.assertRaisesRegex(
        ValueError, r'(?s)memory_profile needs exactly one trace.*rank2_node0'
    ):
      client.fetch('memory_profile.json', str(run_dir))
    self.mock_converter.assert_not_called()

  def test_get_xspace_paths_collapses_symlinked_duplicates(self):
    run_dir, rank0, _ = self._make_two_rank_run()
    os.symlink(rank0, run_dir / 'zz_link.xplane.pb')
    client = xprof_client.LocalXprofClient()
    self.assertEqual(len(client.get_xspace_paths(str(run_dir))), 2)

  def test_get_serialized_xspace_multi_trace_raises_value_error(self):
    run_dir, _, _ = self._make_two_rank_run()
    client = xprof_client.LocalXprofClient()
    with self.assertRaisesRegex(ValueError, 'needs exactly one trace'):
      client.get_serialized_xspace(str(run_dir))
    self.assertEqual(
        client.get_serialized_xspace(str(run_dir), host='rank2_node0'),
        b'rank2',
    )

  def _save_op_stats_like_converter(
      self, run_dir: pathlib.Path | None = None
  ) -> None:
    """Makes the mock converter save op_stats in Dirname(xspace_paths[0])."""
    del run_dir  # SessionSnapshot uses Dirname(xspace_paths[0]).

    def convert(xspace_paths, tool, params):
      del tool  # Unused.
      op_stats = (
          pathlib.Path(xspace_paths[0]).parent / 'ALL_HOSTS.op_stats_v2.pb'
      )
      if params['use_saved_result'] == '0' or not op_stats.exists():
        op_stats.write_text(','.join(xspace_paths), encoding='utf-8')
      return op_stats.read_bytes(), 'application/json'

    self.mock_converter.side_effect = convert

  def _use_saved_result(self) -> str:
    return self.mock_converter.call_args[1]['params']['use_saved_result']

  def test_host_switch_does_not_reuse_other_scope_op_stats(self):
    """Verifies H0, H1, combined, H1 recomputes instead of reusing combined."""
    run_dir, rank0, rank2 = self._make_two_rank_run()
    self._save_op_stats_like_converter(run_dir)
    client = xprof_client.LocalXprofClient()

    client.fetch('overview_page.json', str(run_dir), host='rank0_node0')
    client.fetch('overview_page.json', str(run_dir), host='rank2_node0')
    _, combined = client.fetch('overview_page.json', str(run_dir))
    self.assertEqual(combined, f'{rank0},{rank2}'.encode())

    with mock.patch.object(
        pathlib.Path, 'unlink', autospec=True, side_effect=pathlib.Path.unlink
    ) as mock_unlink:
      _, data = client.fetch(
          'hlo_stats.json', str(run_dir), host='rank2_node0'
      )
    self.assertEqual(self._use_saved_result(), '0')
    self.assertIn(
        run_dir / 'ALL_HOSTS.op_stats_v2.pb',
        [c.args[0] for c in mock_unlink.call_args_list],
    )
    self.assertEqual(data, rank2.encode())

  def test_repeated_same_scope_reuses_saved_op_stats(self):
    """Verifies a scope that wrote the op_stats files reuses them."""
    run_dir, _, rank2 = self._make_two_rank_run()
    self._save_op_stats_like_converter(run_dir)
    client = xprof_client.LocalXprofClient()

    client.fetch('overview_page.json', str(run_dir), host='rank2_node0')
    self.assertEqual(self._use_saved_result(), '0')
    _, data = client.fetch('hlo_stats.json', str(run_dir), host='rank2_node0')
    self.assertEqual(self._use_saved_result(), '1')
    self.assertEqual(data, rank2.encode())

  def test_unowned_op_stats_file_is_not_reused(self):
    """Verifies op_stats written outside this CLI scope are recomputed."""
    run_dir, _, rank2 = self._make_two_rank_run()
    op_stats = run_dir / 'ALL_HOSTS.op_stats_v2.pb'
    op_stats.write_bytes(b'written_by_tensorboard')
    # An older CLI stored a matching fingerprint but no owner marker.
    scope_key = '|'.join([str(run_dir), rank2])
    scope_hash = hashlib.sha256(scope_key.encode('utf-8')).hexdigest()[:16]
    fp_dir = decorators._get_cache_dir() / 'fingerprints'
    fp_dir.mkdir(parents=True, exist_ok=True)
    (fp_dir / f'{scope_hash}.fp').write_text(
        decorators.compute_path_fingerprint(run_dir, xspace_paths=[rank2]),
        encoding='utf-8',
    )

    client = xprof_client.LocalXprofClient()
    client.fetch('hlo_stats.json', str(run_dir), host='rank2_node0')

    self.assertEqual(self._use_saved_result(), '0')
    self.assertFalse(op_stats.exists())

  def test_readonly_dir_with_foreign_op_stats_never_reuses(self):
    """Verifies an undeletable foreign op_stats file is never claimed."""
    run_dir, _, _ = self._make_two_rank_run()
    op_stats = run_dir / 'ALL_HOSTS.op_stats_v2.pb'
    op_stats.write_bytes(b'written_by_tensorboard')
    os.chmod(run_dir, 0o555)
    self.addCleanup(os.chmod, run_dir, 0o755)
    if os.access(run_dir, os.W_OK):
      self.skipTest('Running with permissions that ignore read-only dirs.')

    client = xprof_client.LocalXprofClient()
    for _ in range(2):
      content_type, _ = client.fetch(
          'overview_page.json', str(run_dir), host='rank2_node0'
      )
      self.assertEqual(content_type, 'application/json')
      self.assertEqual(self._use_saved_result(), '0')
    self.assertTrue(op_stats.exists())

  def test_same_run_dir_via_symlink_and_relpath_shares_owner(self):
    """Verifies relative, symlink, and absolute paths share one owner record."""
    run_dir, rank0, _ = self._make_two_rank_run()
    self._save_op_stats_like_converter(run_dir)
    alias_dir = pathlib.Path(self.temp_dir) / 'run_alias'
    os.symlink(run_dir, alias_dir)
    rel_dir = os.path.relpath(run_dir, os.getcwd())
    client = xprof_client.LocalXprofClient()

    client.fetch('overview_page.json', str(alias_dir), host='rank0_node0')
    client.fetch('overview_page.json', str(run_dir), host='rank2_node0')
    _, data = client.fetch('hlo_stats.json', rel_dir, host='rank0_node0')
    self.assertEqual(self._use_saved_result(), '0')
    self.assertEqual(data, os.path.relpath(rank0, os.getcwd()).encode())

  def test_external_rewrite_of_op_stats_invalidates_owner(self):
    """Verifies an external rewrite of ALL_HOSTS.op_stats_v2.pb is detected."""
    run_dir, _, rank2 = self._make_two_rank_run()
    self._save_op_stats_like_converter(run_dir)
    client = xprof_client.LocalXprofClient()

    client.fetch('overview_page.json', str(run_dir), host='rank2_node0')
    self.assertEqual(self._use_saved_result(), '0')

    # Simulate TensorBoard or the XProf UI rewriting op_stats after the CLI.
    (run_dir / 'ALL_HOSTS.op_stats_v2.pb').write_bytes(
        b'overwritten_by_tensorboard_all_hosts'
    )

    _, data = client.fetch('hlo_stats.json', str(run_dir), host='rank2_node0')
    self.assertEqual(self._use_saved_result(), '0')
    self.assertEqual(data, rank2.encode())

  def test_non_op_stats_tool_preserves_saved_op_stats_and_owner(self):
    """Verifies tools like trace_viewer do not delete op_stats or steal owner."""
    run_dir, rank0, rank2 = self._make_two_rank_run()
    op_stats = run_dir / 'ALL_HOSTS.op_stats_v2.pb'

    def convert(xspace_paths, tool, params):
      if tool in ('overview_page', 'hlo_stats'):
        if params['use_saved_result'] == '0' or not op_stats.exists():
          op_stats.write_text(','.join(xspace_paths), encoding='utf-8')
        return op_stats.read_bytes(), 'application/json'
      return b'{"traceEvents": []}', 'application/json'

    self.mock_converter.side_effect = convert
    client = xprof_client.LocalXprofClient()

    client.fetch('overview_page.json', str(run_dir))
    self.assertEqual(self._use_saved_result(), '0')
    self.assertTrue(op_stats.exists())

    # Running trace_viewer and memory_profile on a single host must not delete
    # the combined op_stats file or claim ownership for rank0_node0.
    client.fetch('trace_viewer.json', str(run_dir), host='rank0_node0')
    self.assertEqual(self._use_saved_result(), '1')
    self.assertTrue(op_stats.exists())

    client.fetch('memory_profile.json', str(run_dir), host='rank0_node0')
    self.assertEqual(self._use_saved_result(), '1')
    self.assertTrue(op_stats.exists())

    # Combined hlo_stats still reuses the combined op_stats file.
    _, combined = client.fetch('hlo_stats.json', str(run_dir))
    self.assertEqual(self._use_saved_result(), '1')
    self.assertEqual(combined, f'{rank0},{rank2}'.encode())

    # And single-host hlo_stats for rank0_node0 still knows it does not own
    # the combined op_stats file, so it recomputes.
    _, single = client.fetch(
        'hlo_stats.json', str(run_dir), host='rank0_node0'
    )
    self.assertEqual(self._use_saved_result(), '0')
    self.assertEqual(single, rank0.encode())

  def test_get_owned_op_stats_path_tracks_scope_and_subdirectories(self):
    """Verifies get_owned_op_stats_path checks scope ownership and subdirs."""
    run_dir = pathlib.Path(self.temp_dir) / 'nested_run'
    sub0 = run_dir / 'sub0'
    sub1 = run_dir / 'sub1'
    sub0.mkdir(parents=True)
    sub1.mkdir(parents=True)
    rank0 = sub0 / 'rank0_node0.xplane.pb'
    rank2 = sub1 / 'rank2_node0.xplane.pb'
    rank0.write_bytes(b'rank0')
    rank2.write_bytes(b'rank2')
    self._save_op_stats_like_converter()

    client = xprof_client.LocalXprofClient()
    all_paths = [str(rank0), str(rank2)]
    self.assertIsNone(client.get_owned_op_stats_path(str(run_dir), all_paths))
    self.assertIsNone(client.read_owned_op_stats_bytes(str(run_dir), all_paths))

    client.fetch('overview_page.json', str(run_dir))
    self.assertEqual(
        client.get_owned_op_stats_path(str(run_dir), all_paths),
        sub0 / 'ALL_HOSTS.op_stats_v2.pb',
    )
    self.assertEqual(
        client.read_owned_op_stats_bytes(str(run_dir), all_paths),
        f'{rank0},{rank2}'.encode('utf-8'),
    )
    self.assertIsNone(
        client.get_owned_op_stats_path(str(run_dir), [str(rank0)])
    )
    self.assertIsNone(
        client.read_owned_op_stats_bytes(str(run_dir), [str(rank0)])
    )

    client.fetch('overview_page.json', str(run_dir), host='rank2_node0')
    self.assertFalse((sub0 / 'ALL_HOSTS.op_stats_v2.pb').exists())
    self.assertIsNone(client.get_owned_op_stats_path(str(run_dir), all_paths))
    self.assertIsNone(client.read_owned_op_stats_bytes(str(run_dir), all_paths))
    self.assertEqual(
        client.get_owned_op_stats_path(str(run_dir), [str(rank2)]),
        sub1 / 'ALL_HOSTS.op_stats_v2.pb',
    )
    self.assertEqual(
        client.read_owned_op_stats_bytes(str(run_dir), [str(rank2)]),
        str(rank2).encode('utf-8'),
    )


if __name__ == '__main__':
  unittest.main()
