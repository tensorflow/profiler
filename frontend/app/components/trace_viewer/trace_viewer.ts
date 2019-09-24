import {HttpParams} from '@angular/common/http';
import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import {DATA_API, TRACE_VIEWER_URL} from 'org_xprof/frontend/app/common/constants/constants';
import {NavigationEvent} from 'org_xprof/frontend/app/common/interfaces/navigation_event';

/** A trace viewer component. */
@Component({
  selector: 'trace-viewer',
  templateUrl: './trace_viewer.ng.html',
  styleUrls: ['./trace_viewer.css']
})
export class TraceViewer {
  url = '';

  constructor(private readonly route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.update(params as NavigationEvent);
    });
  }

  update(event: NavigationEvent) {
    const params = new HttpParams()
                       .set('run', event.run)
                       .set('tag', event.tag)
                       .set('host', event.host);
    this.url = TRACE_VIEWER_URL +
        encodeURIComponent(DATA_API + '?' + params.toString());
  }
}
