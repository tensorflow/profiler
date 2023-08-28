import {NgModule} from '@angular/core';
import {ChartModule} from 'org_xprof/frontend/app/components/chart/chart';

import {DcnCollectiveStats} from './dcn_collective_stats';

/** A Dcn Collective Stats module. */
@NgModule({
  declarations: [DcnCollectiveStats],
  imports: [
    ChartModule,
  ],
  exports: [DcnCollectiveStats],
})
export class DcnCollectiveStatsModule {
}
