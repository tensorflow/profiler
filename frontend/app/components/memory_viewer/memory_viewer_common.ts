import {OnDestroy} from '@angular/core';
import {Store} from '@ngrx/store';
import {BufferAllocationInfo} from 'org_xprof/frontend/app/common/interfaces/buffer_allocation_info';
import {HloProtoOrNull} from 'org_xprof/frontend/app/common/interfaces/data_table';
import {HeapObject} from 'org_xprof/frontend/app/common/interfaces/heap_object';
import * as utils from 'org_xprof/frontend/app/common/utils/utils';
import {MemoryUsage} from 'org_xprof/frontend/app/components/memory_viewer/memory_usage/memory_usage';
import {setActiveHeapObjectAction} from 'org_xprof/frontend/app/store/actions';


/** A common class of memory viewer component. */
export class MemoryViewerCommon implements OnDestroy {
  moduleName: string = '';
  peakInfo?: BufferAllocationInfo;
  activeInfo?: BufferAllocationInfo;
  peakHeapSizeMiB: string = '';
  unpaddedPeakHeapSizeMiB: string = '';
  usage?: MemoryUsage;
  heapSizes?: number[];
  maxHeap?: HeapObject[];
  maxHeapBySize?: HeapObject[];
  selectedIndex: number = -1;
  selectedIndexBySize: number = -1;
  unpaddedHeapSizes?: number[];
  hasHeapSimulatorTrace = false;

  constructor(private readonly store: Store<{}>) {}

  ngOnDestroy() {
    this.dispatchActiveHeapObject();
  }

  private dispatchActiveHeapObject(heapObject: HeapObject|null = null) {
    this.store.dispatch(
        setActiveHeapObjectAction({activeHeapObject: heapObject}));
    if (heapObject) {
      this.activeInfo = {
        size: heapObject.sizeMiB || 0,
        alloc: this.getLogicalBufferSpan(heapObject.logicalBufferId || 0, 0),
        free: this.getLogicalBufferSpan(heapObject.logicalBufferId || 0, 1),
        color: utils.getChartItemColorByIndex(heapObject.color || 0),
      };
    } else {
      this.activeInfo = undefined;
      this.selectedIndex = -1;
      this.selectedIndexBySize = -1;
    }
  }

  private getLogicalBufferSpan(index: number, allocOrFree: number): number {
    if (this.usage && this.usage.logicalBufferSpans &&
        this.usage.logicalBufferSpans[index]) {
      return this.usage.logicalBufferSpans[index][allocOrFree] + 1;
    }
    return 0;
  }

  setSelectedHepObject(selectedIndex: number) {
    if (!this.usage) {
      return;
    }
    if (selectedIndex === -1) {
      this.dispatchActiveHeapObject();
    } else {
      this.dispatchActiveHeapObject(this.usage.maxHeap[selectedIndex]);
      this.selectedIndexBySize = this.usage.maxHeapToBySize[selectedIndex];
    }
  }

  setSelectedHepObjectBySize(selectedIndexBySize: number) {
    if (!this.usage) {
      return;
    }
    if (selectedIndexBySize === -1) {
      this.dispatchActiveHeapObject();
    } else {
      this.dispatchActiveHeapObject(
          this.usage.maxHeapBySize[selectedIndexBySize]);
      this.selectedIndex = this.usage.bySizeToMaxHeap[selectedIndexBySize];
    }
  }

  parseHloProto(data: HloProtoOrNull) {
    if (!data || !data.hloModule || !data.bufferAssignment) return;
    this.moduleName = data.hloModule.name || '';
    this.usage = new MemoryUsage(data);
    this.peakHeapSizeMiB =
        utils.bytesToMiB(this.usage.peakHeapSizeBytes).toFixed(2);
    this.unpaddedPeakHeapSizeMiB =
        utils.bytesToMiB(this.usage.unpaddedPeakHeapSizeBytes).toFixed(2);
    this.heapSizes = this.usage.heapSizes;
    this.unpaddedHeapSizes = this.usage.unpaddedHeapSizes;
    this.peakInfo = {
      size: utils.bytesToMiB(this.usage.peakHeapSizeBytes),
      alloc: this.usage.peakHeapSizePosition + 1,
      free: this.usage.peakHeapSizePosition + 2,
    };
    this.maxHeap = this.usage.maxHeap;
    this.maxHeapBySize = this.usage.maxHeapBySize;

    this.hasHeapSimulatorTrace = !!this.heapSizes && this.heapSizes.length > 0;
  }
}
