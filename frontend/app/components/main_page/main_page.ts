import {Component, Input} from '@angular/core';
import {Router} from '@angular/router';

import {NavigationEvent} from 'org_xprof/frontend/app/common/interfaces/navigation_event';
import {Tool} from 'org_xprof/frontend/app/common/interfaces/tool';

/** A main page component. */
@Component({
  selector: 'main-page',
  templateUrl: './main_page.ng.html',
  styleUrls: ['./main_page.scss']
})
export class MainPage {
  /** The tool datasets. */
  @Input() datasets: Tool[] = [];

  loading = true;

  constructor(private readonly router: Router) {}

  updateTool(event: NavigationEvent) {
    this.loading = false;
    this.router.navigate([event.tag || 'empty', event]);
  }
}
