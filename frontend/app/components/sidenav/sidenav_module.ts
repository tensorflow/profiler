import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatLegacyOptionModule} from '@angular/material/legacy-core';
import {MatLegacyFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacySelectModule} from '@angular/material/legacy-select';
import {CaptureProfileModule} from 'org_xprof/frontend/app/components/capture_profile/capture_profile_module';
import {BufferDetailsModule} from 'org_xprof/frontend/app/components/memory_viewer/buffer_details/buffer_details_module';
import {OpDetailsModule} from 'org_xprof/frontend/app/components/op_profile/op_details/op_details_module';
import {PodViewerDetailsModule} from 'org_xprof/frontend/app/components/pod_viewer/pod_viewer_details/pod_viewer_details_module';

import {SideNav} from './sidenav';

/** A side navigation module. */
@NgModule({
  declarations: [SideNav],
  imports: [
    CommonModule,
    MatLegacyFormFieldModule,
    MatLegacySelectModule,
    MatLegacyOptionModule,
    BufferDetailsModule,
    CaptureProfileModule,
    OpDetailsModule,
    PodViewerDetailsModule,
  ],
  exports: [SideNav]
})
export class SideNavModule {
}
