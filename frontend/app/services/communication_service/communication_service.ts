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
  @Output() readonly navigationChange = new EventEmitter();
  @Output() readonly navigationReady = new EventEmitter();
  @Output() readonly toolQueryParamsChange = new EventEmitter();

  // Trigger navigation in sidenav component
  onNavigate(navigationEvent: NavigationEvent) {
    this.navigationChange.emit(navigationEvent);
  }

  onNavigateReady() {
    this.navigationReady.emit({});
  }

  onToolQueryParamsChange(queryParams: ToolQueryParams) {
    this.toolQueryParamsChange.emit(queryParams);
  }
}
