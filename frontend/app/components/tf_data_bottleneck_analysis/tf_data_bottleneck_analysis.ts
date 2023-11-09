import {Component, OnDestroy} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Store} from '@ngrx/store';
import {SimpleDataTable} from 'org_xprof/frontend/app/common/interfaces/data_table';
import {NavigationEvent} from 'org_xprof/frontend/app/common/interfaces/navigation_event';
import {Dashboard} from 'org_xprof/frontend/app/components/chart/dashboard/dashboard';
import {DataService} from 'org_xprof/frontend/app/services/data_service/data_service';
import {setLoadingStateAction} from 'org_xprof/frontend/app/store/actions';
import {ReplaySubject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

const EVENT_DATA_INDEX = 0;
const SUMMARY_DATA_INDEX = 1;
const BOTTLENECK_DATA_INDEX = 2;

const NAME_COLUMN_INDEX = 3;
const PARENT_COLUMN_INDEX = 4;
const BLOCKING_COLUMN_INDEX = 5;

const BLOCKING_TYPE = 1;
const BOTTLENECK_TYPE = 2;

const IS_INPUT_BOUND_TABLE_PROPERTY_NAME = 'is_input_bound';
const SUMMARY_MESSAGE_TABLE_PROPERTY_NAME = 'summary_message';
const TRUE_STR = 'true';

/** A tf data bottleneck analysis component. */
@Component({
  selector: 'tf-data-bottleneck-analysis',
  templateUrl: './tf_data_bottleneck_analysis.ng.html',
  styleUrls: ['./tf_data_bottleneck_analysis.scss']
})
export class TfDataBottleneckAnalysis extends Dashboard implements OnDestroy {
  /** Handles on-destroy Subject, used to unsubscribe. */
  private readonly destroyed = new ReplaySubject<void>(1);

  isInputBound = false;
  summaryMessage: string|undefined;

  orgChartDataView?: google.visualization.DataView;
  summaryDataTable?: google.visualization.DataTable;
  summaryDataView?: google.visualization.DataView;
  bottleneckDataTable?: google.visualization.DataTable;
  bottleneckDataView?: google.visualization.DataView;

  constructor(
      route: ActivatedRoute, private readonly dataService: DataService,
      private readonly store: Store<{}>) {
    super();
    route.params.pipe(takeUntil(this.destroyed)).subscribe((params) => {
      this.update(params as NavigationEvent);
    });
  }

  styleOrgChart() {
    if (this.dataTable) {
      for (let i = 0; i < this.dataTable.getNumberOfRows(); ++i) {
        const type = this.dataTable.getValue(i, BLOCKING_COLUMN_INDEX);
        switch (type) {
          case BLOCKING_TYPE:
            this.dataTable.setRowProperty(
                i, 'style', 'border: 4px solid black');
            break;
          case BOTTLENECK_TYPE:
            this.dataTable.setRowProperty(i, 'style', 'border: 4px solid red');
            break;
          default:
            this.dataTable.setRowProperty(
                i, 'style', 'border: 4px dashed gray');
            break;
        }
      }
    }
  }

  update(event: NavigationEvent) {
    this.store.dispatch(setLoadingStateAction({
      loadingState: {
        loading: true,
        message: 'Loading data',
      }
    }));

    this.dataService
        .getData(
            event.run || '', event.tag || 'tf_data_bottleneck_analysis',
            event.host || '')
        .pipe(takeUntil(this.destroyed))
        .subscribe((data) => {
          this.store.dispatch(setLoadingStateAction({
            loadingState: {
              loading: false,
              message: '',
            }
          }));

          if (data) {
            const d = data as SimpleDataTable[] | null;
            if (!d) return;
            if (d.hasOwnProperty(EVENT_DATA_INDEX)) {
              this.parseData(d[EVENT_DATA_INDEX]);
              this.styleOrgChart();
            }
            if (d.hasOwnProperty(SUMMARY_DATA_INDEX)) {
              this.summaryDataTable =
                  new google.visualization.DataTable(d[SUMMARY_DATA_INDEX]);
              this.summaryDataView =
                  new google.visualization.DataView(this.summaryDataTable);
            }
            if (d.hasOwnProperty(BOTTLENECK_DATA_INDEX)) {
              this.bottleneckDataTable =
                  new google.visualization.DataTable(d[BOTTLENECK_DATA_INDEX]);
              this.bottleneckDataView =
                  new google.visualization.DataView(this.bottleneckDataTable);
              if (this.bottleneckDataTable.getTableProperty(
                      IS_INPUT_BOUND_TABLE_PROPERTY_NAME) === TRUE_STR) {
                this.isInputBound = true;
              }
              this.summaryMessage = this.bottleneckDataTable.getTableProperty(
                  SUMMARY_MESSAGE_TABLE_PROPERTY_NAME);
            }
          }
        });
  }

   updateView() {
    super.updateView();
    if (!this.dataView) {
      return;
    }
    const orgChartDataView = new google.visualization.DataView(this.dataView);
    orgChartDataView.setColumns([NAME_COLUMN_INDEX, PARENT_COLUMN_INDEX]);
    this.orgChartDataView = orgChartDataView;
  }

  ngOnDestroy() {
    // Unsubscribes all pending subscriptions.
    this.destroyed.next();
    this.destroyed.complete();
  }
}
