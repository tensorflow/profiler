import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {DataRequestType} from 'org_xprof/frontend/app/common/constants/enums';
import {DataService} from 'org_xprof/frontend/app/services/data_service/data_service';
import {DataRequest} from 'org_xprof/frontend/app/store/state';
import {Observable} from 'rxjs';

import {DataDispatcherBase} from './data_dispatcher_base';

/** The data dispatcher class. */
@Injectable()
export class DataDispatcher extends DataDispatcherBase {
  params = {
    run: '',
    tag: '',
    host: '',
  };

  constructor(private readonly dataService: DataService, store: Store<{}>) {
    super(store);
  }

   clearData(dataRequest: DataRequest) {
    this.store.dispatch(this.getActions(dataRequest));
  }

   exportAsCsv(tool: string) {
    if (!!tool && tool === this.params.tag) {
      this.dataService.exportDataAsCSV(
          this.params.run, this.params.tag, this.params.host);
    }
  }

  // tslint:disable-next-line:no-any
   load(dataRequest: DataRequest): Observable<any> {
    const run = dataRequest.params.run || '';
    const tag = dataRequest.params.tag || '';
    const host = dataRequest.params.host || '';

    if (dataRequest.type > DataRequestType.DATA_REQUEST_BEGIN &&
        dataRequest.type < DataRequestType.DATA_REQUEST_END) {
      this.params.run = run;
      this.params.tag = tag;
      this.params.host = host;
    }

    return this.dataService.getData(run, tag, host);
  }

  // tslint:disable-next-line:no-any
   parseData(dataRequest: DataRequest, data: any) {
    if (dataRequest.type === DataRequestType.KERNEL_STATS) {
      data = (data || [{}])[0];
    }
    this.store.dispatch(this.getActions(dataRequest, data));
  }
}
