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
"""Python ctypes wrapper for the Events DB C API."""

import dataclasses
import enum


class ArrowCompressionType(enum.Enum):
  """Compression codec applied to Parquet data pages."""

  # go/keep-sorted start
  SNAPPY = "SNAPPY"
  UNCOMPRESSED = "UNCOMPRESSED"
  ZSTD = "ZSTD"
  # go/keep-sorted end


@dataclasses.dataclass(frozen=True, kw_only=True, slots=True)
class ParquetExportOptions:
  """Configuration options for exporting events DB records to Apache Parquet.

  Attributes:
    max_record_count: If set, at most this many records will be written before
      early stopping.
    batch_size: Number of records buffered before flushing a batch to disk.
    compression_type: Compression codec applied to Parquet data pages.
    compression_level: Compressor-specific compression level.
  """

  max_record_count: int | None = None
  batch_size: int = 65536
  compression_type: ArrowCompressionType | None = None
  compression_level: int | None = None

  def __post_init__(self) -> None:
    """Validate the options."""
    if self.max_record_count is not None and self.max_record_count <= 0:
      raise ValueError(
          f"max_record_count must be positive, got {self.max_record_count}"
      )
    if self.batch_size <= 0:
      raise ValueError(f"batch_size must be positive, got {self.batch_size}")
    if self.compression_level is not None and self.compression_type is None:
      raise ValueError("compression_level requires compression_type to be set.")
