import {PlatformLocation} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {LOCAL_URL, TOOLS_API} from 'org_xprof/frontend/app/common/constants/constants';
import {of} from 'rxjs';

import {DATA_PLUGIN_PROFILE_TOOLS} from './mock_data';

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
}
