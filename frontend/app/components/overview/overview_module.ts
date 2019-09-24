import {NgModule} from '@angular/core';
import {MatCardModule} from '@angular/material/card';

import {Overview} from './overview';

/** An overview page module. */
@NgModule(
    {declarations: [Overview], imports: [MatCardModule], exports: [Overview]})
export class OverviewModule {
}
