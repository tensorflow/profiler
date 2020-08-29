import 'org_xprof/frontend/app/common/interfaces/window';
import {Component} from '@angular/core';

/** An empty page component. */
@Component({
  selector: 'empty-page',
  templateUrl: './empty_page.ng.html',
  styleUrls: ['./empty_page.css']
})
export class EmptyPage {
  inColab = !!(window.parent.TENSORBOARD_ENV || {}).IN_COLAB;
}
