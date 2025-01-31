import {Component} from '@angular/core';
import {Store} from '@ngrx/store';
import {DEFAULT_SIMPLE_DATA_TABLE} from 'org_xprof/frontend/app/common/interfaces/data_table';
import {addAnchorTag, convertKnownToolToAnchorTag} from 'org_xprof/frontend/app/common/utils/utils';
import {setCurrentToolStateAction} from 'org_xprof/frontend/app/store/actions';

import {RecommendationResultViewCommon} from './recommendation_result_view_common';

const STATEMENT_INFO = [
  {id: 'outside_compilation_statement_html'},
  {id: 'eager_statement_html'},
  {id: 'tf_function_statement_html'},
  {id: 'statement'},
  {id: 'device_collectives_statement'},
  {id: 'kernel_launch_statement'},
  {id: 'all_other_statement'},
  {id: 'precision_statement'},
];

/** A recommendation result view component. */
@Component({
  standalone: false,
  selector: 'recommendation-result-view',
  templateUrl: './recommendation_result_view.ng.html',
  styleUrls: ['./recommendation_result_view.scss']
})
export class RecommendationResultView extends RecommendationResultViewCommon {
  constructor(private readonly store: Store<{}>) {
    super();
  }

  getRecommendationResultProp(id: string, defaultValue: string = ''): string {
    const props = (this.recommendationResult || {}).p || {};
    return props[id] || defaultValue;
  }

  override parseStatements() {
    this.statements = [];
    STATEMENT_INFO.forEach(info => {
      const prop = this.getRecommendationResultProp(info.id);
      if (prop) {
        this.statements.push({value: prop});
      }
    });
  }

  override parseTips() {
    const data = this.recommendationResult || DEFAULT_SIMPLE_DATA_TABLE;
    const hostTips: string[] = [];
    const deviceTips: string[] = [];
    const documentationTips: string[] = [];
    const faqTips: string[] = [];
    data.rows = data.rows || [];
    data.rows.forEach(row => {
      if (row.c && row.c[0] && row.c[0].v && row.c[1] && row.c[1].v) {
        switch (row.c[0].v) {
          case 'host':
            hostTips.push(convertKnownToolToAnchorTag(String(row.c[1].v)));
            break;
          case 'device':
            deviceTips.push(convertKnownToolToAnchorTag(String(row.c[1].v)));
            break;
          case 'doc':
            documentationTips.push(String(row.c[1].v));
            break;
          case 'faq':
            faqTips.push(String(row.c[1].v));
            break;
          default:
            break;
        }
      }
    });
    const bottleneck = this.getRecommendationResultProp('bottleneck');
    if (bottleneck === 'device') {
      hostTips.length = 0;
    } else if (bottleneck === 'host') {
      deviceTips.length = 0;
    }

    const tipInfoArray = [
      {
        title: 'Tool troubleshooting / FAQ',
        tips: faqTips,
      },
      {
        title: 'Next tools to use for reducing the input time',
        tips: hostTips,
        useClickCallback: true,
      },
      {
        title: 'Next tools to use for reducing the Device time',
        tips: deviceTips,
        useClickCallback: true,
      },
      {
        title: 'Other useful resources',
        tips: documentationTips,
      },
    ];
    this.tipInfoArray = tipInfoArray.filter(tipInfo => tipInfo.tips.length > 0);
  }

  override onTipsClick(event: Event) {
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
