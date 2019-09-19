# Copyright 2019 The TensorFlow Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the 'License');
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an 'AS IS' BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# ==============================================================================

from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

from setuptools import setup

project_name = 'tensorboard_profile_plugin'

def get_readme():
  with open('README.rst') as f:
    return f.read()

def get_version():
  version_ns = {}
  with open('version.py') as f:
   exec(f.read(), {}, version_ns)
  return version_ns['VERSION']

setup(
  name=project_name,
  version=get_version(),
  description='Profile Tensorboard Plugin',
  long_description=get_readme(),
  author='Google Inc.',
  author_email='packages@tensorflow.org',
  url='https://github.com/tensorflow/tensorboard/tree/master/tensorboard/plugins/profile',
  packages=['tensorboard_profile_plugin'],
  package_data={
    'tensorboard_profile_plugin': ['static/**'],
  },
  entry_points={
    'tensorboard_plugins': [
      'dynamic_profile = tensorboard_profile_plugin.plugin:DynamicProfile',
    ],
  },
)
