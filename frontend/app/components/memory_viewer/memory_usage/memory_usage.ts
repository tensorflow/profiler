import * as proto from 'org_xprof/frontend/app/common/interfaces/hlo.jsonpb_decls';
import * as preprocessedProto from 'org_xprof/frontend/app/common/interfaces/memory_viewer_preprocess.jsonpb_decls';
import {HloProtoOrNull, MemoryViewerPreprocessResultOrNull} from 'org_xprof/frontend/app/common/interfaces/data_table';
import {HeapObject} from 'org_xprof/frontend/app/common/interfaces/heap_object';
import * as utils from 'org_xprof/frontend/app/common/utils/utils';
import {toNumber} from 'org_xprof/frontend/app/common/utils/utils';
import {BufferAllocation} from 'org_xprof/frontend/app/components/memory_viewer/xla/buffer_allocation';
import {HloInstruction} from 'org_xprof/frontend/app/components/memory_viewer/xla/hlo_instruction';
import {LogicalBuffer} from 'org_xprof/frontend/app/components/memory_viewer/xla/logical_buffer';
import {Shape} from 'org_xprof/frontend/app/components/memory_viewer/xla/shape';

interface MemoryUsageBytes {
  padded: number;
  unpadded: number;
}

/**
 * Provides calculation of memory usage from xla buffer assignment.
 * @final
 */
export class MemoryUsage {
  private readonly buffers: LogicalBuffer[];
  private readonly idToBuffer: {[key: number]: LogicalBuffer};
  private readonly idToBufferAllocation: {[key: number]: BufferAllocation};
  private readonly nameToHlo: {[key: string]: HloInstruction};
  private readonly idToHlo: {[key: number]: HloInstruction};
  private readonly unSeenLogicalBuffers: Set<number>;
  private readonly seenBufferAllocations: Set<number>;
  private nColor: number;
  private rest: number;
  private smallBufferCount: number;

  peakHeapSizeBytes: number;
  paddingOverhead: number;
  hloTempSizeBytes: number;
  hloTempFragmentation: number;
  totalArgumentSizeBytes: number;
  peakLogicalBuffers: number[];
  peakHeapSizePosition: number;
  indefiniteMemoryUsageBytes: MemoryUsageBytes;
  heapSizes: number[];
  unpaddedHeapSizes: number[];
  maxHeap: HeapObject[];
  maxHeapBySize: HeapObject[];
  maxHeapByPaddingSize: HeapObject[];
  bySizeToMaxHeap: number[];
  maxHeapToBySize: number[];
  byPaddingSizeToMaxHeap: number[];
  maxHeapToByPaddingSize: number[];
  logicalBufferSpans: {[key: number]: number[]};

  smallBufferSize: number;

  diagnostics: {errors: string[], warnings: string[], info: string[]};
  moduleName: string;
  timelineUrl: string;

  // Only one of hloProto or preprocess is valid to construct MemoryUsage.
  constructor(
      hloProto: HloProtoOrNull, preprocess: MemoryViewerPreprocessResultOrNull,
      memorySpaceColor: number) {
    this.buffers = [];
    this.idToBuffer = {};
    this.idToBufferAllocation = {};
    this.nameToHlo = {};
    this.idToHlo = {};
    this.unSeenLogicalBuffers = new Set();
    this.seenBufferAllocations = new Set();
    this.nColor = 0;
    this.rest = 0;
    this.smallBufferCount = 0;

    this.peakHeapSizeBytes = 0;
    this.paddingOverhead = 0;
    this.hloTempSizeBytes = 0;
    this.hloTempFragmentation = 0;
    this.totalArgumentSizeBytes = 0;
    this.peakLogicalBuffers = [];
    this.peakHeapSizePosition = 0;
    this.indefiniteMemoryUsageBytes = {padded: 0, unpadded: 0};
    this.heapSizes = [];
    this.unpaddedHeapSizes = [];
    this.maxHeap = [];
    this.maxHeapBySize = [];
    this.maxHeapByPaddingSize = [];
    this.bySizeToMaxHeap = [];
    this.maxHeapToBySize = [];
    this.byPaddingSizeToMaxHeap = [];
    this.maxHeapToByPaddingSize = [];
    this.logicalBufferSpans = {};
    this.smallBufferSize = 16 * 1024;
    this.diagnostics = {errors: [], warnings: [], info: []};
    this.moduleName = '';
    this.timelineUrl = '';

    // Both input sources (HLOProto and preprocessed data) are invalid.
    if (!hloProto && !preprocess) {
      this.diagnostics.errors.push(
          'We failed to fetch a valid input. The input is empty or too large.');
      return;
    }

    if (hloProto) {
      // Initialize memory viewer usage from HLOProto.
      if (!this.sanityCheckHloProto(hloProto)) {
        return;
      }
      this.initHloInstructions(hloProto.hloModule);
      this.initMemoryUsage(memorySpaceColor, hloProto.bufferAssignment);
      this.initMaxHeap();
    } else if (preprocess) {
      // Initialize memory viewer from preprocessed data.
      this.initMemoryUsageFromPrecomputed(preprocess);
    }
  }

  private getHlo(buffer: LogicalBuffer): HloInstruction|null {
    if (buffer.instructionName && buffer.instructionName !== '') {
      return this.nameToHlo[buffer.instructionName];
    } else {
      return this.idToHlo[buffer.id];
    }
  }

  /**
   * Initializes memory usage from precomputed results.
   */
  private initMemoryUsageFromPrecomputed(
      preprocess: preprocessedProto.PreprocessResult) {
    // Copy the fields from preprocessed result.
    this.moduleName = preprocess.moduleName || '';
    this.timelineUrl = preprocess.allocationTimeline || '';
    if (!this.timelineUrl.startsWith('/memory_viewer.json')) {
      this.timelineUrl = '';
    }
    this.peakHeapSizeBytes =
        (preprocess.totalBufferAllocationMib || 0) * 1024 * 1024;
    this.paddingOverhead = (preprocess.peakHeapMib || 0) * 1024 * 1024 -
        (preprocess.peakUnpaddedHeapMib || 0) * 1024 * 1024;
    this.totalArgumentSizeBytes =
        (preprocess.entryComputationParametersMib || 0) * 1024 * 1024;
    this.hloTempSizeBytes = this.peakHeapSizeBytes -
        (preprocess.indefiniteBufferAllocationMib || 0) * 1024 * 1024;
    const framenentationSizeBytes =
        this.peakHeapSizeBytes - (preprocess.peakHeapMib || 0) * 1024 * 1024;
    if (this.hloTempSizeBytes) {
      this.hloTempFragmentation =
          framenentationSizeBytes / this.hloTempSizeBytes;
    }

    this.peakHeapSizePosition = (preprocess.peakHeapSizePosition || 0);
    this.heapSizes = preprocess.heapSizes || [];
    this.unpaddedHeapSizes = preprocess.unpaddedHeapSizes || [];
    if (preprocess.logicalBufferSpans) {
      for (const [key, value] of Object.entries(
               preprocess.logicalBufferSpans)) {
        this.logicalBufferSpans[utils.toNumber(key)] =
            [value.start || 0, value.limit || 0];
      }
    }
    for (const heapObject of preprocess.maxHeap || []) {
      this.maxHeap.push({
        instructionName: heapObject.instructionName,
        shape: heapObject.shapeString,
        tfOpName: heapObject.tfOpName,
        sizeMiB: heapObject.logicalBufferSizeMib,
        unpaddedSizeMiB: heapObject.unpaddedShapeMib,
        color: this.nColor++,
        groupName: heapObject.groupName,
        opcode: heapObject.opCode,
        logicalBufferId: heapObject.logicalBufferId,
      });
    }
    this.createMaxHeapIndex();
  }

  /**
   * Do a sanity check of the given HLO proto.
   * Return false if there are errors that will fail the initialization of
   * memory viewer.
   */
  private sanityCheckHloProto(hloProto: proto.HloProto) {
    if (!hloProto.hloModule) {
      this.diagnostics.errors.push(
          'The HloProto does not contain a valid hlo module');
      return false;
    }

    if (!hloProto.bufferAssignment) {
      this.diagnostics.errors.push(
          'The HloProto does not contain a buffer assignment. ' +
          'Therefore, we don\'t know the memory usage.');
      return false;
    }

    if (!hloProto.bufferAssignment.heapSimulatorTraces ||
        !hloProto.bufferAssignment.heapSimulatorTraces.length) {
      this.diagnostics.warnings.push(
          'The HloProto does not contain a heap simulator trace.');
    }
    return true;
  }

  /**
   * Adds the logical buffer as an element in the maxHeap with constitutent
   * logical buffers.
   */
  private addHeapObject(buffer: LogicalBuffer, groupName: string) {
    if (buffer.size <= this.smallBufferSize) {
      this.rest += buffer.size;
      this.smallBufferCount++;
      return;
    }
    let shape = new Shape();
    let inst = new HloInstruction();
    if (buffer.instructionName) {
      inst = this.getHlo(buffer) || inst;
      if (inst && inst.shape) {
        shape = inst.shape.resolveShapeIndex(buffer.shapeIndex);
      }
    }
    const heapObject = this.newHeapObject(buffer, shape, inst, groupName);
    if (heapObject) {
      this.maxHeap.push(heapObject);
    }
  }

  /**
   * Finds the peak memory usage from the `HeapSimulatorTrace`.
   */
  private findPeakMemoryUsage(
      trace: proto.HeapSimulatorTrace|null, color: number) {
    const heapSizes: number[] = [];
    const unpaddedHeapSizes: number[] = [];
    let logicalBuffers: number[] = [];
    let peakLogicalBuffers: number[] = [];
    let heapSizeBytes = 0;
    let unpaddedHeapSizeBytes = 0;
    let peakHeapSizeBytes = 0;
    let unpaddedPeakHeapSizeBytes = 0;
    let peakHeapSizePosition = 0;

    if (trace) {
      for (const event of trace.events || []) {
        heapSizes.push(utils.bytesToMiB(heapSizeBytes));
        unpaddedHeapSizes.push(utils.bytesToMiB(unpaddedHeapSizeBytes));
        const eventId = utils.toNumber(event.bufferId);
        const buffer = this.idToBuffer[eventId];
        this.unSeenLogicalBuffers.delete(eventId);
        const alloc = this.idToBufferAllocation[eventId];
        if (alloc) {
          this.seenBufferAllocations.add(alloc.index);
        }
        let shape: Shape|null = null;
        const hlo = this.getHlo(buffer);
        if (hlo && hlo.shape) {
          shape = hlo.shape.resolveShapeIndex(buffer.shapeIndex);
        }

        switch (event.kind) {
          // Default to 'ALLOC' when event.kind is undefined. This is because
          // by default proto3 primitive fields with default values will be
          // omitted in JSON output.
          case undefined:
          case 'ALLOC':
          case 'SHARE_WITH':
            logicalBuffers.push(eventId);
            heapSizeBytes += buffer.size;
            if (shape) {
              unpaddedHeapSizeBytes += shape.unpaddedHeapSizeBytes();
            }
            this.logicalBufferSpans[eventId] = [heapSizes.length - 1, -1];
            if (heapSizeBytes > peakHeapSizeBytes) {
              peakHeapSizeBytes = heapSizeBytes;
              unpaddedPeakHeapSizeBytes = unpaddedHeapSizeBytes;
              peakHeapSizePosition = heapSizes.length - 1;
              peakLogicalBuffers = logicalBuffers.slice();
            }
            break;
          case 'FREE':
            logicalBuffers = logicalBuffers.filter(item => {
              return item !== eventId;
            });
            heapSizeBytes -= buffer.size;
            if (shape) {
              unpaddedHeapSizeBytes -= shape.unpaddedHeapSizeBytes();
            }
            if (!this.logicalBufferSpans[eventId]) {
              // The logical buffer is not allocated in this module.
              this.logicalBufferSpans[eventId] = [0, heapSizes.length - 1];
              console.warn(
                  event, ' is freed but has seen no allocation event.');
            } else {
              this.logicalBufferSpans[eventId][1] = heapSizes.length - 1;
            }
            if (heapSizeBytes < 0) {
              console.error('heap_size_bytes < 0');
            }
            break;
          default:
            console.log('ERROR: unknown heap event kind: ', event);
            break;
        }
      }
      heapSizes.push(utils.bytesToMiB(heapSizeBytes));
      unpaddedHeapSizes.push(utils.bytesToMiB(unpaddedHeapSizeBytes));
    }

    this.peakLogicalBuffers = peakLogicalBuffers;
    this.peakHeapSizePosition = peakHeapSizePosition;

    this.peakHeapSizeBytes = peakHeapSizeBytes;
    this.paddingOverhead = peakHeapSizeBytes - unpaddedPeakHeapSizeBytes;
    this.heapSizes = heapSizes;
    this.unpaddedHeapSizes = unpaddedHeapSizes;
  }

  private getHeapTraceByColorAndBufferAllocationIndex(
      color: number,
      traces?: proto.HeapSimulatorTrace[]): proto.HeapSimulatorTrace|null {
    if (!traces) {
      return null;
    }
    for (const trace of traces) {
      const index = trace.bufferAllocationIndex;
      if (!index || index === '0') continue;
      const buffer = this.idToBufferAllocation[utils.toNumber(index)];
      if (!buffer) continue;
      // Find the heap simulator trace that corresponds to the HLO temporaries
      // buffer allocation, where isThreadLocal, isEntryComputationParameter,
      // isConstant, and maybeLiveOut will all be false.
      if (buffer.color === color && !buffer.isThreadLocal &&
          !buffer.isEntryComputationParameter && !buffer.isConstant &&
          !buffer.maybeLiveOut) {
        return trace;
      }
    }
    return null;
  }

  private getHeapTraceByColorAndEvents(
      color: number,
      traces?: proto.HeapSimulatorTrace[]): proto.HeapSimulatorTrace|null {
    if (!traces) {
      return null;
    }
    let bestTrace: proto.HeapSimulatorTrace|null = null;
    let bestEventCount = 0;
    for (const trace of traces) {
      let eventCount = 0;
      for (const event of trace.events || []) {
        const buffer = this.idToBuffer[utils.toNumber(event.bufferId || '0')];
        if (!buffer) continue;
        if (buffer.color === color) {
          eventCount += 1;
        }
      }
      if (eventCount > bestEventCount) {
        bestTrace = trace;
        bestEventCount = eventCount;
      }
    }
    return bestTrace;
  }

  /**
   * From a list of heap simulator traces, identify the one that has the largest
   * number of memory events of <color>.
   */
  private getHeapTraceByColor(
      color: number,
      traces?: proto.HeapSimulatorTrace[]): proto.HeapSimulatorTrace|null {
    const trace =
        this.getHeapTraceByColorAndBufferAllocationIndex(color, traces);
    if (trace) return trace;
    return this.getHeapTraceByColorAndEvents(color, traces);
  }

  /**
   * Creates a logical buffer id to buffer allocation map from
   * `bufferAllocations`.
   */
  private initAllocations(bufferAllocations?: proto.BufferAllocationProto[]) {
    if (!bufferAllocations) {
      return;
    }
    for (const bufferAllocation of bufferAllocations) {
      const alloc = new BufferAllocation(bufferAllocation);
      for (const assigned of bufferAllocation.assigned || []) {
        this.idToBufferAllocation[utils.toNumber(
            assigned.logicalBufferId || '0')] = alloc;
      }
    }
  }

  /**
   * Creates a sorted buffer list and an id to buffer map from
   * `logicalBuffers`.
   * @private
   */
  private initBuffers(logicalBuffers?: proto.LogicalBufferProto[]) {
    if (!logicalBuffers) {
      return;
    }
    for (const logicalBuffer of logicalBuffers) {
      const buffer = new LogicalBuffer(logicalBuffer);
      this.buffers.push(buffer);
      this.idToBuffer[buffer.id] = buffer;
      this.unSeenLogicalBuffers.add(buffer.id);
    }
  }

  /**
   * Constructs a mapping from name to HLO instruction.
   */
  private initHloInstructions(hloModule?: proto.HloModuleProto) {
    if (!hloModule) {
      console.warn(
          'Missing hloModule, skipping unpadded allocation size analysis');
      return;
    }
    this.moduleName = hloModule.name || '';
    for (const comp of hloModule.computations || []) {
      for (const inst of comp.instructions || []) {
        if (inst.name) {
          this.nameToHlo[inst.name] = new HloInstruction(inst);
        }
        if (inst.id) {
          this.idToHlo[toNumber(inst.id)] = new HloInstruction(inst);
        }
      }
    }
  }

  /**
   * Create index for this.maxHeap so it can be selected by size, unpadded size
   * and etc.
   */
  private createMaxHeapIndex() {
    const indexedMaxHeap = this.maxHeap.map((e, i) => {
      return {ind: i, val: e};
    });
    // Sort max heap objects by size and create index.
    indexedMaxHeap.sort((a, b) => {
      const sizeA = a && a.val && a.val.sizeMiB ? a.val.sizeMiB : 0;
      const sizeB = b && b.val && b.val.sizeMiB ? b.val.sizeMiB : 0;
      return sizeB - sizeA;
    });
    this.maxHeapBySize = indexedMaxHeap.map(e => e.val);
    this.bySizeToMaxHeap = indexedMaxHeap.map(e => e.ind);
    this.maxHeapToBySize.length = this.maxHeap.length;
    for (let i = 0; i < this.bySizeToMaxHeap.length; i++) {
      this.maxHeapToBySize[this.bySizeToMaxHeap[i]] = i;
    }
    // Sort max heap objects by padding size and create index.
    indexedMaxHeap.sort((a, b) => {
      const paddingA = a && a.val && a.val.sizeMiB && a.val.unpaddedSizeMiB ?
          a.val.sizeMiB - a.val.unpaddedSizeMiB :
          0;
      const paddingB = b && b.val && b.val.sizeMiB && b.val.unpaddedSizeMiB ?
          b.val.sizeMiB - b.val.unpaddedSizeMiB :
          0;
      return paddingB - paddingA;
    });
    this.maxHeapByPaddingSize = indexedMaxHeap.map(e => e.val);
    this.byPaddingSizeToMaxHeap = indexedMaxHeap.map(e => e.ind);
    this.maxHeapToByPaddingSize.length = this.maxHeap.length;
    for (let i = 0; i < this.byPaddingSizeToMaxHeap.length; i++) {
      this.maxHeapToByPaddingSize[this.byPaddingSizeToMaxHeap[i]] = i;
    }
  }

  /**
   * Accumulate data for use in a stacked bar plot.
   * We accumulate it in "program order" -- the order in which it was placed
   * into the logical_buffers sequence above was program order, and we iterate
   * that order to create data points.
   */
  private initMaxHeap() {
    for (const id of this.peakLogicalBuffers) {
      const alloc = this.idToBufferAllocation[id];
      const groupName = alloc ? alloc.groupName : '';
      this.addHeapObject(this.idToBuffer[id], groupName);
    }
    if (this.rest !== 0) {
      const small = `${this.smallBufferCount} small buffers (<${
          this.smallBufferSize / 1024} KiB)`;
      this.maxHeap.push({
        instructionName: small,
        sizeMiB: utils.bytesToMiB(this.rest),
        color: this.nColor++,
        groupName: small,
      });
    }
    this.createMaxHeapIndex();
  }

  /**
   * Initializes memory usage of the module.
   */
  private initMemoryUsage(
      memorySpaceColor: number,
      bufferAssignment?: proto.BufferAssignmentProto) {
    if (!bufferAssignment) {
      console.warn('No buffer assignment info');
      return;
    }
    this.initBuffers(bufferAssignment.logicalBuffers);
    this.initAllocations(bufferAssignment.bufferAllocations);
    const trace = this.getHeapTraceByColor(
        memorySpaceColor, bufferAssignment.heapSimulatorTraces);
    if (!trace) {
      console.warn('Missing hbm heap simulator trace.');
    }
    this.findPeakMemoryUsage(trace, memorySpaceColor);
  }

  /**
   * Creates a heap object that is displayed in a plot in the memory
   * visualization.
   */
  private newHeapObject(
      buffer: LogicalBuffer, shape: Shape, inst: HloInstruction,
      groupName: string): HeapObject|null {
    if (!buffer) {
      return null;
    }
    const shapeIndex =
        buffer.shapeIndex.length ? ' {' + buffer.shapeIndex.join() + '}' : '';
    return {
      instructionName: buffer.instructionName + shapeIndex,
      logicalBufferId: buffer.id,
      unpaddedSizeMiB: utils.bytesToMiB(shape.unpaddedHeapSizeBytes()),
      tfOpName: inst.tfOpName,
      sourceInfo: inst.sourceInfo,
      opcode: inst.opcode,
      sizeMiB: utils.bytesToMiB(buffer.size),
      color: this.nColor++,
      shape: shape.humanStringWithLayout(),
      groupName,
    };
  }
}
