import {Component, OnDestroy} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Store} from '@ngrx/store';
import {STACK_CHART_FILL_COLORS} from 'org_xprof/frontend/app/common/constants/constants';
import {InputPipelineDataTable, SimpleDataTable,} from 'org_xprof/frontend/app/common/interfaces/data_table';
import {NavigationEvent} from 'org_xprof/frontend/app/common/interfaces/navigation_event';
import {setLoadingState} from 'org_xprof/frontend/app/common/utils/utils';
import {DataService} from 'org_xprof/frontend/app/services/data_service/data_service';
import {setCurrentToolStateAction} from 'org_xprof/frontend/app/store/actions';
import {ReplaySubject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {InputPipelineCommon} from './input_pipeline_common';

const COLUMN_ID_MAX_INFEED_CORE = 'index';
const STEPTIME_COLUMN_IDS_FOR_TPU_INTERNAL = [
  'stepnum',
  'tcComputeTimeMs',
  'scv0ComputeTimeMs',
  'scv0InfeedTimeMs',
  'tcInfeedTimeMs',
  'tcOutfeedTimeMs',
  'tcIdleTimeMs',
  'tooltip',
];

/** An input pipeline component. */
@Component({
  standalone: false,
  selector: 'input-pipeline',
  templateUrl: './input_pipeline.ng.html',
  styleUrls: ['./input_pipeline.css']
})
export class InputPipeline extends InputPipelineCommon implements OnDestroy {
  readonly tool = 'input_pipeline_analyzer';
  readonly columnIds = STEPTIME_COLUMN_IDS_FOR_TPU_INTERNAL;
  readonly columnColors = STACK_CHART_FILL_COLORS;
  /** Handles on-destroy Subject, used to unsubscribe. */
  private readonly destroyed = new ReplaySubject<void>(1);

  constructor(
      route: ActivatedRoute, private readonly dataService: DataService,
      private readonly store: Store<{}>) {
    super();
    route.params.pipe(takeUntil(this.destroyed)).subscribe((params) => {
      this.update(params as NavigationEvent);
    });
    this.store.dispatch(setCurrentToolStateAction({currentTool: this.tool}));
  }

  update(event: NavigationEvent) {
    const run = event.run || '';
    const tag = event.tag || this.tool;
    const host = event.host || '';

    setLoadingState(true, this.store, 'Loading input pipeline data');

    this.dataService.getData(run, tag, host)
        .pipe(takeUntil(this.destroyed))
        .subscribe((data) => {
          setLoadingState(false, this.store);
          data = (data || []) as InputPipelineDataTable[];
          this.parseCommonInputData(data);
          this.isTpu = !!this.deviceAnalysis && !!this.deviceAnalysis.p &&
              this.deviceAnalysis.p['hardware_type'] === 'TPU';
          this.maxInfeedCoreTable = this.findAnalysisData(
                                        data,
                                        COLUMN_ID_MAX_INFEED_CORE,
                                        ) as SimpleDataTable |
              null;
          if (this.isTpu) {
            this.parseHostOpTables(data);
          }
        });
  }

  ngOnDestroy() {
    setLoadingState(false, this.store);
    // Unsubscribes all pending subscriptions.
    this.destroyed.next();
    this.destroyed.complete();
  }
}
