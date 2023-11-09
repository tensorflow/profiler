import {AfterViewInit, Component, ElementRef, HostListener, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {MemoryProfileProto, MemoryProfileSnapshot} from 'org_xprof/frontend/app/common/interfaces/data_table';
import {bytesToGiBs, picoToMilli} from 'org_xprof/frontend/app/common/utils/utils';

const MAX_CHART_WIDTH = 1500;

/** A Memory Timeline Graph view component. */
@Component({
  selector: 'memory-timeline-graph',
  templateUrl: './memory_timeline_graph.ng.html',
  styleUrls: ['./memory_timeline_graph.scss']
})
export class MemoryTimelineGraph implements AfterViewInit, OnChanges {
  /** The memory profile data. */
  @Input() memoryProfileProto: MemoryProfileProto|null = null;

  /** The selected memory ID to show memory profile for. */
  @Input() memoryId = '';

  @ViewChild('chart', {static: false}) chartRef!: ElementRef;

  title = 'Memory Timeline Graph';
  height = 465;
  width = 0;
  chart: google.visualization.AreaChart|null = null;

  ngAfterViewInit() {
    this.loadGoogleChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    setTimeout(() => {
      this.width = 0;
      this.drawChart();
    }, 100);
  }

  @HostListener('window:resize')
  onResize() {
    this.drawChart();
  }

  drawChart() {
    if (!this.chartRef || !this.chart || this.memoryId === '' ||
        !this.memoryProfileProto ||
        !this.memoryProfileProto.memoryProfilePerAllocator) {
      return;
    }

    this.width =
        Math.min(MAX_CHART_WIDTH, this.chartRef.nativeElement.offsetWidth);

    let snapshots =
        this.memoryProfileProto.memoryProfilePerAllocator[this.memoryId]
            .memoryProfileSnapshots;
    // If version is set to 1, this means the backend is using the new snapshot
    // sampling algorithm, timeline data is stored in sampledTimelineSnapshots.
    if (this.memoryProfileProto.version === 1) {
      snapshots =
          this.memoryProfileProto.memoryProfilePerAllocator[this.memoryId]
              .sampledTimelineSnapshots;
    }

    if (!snapshots) return;
    snapshots.sort((a, b) => Number(a.timeOffsetPs) - Number(b.timeOffsetPs));

    // CPU allocator does not provide the free memory bytes stats, in this case,
    // do not display the free memory line in timeline graph.
    let hasFreeMemoryData = false;
    for (let i = 0; i < snapshots.length; i++) {
      const stats = snapshots[i].aggregationStats;
      if (stats && stats.freeMemoryBytes !== '0') {
        hasFreeMemoryData = true;
        break;
      }
    }

    const dataTable = new google.visualization.DataTable();
    dataTable.addColumn('number', 'timestamp(ps)');
    dataTable.addColumn('number', 'stack');
    dataTable.addColumn('number', 'heap');
    dataTable.addColumn({type: 'string', role: 'tooltip'});
    if (hasFreeMemoryData) {
      dataTable.addColumn('number', 'free');
    }
    dataTable.addColumn('number', 'fragmentation');

    for (let i = 0; i < snapshots.length; i++) {
      const stats = snapshots[i].aggregationStats;
      if (!stats || !snapshots[i].timeOffsetPs) {
        continue;
      }
      const row = [
        picoToMilli(snapshots[i].timeOffsetPs),
        bytesToGiBs(stats.stackReservedBytes),
        bytesToGiBs(stats.heapAllocatedBytes),
        this.getMetadataTooltip(snapshots[i])
      ];
      if (hasFreeMemoryData) {
        row.push(bytesToGiBs(stats.freeMemoryBytes));
      }
      row.push((stats.fragmentation || 0) * 100);
      dataTable.addRow(row);
    }


    const fragmentationProperty = {
      'targetAxisIndex': 1,  // Using string parameter to prevent renaming.
      type: 'line',
      lineDashStyle: [4, 4],
    };
    const lineProperty = {'targetAxisIndex': 0};
    const seriesWithFreeMemory = {
      0: lineProperty,
      1: lineProperty,
      2: lineProperty,
      3: fragmentationProperty,
    };
    const seriesWithoutFreeMemory = {
      0: lineProperty,
      1: lineProperty,
      2: fragmentationProperty,
    };


    const options = {
      curveType: 'none',
      chartArea: {left: 60, right: 60, width: '100%'},
      hAxis: {
        title: 'Timestamp (ms)',
        textStyle: {bold: true},
      },
      vAxes: {
        0: {
          title: 'Memory Usage (GiBs)',
          minValue: 0,
          textStyle: {bold: true},
        },
        1: {
          title: 'Fragmentation (%)',
          minValue: 0,
          maxValue: 100,
          textStyle: {bold: true},
        },
      },
      series: hasFreeMemoryData ? seriesWithFreeMemory :
                                  seriesWithoutFreeMemory,
      // tslint:disable-next-line:no-any
      legend: {position: 'top' as any},
      tooltip: {
        trigger: 'selection',
      },
      colors: ['red', 'orange', 'green'],
      height: this.height,
      isStacked: true,
      explorer: {
        actions: ['dragToZoom', 'rightClickToReset'],
        maxZoomIn: .001,
        maxZoomOut: 10,
      },
    };
    this.chart.draw(
        dataTable, options as google.visualization.AreaChartOptions);
    return dataTable;
  }

  getMetadataTooltip(snapshot: MemoryProfileSnapshot|undefined) {
    if (!snapshot) return '';
    const timestampMs = picoToMilli(snapshot.timeOffsetPs);
    const stats = snapshot.aggregationStats;
    const metadata = snapshot.activityMetadata;
    if (!stats || !metadata || !metadata.requestedBytes ||
        !metadata.allocationBytes || !metadata.memoryActivity) {
      return '';
    }
    let requestedSizeGib = bytesToGiBs(metadata.requestedBytes);
    let allocationSizeGib = bytesToGiBs(metadata.allocationBytes);
    if (metadata.memoryActivity === 'DEALLOCATION') {
      requestedSizeGib = -requestedSizeGib;
      allocationSizeGib = -allocationSizeGib;
    }
    const memInUseGib =
        bytesToGiBs(
            Number(stats.stackReservedBytes) + Number(stats.heapAllocatedBytes))
            .toFixed(4);
    let metadataTooltip = 'timestamp(ms): ' + timestampMs.toFixed(1);
    metadataTooltip += '\nevent: ' + metadata.memoryActivity.toLowerCase();
    if (Number(metadata.requestedBytes) > 0) {
      metadataTooltip +=
          '\nrequested_size(GiBs): ' + requestedSizeGib.toFixed(4);
    }
    metadataTooltip +=
        '\nallocation_size(GiBs): ' + allocationSizeGib.toFixed(4);
    if (metadata.tfOpName) {
      metadataTooltip += '\ntf_op: ' + metadata.tfOpName;
    }
    if (metadata.stepId) {
      metadataTooltip += '\nstep_id: ' + metadata.stepId;
    }
    if (metadata.regionType) {
      metadataTooltip += '\nregion_type: ' + metadata.regionType;
    }
    if (metadata.dataType && metadata.dataType !== 'INVALID') {
      metadataTooltip += '\ndata_type: ' + metadata.dataType;
    }
    if (metadata.tensorShape) {
      metadataTooltip += '\ntensor_shape: ' + metadata.tensorShape;
    }
    metadataTooltip += '\n\nmemory_in_use(GiBs): ' + memInUseGib;
    return metadataTooltip;
  }

  loadGoogleChart() {
    if (!google || !google.charts) {
      setTimeout(() => {
        this.loadGoogleChart();
      }, 100);
    }

    google.charts.safeLoad({'packages': ['corechart']});
    google.charts.setOnLoadCallback(() => {
      this.chart =
          new google.visualization.AreaChart(this.chartRef.nativeElement);
      this.drawChart();
    });
  }
}
