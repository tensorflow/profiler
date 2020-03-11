import {Component, Input} from '@angular/core';
import {Store} from '@ngrx/store';

import {RecommendationResult} from 'org_xprof/frontend/app/common/interfaces/data_table';
import {addAnchorTag, convertKnownToolToAnchorTag} from 'org_xprof/frontend/app/common/utils/utils';
import {setCurrentToolStateAction} from 'org_xprof/frontend/app/store/actions';

@Component({
  selector: 'recommendation-result-view',
  templateUrl: './recommendation_result_view.ng.html',
  styleUrls: ['./recommendation_result_view.scss']
})
export class RecommendationResultView {
  /** The recommendation result data. */
  @Input()
  set recommendationResult(data: RecommendationResult|null) {
    data = data || {};
    data.p = data.p || {};

    this.statement = data.p.statement || '';
    this.allOtherStatement = data.p.all_other_statement || '';
    this.kernelLaunchStatement = data.p.kernel_launch_statement || '';
    this.precisionStatement = data.p.precision_statement || '';

    this.hostTips = [];
    this.deviceTips = [];
    this.documentationTips = [];
    this.faqTips = [];
    data.rows = data.rows || [];
    data.rows.forEach(row => {
      if (row.c && row.c[0] && row.c[0].v && row.c[1] && row.c[1].v) {
        switch (row.c[0].v) {
          case 'host':
            this.hostTips.push(convertKnownToolToAnchorTag(String(row.c[1].v)));
            break;
          case 'device':
            this.deviceTips.push(
                convertKnownToolToAnchorTag(String(row.c[1].v)));
            break;
          case 'doc':
            this.documentationTips.push(String(row.c[1].v));
            break;
          case 'faq':
            this.faqTips.push(String(row.c[1].v));
            break;
          default:
            break;
        }
      }
    });
    const bottleneck = data.p.bottleneck;
    if (bottleneck === 'device') {
      this.hostTips = [];
    }
    if (bottleneck === 'host') {
      this.deviceTips = [];
    }
  }

  title = 'Recommendation for Next Step';
  statement = '';
  allOtherStatement = '';
  kernelLaunchStatement = '';
  precisionStatement = '';
  deviceTips: string[] = [];
  documentationTips: string[] = [];
  faqTips: string[] = [];
  hostTips: string[] = [];

  constructor(private readonly store: Store<{}>) {}

  onTipsClick(event: Event) {
    if (!event || !event.target ||
        (event.target as HTMLElement).tagName !== 'A') {
      return;
    }
    const tool = (event.target as HTMLElement).innerText;
    if (convertKnownToolToAnchorTag(tool) === addAnchorTag(tool)) {
      this.store.dispatch(setCurrentToolStateAction({currentTool: tool}));
    }
  }
}
