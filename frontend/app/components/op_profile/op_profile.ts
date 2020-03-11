import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Store} from '@ngrx/store';
import {Node} from 'org_xprof/frontend/app/common/interfaces/op_profile.proto';
import {ProfileOrNull} from 'org_xprof/frontend/app/common/interfaces/data_table';
import {NavigationEvent} from 'org_xprof/frontend/app/common/interfaces/navigation_event';
import {DataService} from 'org_xprof/frontend/app/services/data_service/data_service';
import {setLoadingStateAction} from 'org_xprof/frontend/app/store/actions';

import {OpProfileData} from './op_profile_data';

/** An op profile component. */
@Component({
  selector: 'op-profile',
  templateUrl: './op_profile.ng.html',
  styleUrls: ['./op_profile.scss']
})
export class OpProfile {
  profile: ProfileOrNull = null;
  rootNode?: Node;
  data: OpProfileData = new OpProfileData();
  hasTwoProfiles: boolean = false;
  isByCategory: boolean = false;
  byWasted: boolean = false;
  showP90: boolean = false;
  childrenCount: number = 10;

  constructor(
      route: ActivatedRoute, private readonly dataService: DataService,
      private readonly store: Store<{}>) {
    route.params.subscribe(params => {
      this.update(params as NavigationEvent);
    });
  }

  private hasMultipleProfiles(): boolean {
    return !!this.profile && !!this.profile.byCategory &&
        !!this.profile.byProgram;
  }

  private updateRoot() {
    if (!this.profile) {
      this.rootNode = undefined;
      return;
    }
    if (!this.hasTwoProfiles) {
      this.rootNode = this.profile.byCategory || this.profile.byProgram;
    } else {
      this.rootNode =
          this.isByCategory ? this.profile.byCategory : this.profile.byProgram;
    }
  }

  update(event: NavigationEvent) {
    this.store.dispatch(setLoadingStateAction({
      loadingState: {
        loading: true,
        message: 'Loading data',
      }
    }));

    this.dataService.getData(event.run || '', 'op_profile', event.host || '')
        .subscribe(data => {
          this.store.dispatch(setLoadingStateAction({
            loadingState: {
              loading: false,
              message: '',
            }
          }));

          this.profile = data as ProfileOrNull;
          this.hasTwoProfiles = this.hasMultipleProfiles();
          this.isByCategory = false;
          this.childrenCount = 10;
          this.updateRoot();
          this.data.update(this.rootNode);
        });
  }

  updateChildrenCount(value: number) {
    const rounded = Math.round(value / 10) * 10;

    this.childrenCount = Math.max(Math.min(rounded, 100), 10);
  }

  updateToggle() {
    this.isByCategory = !this.isByCategory;
    this.updateRoot();
  }

  updateByWasted() {
    this.byWasted = !this.byWasted;
  }

  updateShowP90() {
    this.showP90 = !this.showP90;
  }
}
