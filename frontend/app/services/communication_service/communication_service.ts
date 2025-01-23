import {EventEmitter, Injectable, Output} from '@angular/core';
import {NavigationEvent} from 'org_xprof/frontend/app/common/interfaces/navigation_event';

/**
 * The query parameter object for route navigation excluding run, tag, host
 * for example, opName for Graph Viewer
 */
export type ToolQueryParams = NavigationEvent;

/**
 * (OSS) The communication service class that emits events across components
 * Provide the service dependency at the application root level for angular to
 * create a shared instance of this service - Needed for unit tests to run
 */
@Injectable({providedIn: 'root'})
export class CommunicationService {
  @Output() readonly navigationReady = new EventEmitter();
  @Output() readonly toolQueryParamsChange = new EventEmitter();

  // Show a navigating status when populating navigation chains
  // eg. tools for selected run
  onNavigateReady(navigationEvent: NavigationEvent) {
    this.navigationReady.emit(navigationEvent);
  }

  onToolQueryParamsChange(queryParams: ToolQueryParams) {
    this.toolQueryParamsChange.emit(queryParams);
  }
}
