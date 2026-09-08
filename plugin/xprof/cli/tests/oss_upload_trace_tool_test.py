"""Unit tests for OSS upload_trace tool."""

import json
import pathlib
import shutil
import sys
import tempfile
import unittest
from unittest import mock

# pylint: disable=g-import-not-at-top
from xprof.cli.internal.oss import xprof_client
from xprof.cli.tools.oss import upload_trace_tool


class OssUploadTraceToolTest(unittest.TestCase):
  """Tests for upload_trace tool in OSS mode."""

  def setUp(self) -> None:
    super().setUp()
    self.temp_dir = tempfile.mkdtemp()
    self.addCleanup(lambda: shutil.rmtree(self.temp_dir, ignore_errors=True))
    self.client = xprof_client.get_client()
    self.original_logdir = self.client.logdir
    self.addCleanup(
        lambda: self.client.set_logdir(
            str(self.original_logdir)
            if self.original_logdir is not None
            else None
        )
    )

    # Create dummy source trace file
    self.src_dir = pathlib.Path(self.temp_dir) / 'source'
    self.src_dir.mkdir(parents=True, exist_ok=True)
    self.src_file = self.src_dir / 'test_trace.xplane.pb'
    self.trace_content = b'mock_xplane_binary_payload_12345'
    self.src_file.write_bytes(self.trace_content)

  def test_upload_trace_success_with_custom_run_name(self) -> None:
    """Tests trace import with explicit custom run_name."""
    logdir = pathlib.Path(self.temp_dir) / 'logdir'
    self.client.set_logdir(str(logdir))

    res_raw = upload_trace_tool.upload_trace(
        str(self.src_file), run_name='my_custom_run'
    )
    res = json.loads(res_raw)

    self.assertEqual(res.get('status'), 'success')
    self.assertEqual(res.get('run_name'), 'my_custom_run')
    expected_file = (
        logdir
        / 'plugins'
        / 'profile'
        / 'my_custom_run'
        / 'test_trace.xplane.pb'
    )
    self.assertTrue(expected_file.exists())
    self.assertEqual(expected_file.read_bytes(), self.trace_content)

  def test_upload_trace_default_run_name(self) -> None:
    """Tests trace import fallback to 'imported_trace' when run_name is None."""
    logdir = pathlib.Path(self.temp_dir) / 'logdir'
    self.client.set_logdir(str(logdir))

    res_raw = upload_trace_tool.upload_trace(str(self.src_file))
    res = json.loads(res_raw)

    self.assertEqual(res.get('status'), 'success')
    self.assertEqual(res.get('run_name'), 'imported_trace')
    expected_file = (
        logdir
        / 'plugins'
        / 'profile'
        / 'imported_trace'
        / 'test_trace.xplane.pb'
    )
    self.assertTrue(expected_file.exists())
    self.assertEqual(expected_file.read_bytes(), self.trace_content)

  def test_upload_trace_missing_logdir_returns_error(self) -> None:
    """Tests that missing client logdir returns an informative error."""
    self.client.set_logdir(None)

    res_raw = upload_trace_tool.upload_trace(
        str(self.src_file), run_name='test_run'
    )
    res = json.loads(res_raw)

    self.assertIn('error', res)
    self.assertIn('Logdir not set in client', res['error'])

  def test_upload_trace_nonexistent_file_returns_error(self) -> None:
    """Tests that a non-existent file returns a FileNotFoundError error."""
    logdir = pathlib.Path(self.temp_dir) / 'logdir'
    self.client.set_logdir(str(logdir))
    nonexistent = str(self.src_dir / 'does_not_exist.xplane.pb')

    res_raw = upload_trace_tool.upload_trace(nonexistent, run_name='test_run')
    res = json.loads(res_raw)

    self.assertIn('error', res)
    self.assertIn('does not exist', res['error'])

  def test_upload_trace_ignores_extra_kwargs(self) -> None:
    """Tests that ttl, tag, and extra kwargs are safely ignored."""
    logdir = pathlib.Path(self.temp_dir) / 'logdir'
    self.client.set_logdir(str(logdir))

    res_raw = upload_trace_tool.upload_trace(
        str(self.src_file),
        ttl=3600,
        tag=['tag1', 'tag2'],
        run_name='tagged_run',
        extra_param='ignored_value',
    )
    res = json.loads(res_raw)

    self.assertEqual(res.get('status'), 'success')
    self.assertEqual(res.get('run_name'), 'tagged_run')


if __name__ == '__main__':
  unittest.main()
