import {Component, Input} from '@angular/core';
import {BlobDownloader} from 'google3/javascript/angular2/components/download/blob_downloader';
import {HeapObject} from 'org_xprof/frontend/app/common/interfaces/heap_object';
import {writer} from 'ts-csv';

/** A component to download hlo module in proto, text or json formats. */
@Component({
  selector: 'max-heap-chart-downloader',
  templateUrl: './max_heap_chart_downloader.ng.html',
  styleUrls: ['./max_heap_chart_downloader.css'],
  providers: [BlobDownloader],
})
export class MaxHeapChartDownloader {
  /** The module name. */
  @Input() moduleName: string = '';
  /** Type of the max heap chart. */
  @Input() chartType: string = '';
  /** Heap objects to download. */
  @Input() heapObjects: HeapObject[] = [];
  /** Timespan (alloc and free) for logical buffer. */
  @Input() logicalBufferSpans: {[key: number]: number[]} = {};
  /** Heap size sequence. */
  @Input() heapSizes: number[] = [];

  private readonly data: string[][] = [];
  sessionId = '';

  constructor(private readonly downloader: BlobDownloader) {}

  private getLogicalBufferSpan(index?: number): [number, number] {
    const bufferSpan: [number, number] = [0, 0];
    if (index) {
      const span = this.logicalBufferSpans[index];
      if (span) {
        bufferSpan[0] = span[0];
        bufferSpan[1] = span[1] < 0 ? this.heapSizes.length - 1 : span[1];
      } else {
        bufferSpan[1] = this.heapSizes.length - 1;
      }
    }
    return bufferSpan;
  }

  downloadMaxHeapChart() {
    const fileName = this.moduleName + '_' + this.chartType + '.csv';
    this.data.push([
      'InstructionName', 'UnpaddedSizeMiB', 'SizeMiB', 'AllocAt', 'FreeAt',
      'TfOpName', 'OpCode', 'Color', 'Shape'
    ]);
    for (const heapObject of this.heapObjects) {
      const span = this.getLogicalBufferSpan(heapObject.logicalBufferId);
      this.data.push([
        heapObject.instructionName || 'UNKNOWN',
        heapObject.unpaddedSizeMiB ? heapObject.unpaddedSizeMiB.toString() :
                                     'UNKNOWN',
        heapObject.sizeMiB ? heapObject.sizeMiB.toString() : 'UNKNOWN',
        span[0].toString(), span[1].toString(),
        heapObject.tfOpName || 'UNKNOWN', heapObject.opcode || 'UNKNOWN',
        heapObject.shape || 'UNKNOWN'
      ]);
    }
    this.downloader.downloadString(
        [...writer(this.data)].join(''), fileName, 'text/csv;charset=utf-8');
  }
}
