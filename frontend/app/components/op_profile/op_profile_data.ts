import {Node} from 'org_xprof/frontend/app/common/interfaces/op_profile.jsonpb_decls';
import {ProfileOrNull} from 'org_xprof/frontend/app/common/interfaces/data_table';
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

  // TODO: Make this function stateful or move to util.
  findNode(opProfile: ProfileOrNull, moduleName: string, nodeName: string): Node
      |null|undefined {
    if (!opProfile || !opProfile.byProgram) return null;
    for (const topLevelNode of opProfile.byProgram.children!) {
      // Find the program id from OpProfile by the selected XLA module.
      if (topLevelNode.name === moduleName) {
        const node = this.findNodeHelper(topLevelNode.children, nodeName);
        if (node) return node;
      }
    }
    return null;
  }

  private findNodeHelper(children: Node[]|null|undefined, name: string): Node
      |null|undefined {
    if (!children) return null;
    for (const node of children) {
      if (node.name === name) return node;
      const findChildren = this.findNodeHelper(node.children, name);
      if (findChildren) return findChildren;
    }
    return null;
  }
}
