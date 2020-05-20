import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Store} from '@ngrx/store';
import {MemoryProfileProtoOrNull} from 'org_xprof/frontend/app/common/interfaces/data_table';
import {NavigationEvent} from 'org_xprof/frontend/app/common/interfaces/navigation_event';
import {DataService} from 'org_xprof/frontend/app/services/data_service/data_service';
import {setLoadingStateAction} from 'org_xprof/frontend/app/store/actions';

/** A Memory Profile component. */
@Component({
  selector: 'memory-profile',
  templateUrl: './memory_profile.ng.html',
  styleUrls: ['./memory_profile.css']
})
export class MemoryProfile {
  data: MemoryProfileProtoOrNull = null;
  run = '';
  host = '';
  hasMemoryData = false;
  memoryIds: string[] = [];
  selectedMemoryId = '';

  constructor(
      route: ActivatedRoute, private readonly dataService: DataService,
      private readonly store: Store<{}>) {
    route.params.subscribe(params => {
      this.update(params as NavigationEvent);
    });
  }

  update(event: NavigationEvent) {
    this.run = event.run || '';
    this.host = event.host || '';

    this.store.dispatch(setLoadingStateAction({
      loadingState: {
        loading: true,
        message: 'Loading data',
      }
    }));

    this.dataService.getData(this.run, 'memory_profile', this.host)
        .subscribe(data => {
          this.store.dispatch(setLoadingStateAction({
            loadingState: {
              loading: false,
              message: '',
            }
          }));

          data = data as MemoryProfileProtoOrNull;
          this.data = data;
          if (data && data.memoryIds && data.numHosts) {
            if (data.numHosts > 0 && data.memoryIds.length > 0) {
              this.hasMemoryData = true;
              this.memoryIds = data.memoryIds;
              if (this.selectedMemoryId === '') {
                this.selectedMemoryId = data.memoryIds[0];
              }
            }
          }
        });
  }
}
