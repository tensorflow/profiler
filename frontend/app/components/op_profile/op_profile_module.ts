import {NgModule} from '@angular/core';
import {MatCardModule} from '@angular/material/card';

import {OpProfile} from './op_profile';

/** An op profile module. */
@NgModule(
    {declarations: [OpProfile], imports: [MatCardModule], exports: [OpProfile]})
export class OpProfileModule {
}
