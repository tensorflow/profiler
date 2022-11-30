import {Node} from 'org_xprof/frontend/app/common/interfaces/op_profile.jsonpb_decls';
import * as utils from 'org_xprof/frontend/app/common/utils/utils';

/** An op profile data class. */
export class OpProfileData {
  bwColor?: string;
  hbmBwColor?: string;
  flopsColor?: string;
  memoryBandwidthUtilizationPercent?: string;
  hbmBandwidthUtilizationPercent?: string;
  flopsUtilizationPercent?: string;

  update(node?: Node) {
    if (node) {
      const flopUtilization = utils.flopsUtilization(node);
      this.flopsColor = utils.flopsColor(flopUtilization);
      this.flopsUtilizationPercent = utils.percent(flopUtilization);

      const memUtilization = utils.memoryBandwidthUtilization(node, false);
      this.bwColor = utils.bwColor(memUtilization);
      this.memoryBandwidthUtilizationPercent = utils.percent(memUtilization);

      const hbmUtilization = utils.memoryBandwidthUtilization(node, true);
      this.hbmBwColor = utils.bwColor(hbmUtilization);
      this.hbmBandwidthUtilizationPercent = utils.percent(hbmUtilization);
    } else {
      this.bwColor = undefined;
      this.flopsColor = undefined;
      this.memoryBandwidthUtilizationPercent = undefined;
      this.flopsUtilizationPercent = undefined;
    }
  }
}
