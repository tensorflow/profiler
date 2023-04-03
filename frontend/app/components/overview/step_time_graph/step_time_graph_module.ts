import {NgModule} from '@angular/core';
import {MatLegacyCardModule} from '@angular/material/card';

import {StepTimeGraph} from './step_time_graph';

@NgModule({
  declarations: [
    StepTimeGraph
  ],
  imports: [
    MatLegacyCardModule
  ],
  exports: [StepTimeGraph]
})
export class StepTimeGraphModule { }
