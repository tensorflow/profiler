import {Node} from 'org_xprof/frontend/app/common/interfaces/op_profile.jsonpb_decls';
import {OpProfileProto} from 'org_xprof/frontend/app/common/interfaces/data_table';

import {OpProfileData} from './op_profile_data';

/** Base class of Op Profile component. */
export class OpProfileBase {
  profile: OpProfileProto|null = null;
  rootNode?: Node;
  data = new OpProfileData();
  hasMultiModules = false;
  isByCategory = false;
  excludeIdle = true;
  byWasted = false;
  showP90 = false;
  childrenCount = 10;
  deviceType = 'TPU';

  private updateRoot() {
    if (!this.profile) {
      this.rootNode = undefined;
      return;
    }

    if (this.excludeIdle) {
      if (!this.hasMultiModules) {
        this.rootNode = this.profile.byCategoryExcludeIdle ||
            this.profile.byProgramExcludeIdle;
      } else {
        this.rootNode = this.isByCategory ? this.profile.byCategoryExcludeIdle :
                                            this.profile.byProgramExcludeIdle;
      }
    } else {
      if (!this.hasMultiModules) {
        this.rootNode = this.profile.byCategory || this.profile.byProgram;
      } else {
        this.rootNode = this.isByCategory ? this.profile.byCategory :
                                            this.profile.byProgram;
      }
    }

    this.deviceType = this.profile.deviceType || 'TPU';
  }

  parseData(data: OpProfileProto|null) {
    this.profile = data;
    this.hasMultiModules =
        !!this.profile && !!this.profile.byCategory && !!this.profile.byProgram;
    this.isByCategory = false;
    this.childrenCount = 10;
    this.updateRoot();
    this.data.update(this.rootNode);
  }

  updateChildrenCount(value: number) {
    const rounded = Math.round(value / 10) * 10;

    this.childrenCount = Math.max(Math.min(rounded, 100), 10);
  }

  updateToggle() {
    this.isByCategory = !this.isByCategory;
    this.updateRoot();
  }

  updateExcludeIdle() {
    this.excludeIdle = !this.excludeIdle;
    this.updateRoot();
    this.data.update(this.rootNode);
  }

  updateByWasted() {
    this.byWasted = !this.byWasted;
  }

  updateShowP90() {
    this.showP90 = !this.showP90;
  }
}
