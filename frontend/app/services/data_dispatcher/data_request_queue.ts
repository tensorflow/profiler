import {DataRequestType} from 'org_xprof/frontend/app/common/constants/enums';
import {DataRequest} from 'org_xprof/frontend/app/store/state';

/** The data request queue class */
export class DataRequestQueue {
  private queue: DataRequest[] = [];

  private getRepresentativeType(dataRequest: DataRequest): DataRequestType {
    if (!dataRequest) {
      return DataRequestType.UNKNOWN;
    }

    if (dataRequest.type >= DataRequestType.DATA_REQUEST_BEGIN &&
        dataRequest.type <= DataRequestType.DIFF_DATA_REQUEST_END) {
      return dataRequest.type;
    }

    return DataRequestType.UNKNOWN;
  }

  private findIndexByType(dataRequest: DataRequest) {
    const type = this.getRepresentativeType(dataRequest);
    return this.queue.findIndex(
        dataRequestItem => dataRequestItem.type === type);
  }

  clear() {
    this.queue = [];
  }

  empty() {
    return this.queue.length === 0;
  }

  front(): DataRequest|null {
    return this.empty() ? null : this.queue[0];
  }

  enqueue(dataRequest: DataRequest) {
    if (this.includesType(dataRequest)) {
      return;
    }
    const type = this.getRepresentativeType(dataRequest);
    if (type === DataRequestType.UNKNOWN) {
      return;
    }
    this.queue.push({
      type,
      params: dataRequest.params,
    });
  }

  dequeue(dataRequest: DataRequest) {
    const index = this.findIndexByType(dataRequest);
    if (index === -1) {
      return;
    }
    this.queue.splice(index, 1);
  }

  includes(dataRequest: DataRequest) {
    const index = this.findIndexByType(dataRequest);
    if (index === -1) {
      return false;
    }
    const result = this.queue[index];
    if (!result) {
      return false;
    }
    const resultParamsEntries = Object.entries(result.params || {}).sort();
    const paramsEntries = Object.entries(dataRequest.params || {}).sort();
    return JSON.stringify(resultParamsEntries) ===
        JSON.stringify(paramsEntries);
  }

  includesType(dataRequest: DataRequest) {
    return this.findIndexByType(dataRequest) !== -1;
  }
}
