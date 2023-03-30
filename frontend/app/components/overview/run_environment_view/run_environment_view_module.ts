import {NgModule} from '@angular/core';
import {MatLegacyCardModule} from '@angular/material/card';

import {RunEnvironmentView} from './run_environment_view';

@NgModule({
  declarations: [RunEnvironmentView],
  imports: [MatLegacyCardModule],
  exports: [RunEnvironmentView]
})
export class RunEnvironmentViewModule {
}
