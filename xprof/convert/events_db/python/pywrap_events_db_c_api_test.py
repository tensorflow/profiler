# Copyright 2026 The TensorFlow Authors. All Rights Reserved.
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
"""Tests for Events DB C API Python bindings."""

from absl.testing import absltest
from absl.testing import parameterized

from xprof.convert.events_db.python import pywrap_events_db_c_api as events_db


class ParquetExportOptionsTest(parameterized.TestCase):

  def test_default_options(self):
    opts = events_db.ParquetExportOptions()
    self.assertEqual(opts.batch_size, 65536)
    self.assertIsNone(opts.max_record_count)
    self.assertIsNone(opts.compression_type)
    self.assertIsNone(opts.compression_level)

  def test_custom_options(self):
    opts = events_db.ParquetExportOptions(
        max_record_count=1000,
        batch_size=1024,
        compression_type=events_db.ArrowCompressionType.SNAPPY,
        compression_level=3,
    )
    self.assertEqual(opts.max_record_count, 1000)
    self.assertEqual(opts.batch_size, 1024)
    self.assertEqual(
        opts.compression_type,
        events_db.ArrowCompressionType.SNAPPY,
    )
    self.assertEqual(opts.compression_level, 3)

  @parameterized.parameters(0, -1)
  def test_rejects_non_positive_batch_size(self, batch_size: int):
    with self.assertRaisesRegex(
        ValueError, f"batch_size must be positive, got {batch_size}"
    ):
      events_db.ParquetExportOptions(batch_size=batch_size)

  @parameterized.parameters(0, -1)
  def test_rejects_non_positive_max_record_count(self, max_record_count: int):
    with self.assertRaisesRegex(
        ValueError, f"max_record_count must be positive, got {max_record_count}"
    ):
      events_db.ParquetExportOptions(
          max_record_count=max_record_count
      )

  def test_rejects_compression_level_without_type(self):
    with self.assertRaisesRegex(
        ValueError, "compression_level requires compression_type to be set."
    ):
      events_db.ParquetExportOptions(compression_level=3)


class ArrowCompressionTypeTest(parameterized.TestCase):

  @parameterized.parameters(
      ("SNAPPY", "SNAPPY"),
      ("UNCOMPRESSED", "UNCOMPRESSED"),
      ("ZSTD", "ZSTD"),
  )
  def test_enum_values(self, member_name: str, expected_val: str):
    self.assertEqual(
        events_db.ArrowCompressionType[member_name].value,
        expected_val,
    )


if __name__ == "__main__":
  absltest.main()
