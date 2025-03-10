
import google3.third_party.xprof.plugin.tensorboard_plugin_profile.profile_plugin_test_base as base
import google3.third_party.xprof.plugin.tensorboard_plugin_profile.profile_plugin_test_utils as utils
from tensorboard_plugin_profile.tb_free import context
from tensorboard_plugin_profile.tb_free import plugin_asset_util


class TensorboardProfilePluginTestNoTensorboard(base.BaseProfilePluginTest):

  def setUp(self):
    super().setUp()

    self.multiplexer = context.DataProvider()
    self.asset_util = plugin_asset_util
    self.multiplexer.AddRunsFromDirectory(self.logdir)
    self.plugin = utils.create_profile_plugin(self.logdir, self.multiplexer)
    self._set_up_side_effect()
