import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  OnChanges,
  OnInit,
  output,
  SimpleChanges,
} from '@angular/core';
import {
  ChartClass,
  type ChartDataInfo,
  ChartType,
  CustomChartDataProcessor,
  DataTableOrDataView,
} from 'org_xprof/frontend/app/common/interfaces/chart';

/** A common chart component. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'chart',
  template: '',
  // Below 960px wide charts scroll sideways instead of widening the page. Only
  // horizontal overflow scrolls: the off-screen accessibility element Google
  // Charts adds under each chart would otherwise add a vertical scrollbar.
  styles: [
    ':host {display: block;}',
    `@media (max-width: 959.98px) {
      :host {max-width: 100%; overflow-x: auto; overflow-y: hidden;}
    }`,
  ],
})
export class Chart implements OnChanges, OnInit {
  /** The type of chart. */
  readonly chartType = input<ChartType | `${ChartType}`>();

  /** The information of chart data. */
  readonly dataInfo = input<ChartDataInfo>();

  /** The event for the number of rows of processed data. */
  readonly processedNumberOfRows = output<number>();

  /** The event when the selection of the chart is changed. */
  readonly selected = output<google.visualization.ChartSelection[]>();

  chart?: ChartClass;

  private readonly elementRef: ElementRef = inject(ElementRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private isSmallScreen = window.innerWidth < 960;

  @HostListener('window:resize')
  onResize() {
    const isSmallScreen = window.innerWidth < 960;
    if (isSmallScreen !== this.isSmallScreen) {
      this.isSmallScreen = isSmallScreen;
      this.draw();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    const dataInfo = this.dataInfo();
    if (changes['dataInfo'] && dataInfo && dataInfo.dataProvider) {
      dataInfo.dataProvider.parseData(dataInfo.data);
      dataInfo.dataProvider.setFilters(dataInfo.filters || []);
    }
    this.draw();
  }
  ngOnInit() {
    this.loadGoogleChart();
  }

  draw() {
    this.isSmallScreen = window.innerWidth < 960;
    if (!this.chart) {
      return;
    }

    const dataInfo = this.dataInfo();
    if (!dataInfo || !dataInfo.dataProvider) {
      this.chart.clearChart();
      return;
    }

    const processedData = this.getProcessedData(
      dataInfo.customChartDataProcessor,
    );

    const options = dataInfo.dataProvider.getOptions() || dataInfo.options;
    const drawOptions =
      this.isSmallScreen && options && 'tooltip' in options && options.tooltip
        ? {...options, tooltip: {...options.tooltip, ignoreBounds: false}}
        : options;

    if (processedData) {
      // tslint:disable-next-line:no-any
      this.chart.draw(processedData, drawOptions as any);
    }

    this.processedNumberOfRows.emit(
      processedData ? processedData.getNumberOfRows() : 0,
    );
  }

  getProcessedData(
    customChartDataProcessor: CustomChartDataProcessor | undefined,
  ): DataTableOrDataView | null {
    const dataInfo = this.dataInfo();
    if (!dataInfo || !dataInfo.dataProvider) {
      return null;
    }

    if (customChartDataProcessor && customChartDataProcessor.process) {
      return customChartDataProcessor.process(dataInfo.dataProvider);
    }

    return dataInfo.dataProvider.process();
  }

  loadGoogleChart() {
    if (!google || !google.charts) {
      setTimeout(() => {
        this.loadGoogleChart();
      }, 100);
    }

    google.charts.safeLoad({'packages': ['corechart', 'table', 'line']});
    google.charts.setOnLoadCallback(() => {
      this.initChart();
      this.initDataProvider();
      this.draw();
      if (this.chart) {
        google.visualization.events.addListener(this.chart, 'select', () => {
          this.selected.emit(this.chart?.getSelection() || []);
          this.cdr.markForCheck();
        });
      }
      this.cdr.markForCheck();
    });
  }

  initChart() {
    switch (this.chartType()) {
      case ChartType.AREA_CHART:
        this.chart = new google.visualization.AreaChart(
          this.elementRef.nativeElement,
        );
        break;
      case ChartType.BAR_CHART:
        this.chart = new google.visualization.BarChart(
          this.elementRef.nativeElement,
        );
        break;
      case ChartType.BUBBLE_CHART:
        this.chart = new google.visualization.BubbleChart(
          this.elementRef.nativeElement,
        );
        break;
      case ChartType.CANDLESTICK_CHART:
        this.chart = new google.visualization.CandlestickChart(
          this.elementRef.nativeElement,
        );
        break;
      case ChartType.COLUMN_CHART:
        this.chart = new google.visualization.ColumnChart(
          this.elementRef.nativeElement,
        );
        break;
      case ChartType.COMBO_CHART:
        this.chart = new google.visualization.ComboChart(
          this.elementRef.nativeElement,
        );
        break;
      case ChartType.HISTOGRAM:
        this.chart = new google.visualization.Histogram(
          this.elementRef.nativeElement,
        );
        break;
      case ChartType.LINE_CHART:
        this.chart = new google.visualization.LineChart(
          this.elementRef.nativeElement,
        );
        break;
      case ChartType.PIE_CHART:
        this.chart = new google.visualization.PieChart(
          this.elementRef.nativeElement,
        );
        break;
      case ChartType.SCATTER_CHART:
        this.chart = new google.visualization.ScatterChart(
          this.elementRef.nativeElement,
        );
        break;
      case ChartType.STEPPED_AREA_CHART:
        this.chart = new google.visualization.SteppedAreaChart(
          this.elementRef.nativeElement,
        );
        break;
      case ChartType.TABLE:
        this.chart = new google.visualization.Table(
          this.elementRef.nativeElement,
        );
        break;
      default:
        this.chart = undefined;
        break;
    }
  }

  initDataProvider() {
    const dataInfo = this.dataInfo();
    if (!dataInfo || !dataInfo.dataProvider) {
      return;
    }

    if (this.chart) {
      dataInfo.dataProvider.setChart(this.chart);
    }
    dataInfo.dataProvider.parseData(dataInfo.data);
    dataInfo.dataProvider.setFilters(dataInfo.filters || []);
    dataInfo.dataProvider.setUpdateEventListener(() => {
      this.draw();
      this.cdr.markForCheck();
    });
  }
}
