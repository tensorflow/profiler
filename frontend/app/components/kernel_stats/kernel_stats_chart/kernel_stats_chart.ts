import {Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';

import {SimpleDataTableOrNull} from 'org_xprof/frontend/app/common/interfaces/data_table';

declare interface KernelStatsColumn {
  kernelName: number;
  totalDurationUs: number;
}

const KERNEL_NAME_COLUMN_INDEX = 0;
const TOTAL_DURATION_US_COLUMN_INDEX = 1;
const TOOLTIP_COLUMN_INDEX = 2;

/** A kernel stats chart view component. */
@Component({
  selector: 'kernel-stats-chart',
  templateUrl: './kernel_stats_chart.ng.html',
  styleUrls: ['./kernel_stats_chart.scss']
})
export class KernelStatsChart implements OnChanges, OnInit {
  /** The kernel stats data. */
  @Input() kernelStatsData: SimpleDataTableOrNull = null;

  @ViewChild('chart', {static: false}) chartRef!: ElementRef;

  chart: google.visualization.PieChart|null = null;

  ngOnInit() {
    this.loadGoogleChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.drawChart();
  }

  private makeTooltip(
      kernelName: string, durationUs: number, totalDurationUs: number): string {
    return '<div style="padding:5px;">' +
        '<b>' + kernelName + '</b><br/>' + durationUs.toFixed(2) + ' us ' +
        '(' + (durationUs / totalDurationUs * 100.0).toFixed(1) + ')%' +
        '</div>';
  }

  drawChart() {
    if (!this.chart || !this.kernelStatsData) {
      return;
    }

    const dataTable = new google.visualization.DataTable(this.kernelStatsData);
    const columns: KernelStatsColumn = {
      kernelName: 0,
      totalDurationUs: 0,
    };
    for (let i = 0; i < dataTable.getNumberOfColumns(); i++) {
      switch (dataTable.getColumnId(i)) {
        case 'kernel_name':
          columns.kernelName = i;
          break;
        case 'total_duration_us':
          columns.totalDurationUs = i;
          break;
        default:
          break;
      }
    }

    // tslint:disable-next-line:no-any
    const dataGroup = new (google.visualization as any)['data']['group'](
        dataTable, [columns.kernelName], [
          {
            'column': columns.totalDurationUs,
            // tslint:disable-next-line:no-any
            'aggregation': (google.visualization as any)['data']['sum'],
            'type': 'number',
          },
        ]);
    dataGroup.sort([
      {
        column: TOTAL_DURATION_US_COLUMN_INDEX,
        desc: true,
      },
      {
        column: KERNEL_NAME_COLUMN_INDEX,
        asc: true,
      },
    ]);
    dataGroup.addColumn({
      type: 'string',
      role: 'tooltip',
      p: {'html': true},
    });

    let totalDurationUs = 0.0;
    for (let i = 0; i < Math.min(dataGroup.getNumberOfRows(), 10); i++) {
      totalDurationUs += dataGroup.getValue(i, TOTAL_DURATION_US_COLUMN_INDEX);
    }

    for (let i = 0; i < dataGroup.getNumberOfRows(); i++) {
      const tooltip = this.makeTooltip(
          dataGroup.getValue(i, KERNEL_NAME_COLUMN_INDEX),
          dataGroup.getValue(i, TOTAL_DURATION_US_COLUMN_INDEX),
          totalDurationUs);
      dataGroup.setValue(i, TOOLTIP_COLUMN_INDEX, tooltip);
    }

    const dataView = new google.visualization.DataView(dataGroup);
    if (dataView.getNumberOfRows() > 10) {
      dataView.hideRows(10, dataView.getNumberOfRows() - 1);
    }

    const options = {
      backgroundColor: 'transparent',
      width: 700,
      height: 250,
      chartArea: {
        left: 0,
        width: '90%',
        height: '90%',
      },
      legend: {textStyle: {fontSize: 10}},
      sliceVisibilityThreshold: 0.01,
      tooltip: {isHtml: true},
    };

    this.chart.draw(dataView, options);
  }

  loadGoogleChart() {
    if (!google || !google.charts) {
      setTimeout(() => {
        this.loadGoogleChart();
      }, 100);
    }

    google.charts.load('current', {'packages': ['corechart']});
    google.charts.setOnLoadCallback(() => {
      this.chart =
          new google.visualization.PieChart(this.chartRef.nativeElement);
      this.drawChart();
    });
  }
}
