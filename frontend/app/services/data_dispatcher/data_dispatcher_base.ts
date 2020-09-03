import {Store} from '@ngrx/store';
import {setLoadingStateAction} from 'org_xprof/frontend/app/store/actions';
import {getDataRequest} from 'org_xprof/frontend/app/store/selectors';
import {DataRequest} from 'org_xprof/frontend/app/store/state';
import {Observable, of} from 'rxjs';

import {DataRequestQueue} from './data_request_queue';

/** The base class of data dispatcher. */
export class DataDispatcherBase {
  loadedQueue = new DataRequestQueue();
  loadingQueue = new DataRequestQueue();

  constructor(protected readonly store: Store<{}>) {
    this.store.select(getDataRequest).subscribe((dataRequest: DataRequest) => {
      this.updateQueue(dataRequest);
    });
  }

  checkAndRun() {
    if (this.loadingQueue.empty()) {
      this.store.dispatch(setLoadingStateAction({
        loadingState: {
          loading: false,
          message: '',
        }
      }));
    } else {
      setTimeout(() => {
        this.run();
      });
    }
  }

  clearData(dataRequest: DataRequest) {}

  // tslint:disable-next-line:no-any
  load(dataRequest: DataRequest): Observable<any> {
    return of();
  }

  // tslint:disable-next-line:no-any
  parseData(dataRequest: DataRequest, data: any) {}

  run() {
    if (this.loadingQueue.empty()) {
      this.checkAndRun();
      return;
    }
    const dataRequest = this.loadingQueue.front();
    if (!dataRequest || !dataRequest.params) {
      return;
    }

    this.store.dispatch(setLoadingStateAction({
      loadingState: {
        loading: true,
        message: dataRequest.loadingMessage || 'Loading data',
      }
    }));

    this.load(dataRequest)
        .subscribe(
            data => {
              if (!this.loadingQueue.includes(dataRequest)) {
                this.checkAndRun();
                return;
              }
              this.loadingQueue.dequeue(dataRequest);

              if (this.loadedQueue.includesType(dataRequest)) {
                this.loadedQueue.dequeue(dataRequest);
              }
              this.loadedQueue.enqueue(dataRequest);

              this.parseData(dataRequest, data);

              this.checkAndRun();
            },
            error => {
              this.loadingQueue.dequeue(dataRequest);

              this.checkAndRun();
            });
  }

  updateQueue(dataRequest: DataRequest) {
    if (this.loadedQueue.includes(dataRequest)) {
      return;
    }
    if (this.loadedQueue.includesType(dataRequest)) {
      this.loadedQueue.dequeue(dataRequest);
      this.clearData(dataRequest);
    }

    if (this.loadingQueue.includes(dataRequest)) {
      return;
    }
    if (this.loadingQueue.includesType(dataRequest)) {
      this.loadingQueue.dequeue(dataRequest);
    }
    this.loadingQueue.enqueue(dataRequest);
    this.checkAndRun();
  }
}
