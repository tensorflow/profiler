import {NgModule} from '@angular/core';
import {MatCardModule} from '@angular/material/card';

import {InferenceLatencyChart} from './inference_latency_chart';

@NgModule({
  declarations: [InferenceLatencyChart],
  imports: [MatCardModule],
  exports: [InferenceLatencyChart],
})
export class InferenceLatencyChartModule {}
