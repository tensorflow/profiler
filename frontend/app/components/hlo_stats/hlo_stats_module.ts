import {NgModule} from '@angular/core';
import {HloStats} from './hlo_stats';

/** @deprecated Import the standalone HloStats component directly instead. */
@NgModule({
  imports: [HloStats],
  exports: [HloStats],
})
export class HloStatsModule {}
