import {Node} from 'org_xprof/frontend/app/common/interfaces/op_profile.jsonpb_decls';
import * as utils from 'org_xprof/frontend/app/common/utils/utils';

/** An op profile data class. */
export class OpProfileData {
  bwColors: string[] =
      Array.from<string>({length: utils.MemBwType.MEM_BW_TYPE_MAX + 1})
          .fill('');
  flopsColor?: string;
  bandwidthUtilizationPercents: string[] =
      Array.from<string>({length: utils.MemBwType.MEM_BW_TYPE_MAX + 1})
          .fill('');
  flopsUtilizationPercent?: string;
  memBwType = utils.MemBwType;

  update(node?: Node) {
    if (node) {
      const flopUtilization = utils.flopsUtilization(node, node);
      this.flopsColor = utils.flopsColor(flopUtilization);
      this.flopsUtilizationPercent = utils.percent(flopUtilization);

      for (let i = utils.MemBwType.MEM_BW_TYPE_FIRST;
           i <= utils.MemBwType.MEM_BW_TYPE_MAX; i++) {
        const utilization = utils.memoryBandwidthUtilization(node, i);
        this.bwColors[i] = utils.bwColor(utilization);
        this.bandwidthUtilizationPercents[i] = utils.percent(utilization);
      }
    } else {
      this.bwColors =
          Array.from<string>({length: utils.MemBwType.MEM_BW_TYPE_MAX + 1})
              .fill('');
      this.flopsColor = undefined;
      this.bandwidthUtilizationPercents =
          Array.from<string>({length: utils.MemBwType.MEM_BW_TYPE_MAX + 1})
              .fill('');
      this.flopsUtilizationPercent = undefined;
    }
  }
}
