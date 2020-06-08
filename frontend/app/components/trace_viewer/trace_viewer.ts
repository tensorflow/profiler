import {PlatformLocation} from '@angular/common';
import {HttpParams} from '@angular/common/http';
import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {API_PREFIX, DATA_API, PLUGIN_NAME, TRACE_VIEWER_URL} from 'org_xprof/frontend/app/common/constants/constants';
import {NavigationEvent} from 'org_xprof/frontend/app/common/interfaces/navigation_event';

/** A trace viewer component. */
@Component({
  selector: 'trace-viewer',
  templateUrl: './trace_viewer.ng.html',
  styleUrls: ['./trace_viewer.css']
})
export class TraceViewer {
  url = '';
  pathPrefix = '';

  constructor(platformLocation: PlatformLocation, route: ActivatedRoute) {
    if (String(platformLocation.pathname).includes(API_PREFIX + PLUGIN_NAME)) {
      this.pathPrefix =
          String(platformLocation.pathname).split(API_PREFIX + PLUGIN_NAME)[0];
    }
    route.params.subscribe(params => {
      this.update(params as NavigationEvent);
    });
  }

  update(event: NavigationEvent) {
    const params = new HttpParams()
                       .set('run', event.run)
                       .set('tag', event.tag)
                       .set('host', event.host);
    this.url = this.pathPrefix + TRACE_VIEWER_URL +
        encodeURIComponent(
                   this.pathPrefix + DATA_API + '?' + params.toString());
  }
}
