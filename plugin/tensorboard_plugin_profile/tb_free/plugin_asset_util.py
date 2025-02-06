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

import os
from upath import UPath

_PLUGINS_DIR = "plugins"
def PluginDirectory(logdir, plugin_name):
    return os.path.join(logdir, _PLUGINS_DIR, plugin_name)

def ListAssets(logdir, plugin_name):
    plugin_dir = PluginDirectory(logdir, plugin_name)
    try:
        # Strip trailing slashes, which listdir() includes for some filesystems.
        return [x.path.rstrip("/")[len(plugin_dir)+1:] for x in UPath(plugin_dir).iterdir()]
    except FileNotFoundError:
        return []
