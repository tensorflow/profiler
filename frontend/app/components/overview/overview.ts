import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import {NavigationEvent} from 'org_xprof/frontend/app/common/interfaces/navigation_event';

/** An overview page component. */
@Component({
  selector: 'overview',
  templateUrl: './overview.ng.html',
  styleUrls: ['./overview.css']
})
export class Overview {
  title = 'Overview WIP';

  constructor(private readonly route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.update(params as NavigationEvent);
    });
  }

  update(event: NavigationEvent) {}
}
