import {NgModule} from '@angular/core';
import {MatCardModule} from '@angular/material/card';

import {EmptyPage} from './empty_page';

/** An empty page module. */
@NgModule(
    {declarations: [EmptyPage], imports: [MatCardModule], exports: [EmptyPage]})
export class EmptyPageModule {
}
