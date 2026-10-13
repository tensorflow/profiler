import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  input,
  OnChanges,
  OnInit,
  SimpleChanges,
  viewChild,
} from '@angular/core';

/** A organization chart view component. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'org-chart',
  templateUrl: './org_chart.ng.html',
  styleUrls: ['./org_chart.scss'],
})
export class OrgChart implements OnChanges, OnInit, AfterViewInit {
  private readonly cdr = inject(ChangeDetectorRef);
  readonly dataView = input<google.visualization.DataView>();

  chart?: google.visualization.OrgChart;

  readonly chartRef = viewChild<ElementRef>('chart');

  ngOnChanges(changes: SimpleChanges) {
    this.drawChart();
  }

  ngOnInit() {
    this.loadGoogleChart();
  }

  ngAfterViewInit() {
    if (!this.chart) {
      this.loadGoogleChart();
    }
  }

  drawChart() {
    const dataView = this.dataView();
    if (!this.chart || !dataView) {
      return;
    }

    const options: google.visualization.OrgChartOptions = {
      allowHtml: true,
    };

    this.chart.draw(dataView, options);
  }

  loadGoogleChart() {
    if (!google || !google.charts) {
      setTimeout(() => {
        this.loadGoogleChart();
      }, 100);
    }

    google.charts.safeLoad({'packages': ['orgchart']});
    google.charts.setOnLoadCallback(() => {
      const chartEl = this.chartRef()?.nativeElement;
      if (!chartEl) return;
      this.chart = new google.visualization.OrgChart(chartEl);
      this.drawChart();
      this.cdr.markForCheck();
    });
  }
}
