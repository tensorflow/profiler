import {PlatformLocation} from '@angular/common';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {CAPTURE_PROFILE_API, DATA_API, HOSTS_API, LOCAL_URL, TOOLS_API} from 'org_xprof/frontend/app/common/constants/constants';
import {CaptureProfileOptions, CaptureProfileResponse} from 'org_xprof/frontend/app/common/interfaces/capture_profile';
import {DataTable} from 'org_xprof/frontend/app/common/interfaces/data_table';
import {Observable, of} from 'rxjs';
import {delay} from 'rxjs/operators';

import * as mockData from './mock_data';

/** Delay time for milisecond for testing */
const DELAY_TIME_MS = 1000;

/** The data service class that calls API and return response. */
@Injectable()
export class DataService {
  isLocalDevelopment = false;

  constructor(
      private readonly httpClient: HttpClient, platformLocation: PlatformLocation) {
    this.isLocalDevelopment = platformLocation.pathname === LOCAL_URL;
  }

  captureProfile(options: CaptureProfileOptions):
      Observable<CaptureProfileResponse> {
    if (this.isLocalDevelopment) {
      return of({result: 'Done'});
    }
    const params =
        new HttpParams()
            .set('service_addr', options.serviceAddr)
            .set('is_tpu_name', options.isTpuName.toString())
            .set('duration', options.duration.toString())
            .set('num_retry', options.numRetry.toString())
            .set('worker_list', options.workerList);
    return this.httpClient.get(CAPTURE_PROFILE_API, {params});
  }

  getTools() {
    if (this.isLocalDevelopment) {
      return of(mockData.DATA_PLUGIN_PROFILE_TOOLS);
    }
    return this.httpClient.get(TOOLS_API);
  }

  getHosts(run: string, tag: string) {
    if (this.isLocalDevelopment) {
      return of(mockData.DATA_PLUGIN_PROFILE_HOSTS).pipe(delay(DELAY_TIME_MS));
    }
    const params = new HttpParams().set('run', run).set('tag', tag);
    return this.httpClient.get(HOSTS_API, {params});
  }

  getData(run: string, tag: string, host: string): Observable<DataTable> {
    if (this.isLocalDevelopment) {
      if (tag === 'overview_page' || tag === 'overview_page@') {
        return of(mockData.DATA_PLUGIN_PROFILE_OVERVIEW_PAGE_DATA)
            .pipe(delay(DELAY_TIME_MS));
      } else if (
          tag === 'input_pipeline_analyzer' ||
          tag === 'input_pipeline_analyzer@') {
        return of(mockData.DATA_PLUGIN_PROFILE_INPUT_PIPELINE_DATA)
            .pipe(delay(DELAY_TIME_MS));
      } else if (tag === 'tensorflow_stats') {
        return of(mockData.DATA_PLUGIN_PROFILE_TENSORFLOW_STATS_DATA)
            .pipe(delay(DELAY_TIME_MS));
      } else if (tag === 'memory_viewer') {
        return of(mockData.DATA_PLUGIN_PROFILE_MEMORY_VIEWER_DATA)
            .pipe(delay(DELAY_TIME_MS));
      } else if (tag === 'op_profile') {
        return of(mockData.DATA_PLUGIN_PROFILE_OP_PROFILE_DATA)
            .pipe(delay(DELAY_TIME_MS));
      } else if (tag === 'pod_viewer') {
        return of(mockData.DATA_PLUGIN_PROFILE_POD_VIEWER_DATA)
            .pipe(delay(DELAY_TIME_MS));
      } else if (tag === 'kernel_stats') {
        return of(mockData.DATA_PLUGIN_PROFILE_KERNEL_STATS_DATA)
            .pipe(delay(DELAY_TIME_MS));
      } else if (tag === 'memory_profile') {
        return of(mockData.DATA_PLUGIN_PROFILE_MEMORY_PROFILE_DATA)
            .pipe(delay(DELAY_TIME_MS));
      } else {
        return of([]).pipe(delay(DELAY_TIME_MS));
      }
    }
    const params =
        new HttpParams().set('run', run).set('tag', tag).set('host', host);
    return this.httpClient.get(DATA_API, {params}) as Observable<DataTable>;
  }

  exportDataAsCSV(run: string, tag: string, host: string) {
    if (tag !== 'kernel_stats' && tag !== 'tensorflow_stats') {
      return;
    }
    const params = new HttpParams()
                       .set('run', run)
                       .set('tag', tag)
                       .set('host', host)
                       .set('tqx', 'out:csv;');
    window.open(DATA_API + '?' + params.toString(), '_blank');
  }
}
