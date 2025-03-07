/**
 * @fileoverview Data service interface meant to accommodate different implementations
 */

import {InjectionToken} from '@angular/core';
import {DataTable} from 'org_xprof/frontend/app/common/interfaces/data_table';
import {OpProfileData, OpProfileSummary} from 'org_xprof/frontend/app/components/op_profile/op_profile_data';
import {Observable} from 'rxjs';

/** The data service class that calls API and return response. */
export interface DataServiceV2Interface {
  getData(
      tool: string,
      sessionId: string,
      host?: string,
      parameters?: Map<string, string>,
      ignoreError?: boolean,
      ): Observable<DataTable|null>;

  // Returns a string of comma separated module names.
  getModuleList(sessionId: string): Observable<string>;

  getGraphViewerLink(sessionId: string, moduleName: string, opName: string):
      string;

  getOpProfileSummary(data: OpProfileData): OpProfileSummary[];
}

/** Injection token for the data service interface. */
export const DATA_SERVICE_INTERFACE_TOKEN =
    new InjectionToken<DataServiceV2Interface>(
        'DataServiceV2Interface',
    );
