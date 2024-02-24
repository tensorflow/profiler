import {PlatformLocation} from '@angular/common';
import {HttpParams} from '@angular/common/http';
import {Component, OnDestroy} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {API_PREFIX, DATA_API, PLUGIN_NAME} from 'org_xprof/frontend/app/common/constants/constants';
import {NavigationEvent} from 'org_xprof/frontend/app/common/interfaces/navigation_event';
import {CommunicationService} from 'org_xprof/frontend/app/services/communication_service/communication_service';
import {ReplaySubject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

/** A trace viewer component. */
@Component({
  selector: 'trace-viewer',
  templateUrl: './trace_viewer.ng.html',
  styleUrls: ['./trace_viewer.css']
})
export class TraceViewer implements OnDestroy {
  /** Handles on-destroy Subject, used to unsubscribe. */
  private readonly destroyed = new ReplaySubject<void>(1);

  url = '';
  pathPrefix = '';

  constructor(
      platformLocation: PlatformLocation,
      route: ActivatedRoute,
      private readonly communicationService: CommunicationService,
  ) {
    if (String(platformLocation.pathname).includes(API_PREFIX + PLUGIN_NAME)) {
      this.pathPrefix =
          String(platformLocation.pathname).split(API_PREFIX + PLUGIN_NAME)[0];
    }
    route.params.pipe(takeUntil(this.destroyed)).subscribe((params) => {
      this.update(params as NavigationEvent);
    });
    window.addEventListener('message', (event) => {
      const data = event.data;
      // Navigate to graph viewer upon receiving 'navigate-tv-gv' message
      if (data?.name === 'navigate-tv-gv') {
        const navigationData = data.data;
        const navigationEvent: NavigationEvent = {
          tag: 'graph_viewer',
          paramsOpName: navigationData['opName'],
        };
        if (navigationData['moduleName']) {
          navigationEvent.host = navigationData['moduleName'];
        }
        this.communicationService.onNavigate(navigationEvent);
      }
    });
  }

  update(event: NavigationEvent) {
    const isStreaming = (event.tag === 'trace_viewer@^');
    const params = new HttpParams()
                       .set('run', event.run!)
                       .set('tag', event.tag!)
                       .set('host', event.host!);
    const traceDataUrl = this.pathPrefix + DATA_API + '?' + params.toString();
    this.url = this.pathPrefix + API_PREFIX + PLUGIN_NAME +
        '/trace_viewer_index.html' +
        '?is_streaming=' + isStreaming.toString() + '&is_oss=true' +
        '&trace_data_url=' + encodeURIComponent(traceDataUrl);
  }

  ngOnDestroy() {
    // Unsubscribes all pending subscriptions.
    this.destroyed.next();
    this.destroyed.complete();
  }
}
