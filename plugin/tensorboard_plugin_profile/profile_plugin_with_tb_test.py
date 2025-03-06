from tensorboard.backend.event_processing import plugin_asset_util
from tensorboard.backend.event_processing import plugin_event_multiplexer
import google3.third_party.xprof.plugin.tensorboard_plugin_profile.profile_plugin_test_base as base
import google3.third_party.xprof.plugin.tensorboard_plugin_profile.profile_plugin_test_utils as utils


class TensorboardProfilePluginTest(
    base.BaseProfilePluginTest
):

  def setUp(self):
    super().setUp()

    self.multiplexer = plugin_event_multiplexer.EventMultiplexer()
    self.asset_util = plugin_asset_util
    self.multiplexer.AddRunsFromDirectory(self.logdir)
    self.plugin = utils.create_profile_plugin(self.logdir, self.multiplexer)
    self._set_up_side_effect()
