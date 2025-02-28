import {Component, OnDestroy} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Store} from '@ngrx/store';
import {OpProfileProto} from 'org_xprof/frontend/app/common/interfaces/data_table';
import {NavigationEvent} from 'org_xprof/frontend/app/common/interfaces/navigation_event';
import {setLoadingState} from 'org_xprof/frontend/app/common/utils/utils';
import {DataService} from 'org_xprof/frontend/app/services/data_service/data_service';
import {setProfilingDeviceTypeAction} from 'org_xprof/frontend/app/store/actions';
import {ReplaySubject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

/** An op profile component. */
@Component({
  standalone: false,
  selector: 'op-profile',
  templateUrl: './op_profile.ng.html',
  styleUrls: ['./op_profile_common.scss']
})
export class OpProfile implements OnDestroy {
  /** Handles on-destroy Subject, used to unsubscribe. */
  private readonly destroyed = new ReplaySubject<void>(1);

  run = '';
  tag = '';
  host = '';
  opProfileData: OpProfileProto|null = null;

  constructor(
      route: ActivatedRoute,
      private readonly dataService: DataService,
      private readonly store: Store<{}>,
  ) {
    route.params.pipe(takeUntil(this.destroyed)).subscribe((params) => {
      this.processQuery(params);
      this.update(params as NavigationEvent);
    });
  }

  processQuery(params: Params) {
    this.run = params['run'] || '';
    this.tag = params['tag'] || 'op-profiler';
    this.host = params['host'] || '';
  }

  update(event: NavigationEvent) {
    setLoadingState(true, this.store, 'Loading op profile data');

    this.dataService.getData(this.run, this.tag, this.host)
        .pipe(takeUntil(this.destroyed))
        .subscribe((data) => {
          setLoadingState(false, this.store, 'Loading op profile data');
          if (data) {
            this.opProfileData = data as OpProfileProto;
            this.store.dispatch(setProfilingDeviceTypeAction(
                {deviceType: this.opProfileData.deviceType}));
          }
        });
  }

  ngOnDestroy() {
    // Unsubscribes all pending subscriptions.
    setLoadingState(false, this.store);
    this.destroyed.next();
    this.destroyed.complete();
  }
}
