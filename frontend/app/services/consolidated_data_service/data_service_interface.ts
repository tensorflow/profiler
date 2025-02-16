/**
 * @fileoverview Data service interface meant to replace and consolidate
 * 1P/3P data services in the xprof frontend.
 */

import {InjectionToken} from '@angular/core';
import {DataTable} from 'org_xprof/frontend/app/common/interfaces/data_table';
import {Observable} from 'rxjs';

/** The data service class that calls API and return response. */
export interface DataServiceInterface {
  getData(
      tool: string,
      run: string,
      host?: string,
      parameters?: Map<string, string>,
      ignoreError?: boolean,
      ): Observable<DataTable|null>;
}

/** Injection token for the data service interface. */
export const DataServiceInterfaceToken =
    new InjectionToken<DataServiceInterface>(
        'DataServiceInterface',
    );
