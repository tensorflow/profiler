import {Component, OnDestroy} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Store} from '@ngrx/store';
import {OpProfileProto} from 'org_xprof/frontend/app/common/interfaces/data_table';
import {NavigationEvent} from 'org_xprof/frontend/app/common/interfaces/navigation_event';
import {DataService} from 'org_xprof/frontend/app/services/data_service/data_service';
import {setLoadingStateAction, setOpProfileRootNodeAction} from 'org_xprof/frontend/app/store/actions';
import {ReplaySubject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {OpProfileBase} from './op_profile_base';

/** An op profile component. */
@Component({
  selector: 'op-profile',
  templateUrl: './op_profile.ng.html',
  styleUrls: ['./op_profile.scss']
})
export class OpProfile extends OpProfileBase implements OnDestroy {
  /** Handles on-destroy Subject, used to unsubscribe. */
  private readonly destroyed = new ReplaySubject<void>(1);

  constructor(
      route: ActivatedRoute, private readonly dataService: DataService,
      private readonly store: Store<{}>) {
    super();
    route.params.pipe(takeUntil(this.destroyed)).subscribe((params) => {
      this.update(params as NavigationEvent);
    });
  }

  update(event: NavigationEvent) {
    this.store.dispatch(setLoadingStateAction({
      loadingState: {
        loading: true,
        message: 'Loading data',
      }
    }));

    this.dataService
        .getData(event.run || '', event.tag || 'op_profile', event.host || '')
        .pipe(takeUntil(this.destroyed))
        .subscribe((data) => {
          this.store.dispatch(setLoadingStateAction({
            loadingState: {
              loading: false,
              message: '',
            }
          }));
          this.parseData(data as OpProfileProto | null);
          this.store.dispatch(
              setOpProfileRootNodeAction({rootNode: this.rootNode || null}));
        });
  }

  ngOnDestroy() {
    // Unsubscribes all pending subscriptions.
    this.store.dispatch(setOpProfileRootNodeAction({rootNode: undefined}));
    this.destroyed.next();
    this.destroyed.complete();
  }
}
