import {PlatformLocation} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {DataServiceInterface} from 'org_xprof/frontend/app/services/consolidated_data_service/data_service_interface';

/** The data service class that calls API and return response. */
@Injectable()
export class ConsolidatedDataService extends DataServiceInterface {
  constructor(httpClient: HttpClient, platformLocation: PlatformLocation) {
    super(httpClient, platformLocation);
  }
}
