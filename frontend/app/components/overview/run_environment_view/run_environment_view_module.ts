import {NgModule} from '@angular/core';
import {MatLegacyCardModule} from '@angular/material/legacy-card';

import {RunEnvironmentView} from './run_environment_view';

@NgModule({
  declarations: [RunEnvironmentView],
  imports: [MatLegacyCardModule],
  exports: [RunEnvironmentView]
})
export class RunEnvironmentViewModule {
}
