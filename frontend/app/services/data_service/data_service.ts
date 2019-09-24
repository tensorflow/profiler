import {PlatformLocation} from '@angular/common';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {HOSTS_API, LOCAL_URL, TOOLS_API} from 'org_xprof/frontend/app/common/constants/constants';
import {of} from 'rxjs';
import {delay} from 'rxjs/operators';

import {DATA_PLUGIN_PROFILE_HOSTS, DATA_PLUGIN_PROFILE_TOOLS} from './mock_data';

/** Delay time for milisecond for testing */
const DEALY_TIME_MS = 1000;

/** The data service class that calls API and return response. */
@Injectable()
export class DataService {
  isLocalDevelopment = false;

  constructor(
      private readonly httpClient: HttpClient, platformLocation: PlatformLocation) {
    this.isLocalDevelopment =
        (platformLocation as any).location.pathname === LOCAL_URL;
  }

  getTools() {
    if (this.isLocalDevelopment) {
      return of(DATA_PLUGIN_PROFILE_TOOLS);
    }
    return this.httpClient.get(TOOLS_API);
  }

  getHosts(run: string, tag: string) {
    if (this.isLocalDevelopment) {
      return of(DATA_PLUGIN_PROFILE_HOSTS).pipe(delay(DEALY_TIME_MS));
    }
    const params = new HttpParams().set('run', run).set('tag', tag);
    return this.httpClient.get(HOSTS_API, {params});
  }
}
