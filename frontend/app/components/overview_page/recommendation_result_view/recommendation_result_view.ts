import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {type RecommendationResult} from 'org_xprof/frontend/app/common/interfaces/data_table';
import {convertKnownToolToAnchorTag} from 'org_xprof/frontend/app/common/utils/utils';

import {StatementData, StatementInfo, TipInfo} from './recommendation_result_view_interfaces';


/** A recommendation result view component. */
@Component({
  standalone: false,
  selector: 'recommendation-result-view',
  templateUrl: './recommendation_result_view.ng.html',
  styleUrls: ['./recommendation_result_view.scss']
})
export class RecommendationResultView implements OnChanges {
  /** The recommendation result data. */
  @Input() recommendationResult?: RecommendationResult;
  /** The statement info guiding the statement prasing from the result. */
  @Input() statementInfo: StatementInfo[] = [];
  /** The variable indicating whether this is an inference. */
  @Input() isInference = false;
  /** The variable indicating whether this is an 3P build. */
  @Input() isOss = false;

  title = 'Recommendation for Next Step';
  statements: StatementData[] = [];
  tipInfoArray: TipInfo[] = [];

  ngOnChanges(changes: SimpleChanges) {
    this.parseStatements();
    this.parseTips();
  }

  getRecommendationResultProp(id: string, defaultValue = ''): string {
    const props =
        ((this.recommendationResult || {}).p || {}) as Record<string, string>;
    return props[id] || defaultValue;
  }

  parseStatements() {
    this.statements = [];
    if (this.isInference) {
      return;
    }

    this.statementInfo.forEach((info) => {
      const prop = this.getRecommendationResultProp(info.id);
      if (prop) {
        const statement: StatementData = {
          value: prop,
        };
        if (info.color) {
          statement.color = info.color;
        }
        this.statements.push(statement);
      }
    });
  }

  parseTips() {
    const tipInfoMap: {[tipType: string]: {title: string; tips: string[]}} = {};
    const rows = this.recommendationResult?.rows || [];
    if (rows.length === 0) {
      return;
    }
    rows.forEach((row: google.visualization.DataObjectRow) => {
      const tipType = String(row.c?.[0]?.v);
      const tipString = String(row.c?.[1]?.v);
      if (tipType && tipString) {
        const title = String(row.c?.[2]?.v);
        const queryParams = new URLSearchParams(window.parent.location.search);
        const run = queryParams.get('run') || '';
        const tip = this.isOss ? convertKnownToolToAnchorTag(tipString, run) :
                                 tipString;
        if (tipInfoMap[tipType]) {
          tipInfoMap[tipType].tips.push(tip);
        } else {
          tipInfoMap[tipType] = {title, tips: [tip]};
        }
      }
    });

    const inferenceTipStyle: {[key: string]: string} = {
      'color': 'navy',
      'font-weight': 'bolder',
    };
    this.tipInfoArray = Object.entries(tipInfoMap).map(([tipType, tipInfo]) => {
      const info: TipInfo = {
        tipType,
        title: tipInfo.title,
        tips: tipInfo.tips,
      };
      if (tipType === 'inference') {
        info.style = inferenceTipStyle;
      }
      return info;
    });

    // Filter out tips given bottleneck.
    const nonBottleneckTipTypes =
        this.getRecommendationResultProp('non_bottleneck_tip_types').split(',');
    if (nonBottleneckTipTypes.length > 0) {
      this.tipInfoArray = this.tipInfoArray.filter(
          (tipInfo) => !nonBottleneckTipTypes.includes(tipInfo.tipType));
    }
    // Order the recommendations by tip type.
    // - Keep and move inference tips to the top for inference run.
    // - Move doc tips to the bottom.
    const inferenceTips =
        this.tipInfoArray.filter((tipInfo) => tipInfo.tipType === 'inference');
    const docTips =
        this.tipInfoArray.filter((tipInfo) => tipInfo.tipType === 'doc');
    this.tipInfoArray = this.tipInfoArray.filter(
        (tipInfo) => !['inference', 'doc'].includes(tipInfo.tipType));
    this.tipInfoArray = [...this.tipInfoArray, ...docTips];
    if (this.isInference) {
      this.tipInfoArray = [...inferenceTips, ...this.tipInfoArray];
    }
  }
}
