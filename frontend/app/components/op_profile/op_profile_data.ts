import {Node} from 'org_xprof/frontend/app/common/interfaces/op_profile.jsonpb_decls';
import * as utils from 'org_xprof/frontend/app/common/utils/utils';

/** An op profile data class. */
export class OpProfileData {
  bwColor?: string;
  flopsColor?: string;
  memoryBandwidthUtilizationPercent?: string;
  flopsUtilizationPercent?: string;

  update(node?: Node) {
    if (node) {
      let utilization = utils.flopsUtilization(node);
      this.flopsColor = utils.flopsColor(utilization);
      this.flopsUtilizationPercent = utils.percent(utilization);

      utilization = utils.memoryBandwidthUtilization(node);
      this.bwColor = utils.bwColor(utilization);
      this.memoryBandwidthUtilizationPercent = utils.percent(utilization);
    } else {
      this.bwColor = undefined;
      this.flopsColor = undefined;
      this.memoryBandwidthUtilizationPercent = undefined;
      this.flopsUtilizationPercent = undefined;
    }
  }
}
