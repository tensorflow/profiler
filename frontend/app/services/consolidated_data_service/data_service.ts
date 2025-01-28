import {PlatformLocation} from '@angular/common';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {API_PREFIX, DATA_API, LOCAL_URL, PLUGIN_NAME} from 'org_xprof/frontend/app/common/constants/constants';
import {DataTable} from 'org_xprof/frontend/app/common/interfaces/data_table';
import {DataServiceInterface} from 'org_xprof/frontend/app/services/consolidated_data_service/data_service_interface';
import {Observable, of} from 'rxjs';
import {delay} from 'rxjs/operators';

import * as mockData from './mock_interface_data';

/** Delay time for milisecond for testing */
const DELAY_TIME_MS = 1000;

/** The data service class that calls API and return response. */
@Injectable()
export class ConsolidatedDataService implements DataServiceInterface {
  isLocalDevelopment = false;
  pathPrefix = '';
  searchParams?: URLSearchParams;

  constructor(
      private readonly httpClient: HttpClient,
      platformLocation: PlatformLocation) {
    this.isLocalDevelopment = platformLocation.pathname === LOCAL_URL;
    if (String(platformLocation.pathname).includes(API_PREFIX + PLUGIN_NAME)) {
      this.pathPrefix =
          String(platformLocation.pathname).split(API_PREFIX + PLUGIN_NAME)[0];
    }
    this.searchParams = new URLSearchParams(window.location.search);
  }

  getData(
      tag: string, run: string, host: string,
      parameters: Map<string, string> = new Map()): Observable<DataTable|null> {
    if (this.isLocalDevelopment) {
      if (tag.startsWith('overview_page')) {
        return of(mockData.DATA_PLUGIN_PROFILE_OVERVIEW_PAGE_DATA)
            .pipe(delay(DELAY_TIME_MS));
      } else if (tag.startsWith('input_pipeline_analyzer')) {
        return of(mockData.DATA_PLUGIN_PROFILE_INPUT_PIPELINE_DATA)
            .pipe(delay(DELAY_TIME_MS));
      } else if (tag.startsWith('tensorflow_stats')) {
        return of(mockData.DATA_PLUGIN_PROFILE_TENSORFLOW_STATS_DATA)
            .pipe(delay(DELAY_TIME_MS));
      } else if (tag.startsWith('memory_viewer')) {
        return of(mockData.DATA_PLUGIN_PROFILE_MEMORY_VIEWER_DATA)
            .pipe(delay(DELAY_TIME_MS));
      } else if (tag.startsWith('op_profile')) {
        return of(mockData.DATA_PLUGIN_PROFILE_OP_PROFILE_DATA)
            .pipe(delay(DELAY_TIME_MS));
      } else if (tag.startsWith('pod_viewer')) {
        return of(mockData.DATA_PLUGIN_PROFILE_POD_VIEWER_DATA)
            .pipe(delay(DELAY_TIME_MS));
      } else if (tag.startsWith('kernel_stats')) {
        return of(mockData.DATA_PLUGIN_PROFILE_KERNEL_STATS_DATA)
            .pipe(delay(DELAY_TIME_MS));
      } else if (tag.startsWith('memory_profile')) {
        return of(mockData.DATA_PLUGIN_PROFILE_MEMORY_PROFILE_DATA)
            .pipe(delay(DELAY_TIME_MS));
      } else if (tag.startsWith('tf_data_bottleneck_analysis')) {
        return of(mockData.DATA_PLUGIN_PROFILE_TF_DATA_BOTTLENECK_ANALYSIS_DATA)
            .pipe(delay(DELAY_TIME_MS));
      } else {
        return of([]).pipe(delay(DELAY_TIME_MS));
      }
    }
    const params =
        new HttpParams().set('run', run).set('tag', tag).set('host', host);
    parameters.forEach((value, key) => {
      params.set(key, value);
    });
    return this.httpClient.get(this.pathPrefix + DATA_API, {params}) as
        Observable<DataTable>;
  }
}
