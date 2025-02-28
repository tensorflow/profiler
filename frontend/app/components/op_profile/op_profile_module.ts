import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {OpDetailsModule} from 'org_xprof/frontend/app/components/op_profile/op_details/op_details_module';
import {OpProfileBaseModule} from 'org_xprof/frontend/app/components/op_profile/op_profile_base_module';

import {OpProfile} from './op_profile';

/** An op profile module. */
@NgModule({
  declarations: [OpProfile],
  imports: [
    OpDetailsModule,
    CommonModule,
    OpProfileBaseModule,
  ],
  exports: [OpProfile]
})
export class OpProfileModule {
}
