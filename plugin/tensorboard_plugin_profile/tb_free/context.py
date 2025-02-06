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
"""A standalone version of Tensorboard's context and utils"""

import re
import os
import logging
import collections
from typing import Any, Generator
from upath import UPath

logger = logging.getLogger('tensorboard')

class RequestContext():
  """Overload of tensorboard/context.py:RequestContext"""
  def __init__(self):
    pass

def IsCloudPath(path: UPath) -> bool:
  """Checks whether a given path is Cloud filesystem path."""
  return path.protocol and path.protocol not in ["file", "local"]

_ESCAPE_GLOB_CHARACTERS_REGEX = re.compile("([*?[])")
def _EscapeGlobCharacters(path: str) -> str:
    drive, path = os.path.splitdrive(path)
    return "%s%s" % (drive, _ESCAPE_GLOB_CHARACTERS_REGEX.sub(r"[\1]", path))

def ListRecursivelyViaGlobbing(top: UPath) -> Generator[tuple[str, str], None, None]:
    """Recursively lists all files with the directory.
    
    Based off of tensorboard/backend/event_processing/io_wrapper.py:ListRecursivelyViaGlobbing"""
    current_glob_string = _EscapeGlobCharacters(top)
    level = 0

    while True:
        logger.info("GlobAndListFiles: Starting to glob level %d", level)
        path = UPath(current_glob_string)
        glob = path('*')
        logger.info(
            "GlobAndListFiles: %d files glob-ed at level %d", len(glob), level
        )

        if not glob:
            # This subdirectory level lacks files. Terminate.
            return

        # Map subdirectory to a list of files.
        pairs = collections.defaultdict(list)
        for file_path in glob:
            pairs[os.path.dirname(file_path)].append(file_path)
        for dir_name, file_paths in pairs.items():
            yield (dir_name, tuple(file_paths))

        if len(pairs) == 1:
            # If at any point the glob returns files that are all in a single
            # directory, replace the current globbing path with that directory as the
            # literal prefix. This should improve efficiency in cases where a single
            # subdir is significantly deeper than the rest of the sudirs.
            current_glob_string = list(pairs.keys())[0]

        # Iterate to the next level of subdirectories.
        current_glob_string = os.path.join(current_glob_string, "*")
        level += 1

def ListRecursivelyViaWalking(top: UPath) -> Generator[tuple[str, str], None, None]:
  for dir_path, _, filenames in os.walk(top.path):
    yield (
      dir_path,
      (os.path.join(dir_path, filename) for filename in filenames),
    )

def IsTensorFlowEventsFile(path: str):
    if not path:
        raise ValueError("Path must be a nonempty string")
    return "tfevents" in os.path.basename(path)

class Run():
   def __init__(self, path):
      self.run_name = path

class DataProvider():
  """https://github.com/tensorflow/tensorboard/blob/a7178f4f622a786463d23ef645e0f16f6ea7a1cb/tensorboard/data/provider.py#L26"""
  def __init__(self, logdir=''):
    self._paths = {}
    if logdir:
      self.AddRunsFromDirectory(logdir)

  def list_runs(self, ctx, experiment_id):
    return self._paths.values()

  def AddRun(self, path, name=None):
    name = name or path
    self._paths[name] = Run(name)
    return self
      
  def AddRunsFromDirectory(self, path: str, name: str = None):
    path = UPath(path).expanduser()
    logger.info("Starting AddRunsFromDirectory: %s", path)
    for subdir in GetLogdirSubdirectories(path):
      logger.info("Adding run from directory %s", subdir)
      rpath = os.path.relpath(subdir, path)
      subname = os.path.join(name, rpath) if name else rpath
      self.AddRun(subdir, name=subname)
    logger.info("Done with AddRunsFromDirectory: %s", path)
    return self
  
  def Reload(self):
     pass

def GetLogdirSubdirectories(path: UPath):
  """Obtains all subdirectories with events files.
  
  Based off of tensorboard/backend/event_processing/io_wrapper.py. """
  if not path.exists():
    # No directory to traverse.
    return ()

  if not path.is_dir():
    raise ValueError(
      "GetLogdirSubdirectories: path exists and is not a "
      "directory, %s" % path
    )

  if IsCloudPath(path):
    # Glob-ing for files can be significantly faster than recursively
    # walking through directories for some file systems.
    logger.info(
      "GetLogdirSubdirectories: Starting to list directories via glob-ing."
    )
    traversal_method = ListRecursivelyViaGlobbing
  else:
    # For other file systems, the glob-ing based method might be slower because
    # each call to glob could involve performing a recursive walk.
    logger.info(
      "GetLogdirSubdirectories: Starting to list directories via walking."
    )
    traversal_method = ListRecursivelyViaWalking

    return (
      subdir
      for (subdir, files) in traversal_method(path)
      if any(IsTensorFlowEventsFile(f) for f in files)
    )

class MultiplexerDataProvider():
   def __init__(self, multiplexer, logdir):
      self.multiplexer = multiplexer
      self.logdir = logdir
