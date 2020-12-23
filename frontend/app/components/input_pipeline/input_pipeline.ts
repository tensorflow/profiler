import {Component, OnDestroy} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Store} from '@ngrx/store';
import {InputPipelineDataTable} from 'org_xprof/frontend/app/common/interfaces/data_table';
import {NavigationEvent} from 'org_xprof/frontend/app/common/interfaces/navigation_event';
import {setLoadingState} from 'org_xprof/frontend/app/common/utils/utils';
import {DataService} from 'org_xprof/frontend/app/services/data_service/data_service';
import {ReplaySubject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {InputPipelineCommon} from './input_pipeline_common';

/** An input pipeline component. */
@Component({
  selector: 'input-pipeline',
  templateUrl: './input_pipeline.ng.html',
  styleUrls: ['./input_pipeline.css']
})
export class InputPipeline extends InputPipelineCommon implements OnDestroy {
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
    const run = event.run || '';
    const tag = event.tag || 'input_pipeline_analyzer';
    const host = event.host || '';

    setLoadingState(true, this.store);

    this.dataService.getData(run, tag, host)
        .pipe(takeUntil(this.destroyed))
        .subscribe((data) => {
          setLoadingState(false, this.store);
          data = (data || []) as InputPipelineDataTable[];
          this.parseCommonInputData(data);
        });
  }

  ngOnDestroy() {
    // Unsubscribes all pending subscriptions.
    this.destroyed.next();
    this.destroyed.complete();
  }
}
