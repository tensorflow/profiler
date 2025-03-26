import {Component, OnDestroy} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Store} from '@ngrx/store';
import {MemoryViewerPreprocessResult} from 'org_xprof/frontend/app/common/interfaces/data_table';
import {NavigationEvent} from 'org_xprof/frontend/app/common/interfaces/navigation_event';
import {DataService} from 'org_xprof/frontend/app/services/data_service/data_service';
import {setLoadingStateAction} from 'org_xprof/frontend/app/store/actions';
import {ReplaySubject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

/** A memory viewer component. */
@Component({
  standalone: false,
  selector: 'memory-viewer',
  templateUrl: './memory_viewer.ng.html',
  styleUrls: ['./memory_viewer.scss']
})
export class MemoryViewer implements OnDestroy {
  memoryViewerPreprocessResult: MemoryViewerPreprocessResult|null = null;
  currentRun = '';
  currentHost = '';

  /** Handles on-destroy Subject, used to unsubscribe. */
  private readonly destroyed = new ReplaySubject<void>(1);

  constructor(
      route: ActivatedRoute,
      private readonly dataService: DataService,
      private readonly store: Store<{}>) {
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
    let params = new Map<string, string>();
    params = params.set('memory_space', event.memorySpaceColor || '0');

    this.dataService
        .getData(
            event.run || this.currentRun, event.tag || 'memory_viewer^',
            event.host || this.currentHost, params)
        .pipe(takeUntil(this.destroyed))
        .subscribe(data => {
          this.store.dispatch(setLoadingStateAction({
            loadingState: {
              loading: false,
              message: '',
            }
          }));
          if (!data) return;
          this.memoryViewerPreprocessResult =
              data as MemoryViewerPreprocessResult | null;
          this.currentRun = event.run || this.currentRun;
          this.currentHost = event.host || this.currentHost;
        });
  }

  ngOnDestroy() {
    // Unsubscribes all pending subscriptions.
    this.destroyed.next();
    this.destroyed.complete();
  }
}
