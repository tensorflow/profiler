import {Component, OnDestroy} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Store} from '@ngrx/store';
import {BufferAllocationInfo} from 'org_xprof/frontend/app/common/interfaces/buffer_allocation_info';
import {HloProtoOrNull} from 'org_xprof/frontend/app/common/interfaces/data_table';
import {HeapObject} from 'org_xprof/frontend/app/common/interfaces/heap_object';
import {NavigationEvent} from 'org_xprof/frontend/app/common/interfaces/navigation_event';
import * as utils from 'org_xprof/frontend/app/common/utils/utils';
import {MemoryUsage} from 'org_xprof/frontend/app/components/memory_viewer/memory_usage/memory_usage';
import {DataService} from 'org_xprof/frontend/app/services/data_service/data_service';
import {setActiveHeapObjectAction, setLoadingStateAction} from 'org_xprof/frontend/app/store/actions';

/** A memory viewer component. */
@Component({
  selector: 'memory-viewer',
  templateUrl: './memory_viewer.ng.html',
  styleUrls: ['./memory_viewer.scss']
})
export class MemoryViewer implements OnDestroy {
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

  constructor(
      route: ActivatedRoute,
      private readonly dataService: DataService,
      private readonly store: Store<{}>) {
    route.params.subscribe(params => {
      this.update(params as NavigationEvent);
    });
  }

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

  update(event: NavigationEvent) {
    this.store.dispatch(setLoadingStateAction({
      loadingState: {
        loading: true,
        message: 'Loading data',
      }
    }));

    this.dataService.getData(event.run || '', 'memory_viewer', event.host || '')
        .subscribe(data => {
          this.store.dispatch(setLoadingStateAction({
            loadingState: {
              loading: false,
              message: '',
            }
          }));

          data = data as HloProtoOrNull;
          if (data && data.hloModule && data.bufferAssignment) {
            this.moduleName = data.hloModule.name || '';
            this.usage = new MemoryUsage(data);
            this.peakHeapSizeMiB =
                utils.bytesToMiB(this.usage.peakHeapSizeBytes).toFixed(2);
            this.unpaddedPeakHeapSizeMiB =
                utils.bytesToMiB(this.usage.unpaddedPeakHeapSizeBytes)
                    .toFixed(2);
            this.heapSizes = this.usage.heapSizes;
            this.unpaddedHeapSizes = this.usage.unpaddedHeapSizes;
            this.peakInfo = {
              size: utils.bytesToMiB(this.usage.peakHeapSizeBytes),
              alloc: this.usage.peakHeapSizePosition + 1,
              free: this.usage.peakHeapSizePosition + 2,
            };
            this.maxHeap = this.usage.maxHeap;
            this.maxHeapBySize = this.usage.maxHeapBySize;

            this.hasHeapSimulatorTrace =
                !!this.heapSizes && this.heapSizes.length > 0;
          }
        });
  }
}
