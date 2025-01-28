/**
 * @fileoverview Data service interface meant to replace and consolidate
 * 1P/3P data services in the xprof frontend.
 */

import {PlatformLocation} from '@angular/common';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
// import {TOOL_PARAMS_TO_KEEP} from
// 'google3/perftools/accelerators/xprof/frontend/app/common/constants/constants';
import {CaptureProfileOptions, CaptureProfileResponse} from 'org_xprof/frontend/app/common/interfaces/capture_profile';
import {DataTable} from 'org_xprof/frontend/app/common/interfaces/data_table';
import {HostMetadata} from 'org_xprof/frontend/app/common/interfaces/hosts';
import {Observable, of} from 'rxjs';
import {delay} from 'rxjs/operators';
import {windowOpen} from 'safevalues/dom';

import * as mockData from './mock_interface_data';

/** Delay time for millisecond for testing */
const DELAY_TIME_MS = 1000;
import {API_PREFIX, CAPTURE_PROFILE_API, DATA_API, HOSTS_API, LOCAL_URL, PLUGIN_NAME, RUN_TOOLS_API, RUNS_API} from 'org_xprof/frontend/app/common/constants/constants';

/** The data service class that calls API and return response. */
@Injectable()
export class DataServiceInterface {
  searchParams?: URLSearchParams;
  dataParams?: HttpParams;
  isLocalOssDevelopment = false;
  pathPrefix = '';
  toolname = '';

  constructor(
      protected readonly httpClient: HttpClient,
      platformLocation: PlatformLocation) {
    this.isLocalOssDevelopment = platformLocation.pathname === LOCAL_URL;
    if (String(platformLocation.pathname).includes(API_PREFIX + PLUGIN_NAME)) {
      this.pathPrefix =
          String(platformLocation.pathname).split(API_PREFIX + PLUGIN_NAME)[0];
    }
    this.searchParams = new URLSearchParams(window.location.search);
  }

  // tslint:disable-next-line:no-any
  protected get<T>(
      url: string,
      // tslint:disable-next-line:no-any
      options: {[key: string]: any},
      notifyError = true,
      ): Observable<T|null> {
    return this.httpClient.get<T>(url, options);
  }

  getData(
      run: string, tool: string, host?: string,
      parameters?: Map<string, string>,
      ignoreError?: boolean): Observable<DataTable|null> {
    console.log('getData', run, tool, host, parameters, ignoreError);
    if (this.isLocalOssDevelopment) {
      if (tool.startsWith('overview_page')) {
        return of(mockData.DATA_PLUGIN_PROFILE_OVERVIEW_PAGE_DATA)
            .pipe(delay(DELAY_TIME_MS));
      } else if (tool.startsWith('input_pipeline_analyzer')) {
        return of(mockData.DATA_PLUGIN_PROFILE_INPUT_PIPELINE_DATA)
            .pipe(delay(DELAY_TIME_MS));
      } else if (tool.startsWith('tensorflow_stats')) {
        return of(mockData.DATA_PLUGIN_PROFILE_TENSORFLOW_STATS_DATA)
            .pipe(delay(DELAY_TIME_MS));
      } else if (tool.startsWith('memory_viewer')) {
        return of(mockData.DATA_PLUGIN_PROFILE_MEMORY_VIEWER_DATA)
            .pipe(delay(DELAY_TIME_MS));
      } else if (tool.startsWith('op_profile')) {
        return of(mockData.DATA_PLUGIN_PROFILE_OP_PROFILE_DATA)
            .pipe(delay(DELAY_TIME_MS));
      } else if (tool.startsWith('pod_viewer')) {
        return of(mockData.DATA_PLUGIN_PROFILE_POD_VIEWER_DATA)
            .pipe(delay(DELAY_TIME_MS));
      } else if (tool.startsWith('kernel_stats')) {
        return of(mockData.DATA_PLUGIN_PROFILE_KERNEL_STATS_DATA)
            .pipe(delay(DELAY_TIME_MS));
      } else if (tool.startsWith('memory_profile')) {
        console.log('tool: ', tool);
        return of(mockData.DATA_PLUGIN_PROFILE_MEMORY_PROFILE_DATA)
            .pipe(delay(DELAY_TIME_MS));
      } else if (tool.startsWith('tf_data_bottleneck_analysis')) {
        return of(mockData.DATA_PLUGIN_PROFILE_TF_DATA_BOTTLENECK_ANALYSIS_DATA)
            .pipe(delay(DELAY_TIME_MS));
      } else {
        return of([]).pipe(delay(DELAY_TIME_MS));
      }
    }
    this.setInitialHttpParams();
    this.dataParams = this.dataParams!.set('run', run).set('tool', tool);
    if (host) {
      this.dataParams = this.dataParams.set('host', host);
    }
    this.toolname = tool;
    return this.get(this.getDataPath(), this.getParams(), true) as
        Observable<DataTable>;
  }
  getHosts(run: string): Observable<HostMetadata[]> {
    if (this.isLocalOssDevelopment) {
      return of(mockData.DATA_PLUGIN_PROFILE_HOSTS).pipe(delay(DELAY_TIME_MS));
    }
    this.setInitialHttpParams();
    this.dataParams =
        this.dataParams!.set('run', run).set('tool', this.toolname);
    return this.get(this.getHostsPath(), this.getParams(), true) as
        Observable<HostMetadata[]>;
  }
  getTools(run?: string): Observable<string[]> {
    if (this.isLocalOssDevelopment) {
      return of(mockData.DATA_PLUGIN_PROFILE_RUN_TOOLS);
    }
    this.setInitialHttpParams();
    if (run && run !== '') {
      this.dataParams = this.dataParams!.set('run', run);
    }
    return this.get(this.getToolsPath(), this.getParams(), true) as
        Observable<string[]>;
  }
  getModuleList(run: string): Observable<string> {
    this.setInitialHttpParams();
    this.dataParams = this.dataParams!.set('run', run);
    return this.get(
               this.getDataPath(), {
                 'params': this.dataParams,
                 'responseType': 'text',
               },
               true) as Observable<string>;
  }

  // Helper functions
  // makeToolQuery(pathname: string, params: Map<string, string>): string {
  //   const toolParams = new URLSearchParams();
  //   const parts = pathname.split('/').filter((i) => i);
  //   if (parts.length === 0 || !TOOL_PARAMS_TO_KEEP[parts[0]]) return
  //   pathname; for (const allowedParam of TOOL_PARAMS_TO_KEEP[parts[0]]) {
  //     if (params.has(allowedParam)) {
  //       const val = params.get(allowedParam) || '';
  //       toolParams.set(allowedParam, val);
  //     }
  //   }
  //   return pathname + '?' + toolParams.toString();
  // }
  setInitialHttpParams() {
    this.dataParams = new HttpParams();
  }

  getDataPath(): string {
    return this.pathPrefix + DATA_API;
  }

  getHostsPath(): string {
    return this.pathPrefix + HOSTS_API;
  }

  getToolsPath(): string {
    return this.pathPrefix + RUN_TOOLS_API;
  }

  // tslint:disable-next-line:no-any
  getParams(): {[key: string]: any} {
    const params = this.dataParams;
    // tslint:disable-next-line:no-any
    return {params} as {[key: string]: any};
  }



  captureProfile(options: CaptureProfileOptions):
      Observable<CaptureProfileResponse> {
    if (this.isLocalOssDevelopment) {
      return of({result: 'Done'});
    }
    this.setInitialHttpParams();
    this.dataParams =
        this.dataParams!.set('service_addr', options.serviceAddr)
            .set('is_tpu_name', options.isTpuName.toString())
            .set('duration', options.duration.toString())
            .set('num_retry', options.numRetry.toString())
            .set('worker_list', options.workerList)
            .set('host_tracer_level', options.hostTracerLevel.toString())
            .set('device_tracer_level', options.deviceTracerLevel.toString())
            .set('python_tracer_level', options.pythonTracerLevel.toString())
            .set('delay', options.delay.toString());
    return this.get(
               this.pathPrefix + CAPTURE_PROFILE_API, this.getParams(), true) as
        Observable<CaptureProfileResponse>;
  }

  getRuns() {
    if (this.isLocalOssDevelopment) {
      return of(mockData.DATA_PLUGIN_PROFILE_RUNS);
    }
    this.setInitialHttpParams();
    return this.get(this.pathPrefix + RUNS_API, this.getParams(), true) as
        Observable<string[]>;
  }

  getRunTools(run: string) {
    if (this.isLocalOssDevelopment) {
      return of(mockData.DATA_PLUGIN_PROFILE_RUN_TOOLS);
    }
    this.setInitialHttpParams();
    this.dataParams = this.dataParams!.set('run', run);
    return this.get(this.pathPrefix + RUN_TOOLS_API, this.getParams(), true) as
        Observable<string[]>;
  }

  exportDataAsCSV(run: string, tool: string, host: string) {
    this.setInitialHttpParams();
    this.dataParams = this.dataParams!.set('run', run)
                          .set('tool', tool)
                          .set('host', host)
                          .set('tqx', 'out:csv;');
    windowOpen(
        window, this.pathPrefix + DATA_API + '?' + this.dataParams.toString(),
        '_blank');
  }
}
