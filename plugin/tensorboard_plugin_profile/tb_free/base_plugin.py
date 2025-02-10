# Copyright 2025 The TensorFlow Authors. All Rights Reserved.
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

from typing import Any
from tensorboard_plugin_profile.tb_free.context import DataProvider


class TBPlugin:
  pass

class FrontendMetadata:
  pass

class TBLoader:
  pass

class TBContext():
  """https://github.com/tensorflow/tensorboard/blob/a7178f4f622a786463d23ef645e0f16f6ea7a1cb/tensorboard/plugins/base_plugin.py#L229"""
  class Flags():
    def __init__(self, master_tpu_unsecure_channel):
      self.master_tpu_unsecure_channel = master_tpu_unsecure_channel

  def __init__(self, logdir: str, data_provider: DataProvider, flags: dict[str, Any], multiplexer = None):
    self.logdir = logdir
    self.data_provider = multiplexer
    self.flags = flags
    self.multiplexer = multiplexer
