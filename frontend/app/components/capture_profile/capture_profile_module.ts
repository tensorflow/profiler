import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatLegacyButtonModule} from '@angular/material/button';
import {MatLegacyDialogModule} from '@angular/material/dialog';
import {MatLegacyProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatLegacySnackBarModule} from '@angular/material/snack-bar';

import {CaptureProfile} from './capture_profile';
import {CaptureProfileDialog} from './capture_profile_dialog/capture_profile_dialog';
import {CaptureProfileDialogModule} from './capture_profile_dialog/capture_profile_dialog_module';

/** A capture profile view module. */
@NgModule({
  declarations: [CaptureProfile],
  imports: [
    CommonModule,
    MatLegacyButtonModule,
    MatLegacyDialogModule,
    MatLegacyProgressSpinnerModule,
    CaptureProfileDialogModule,
    MatLegacySnackBarModule,
  ],
  exports: [CaptureProfile],
  entryComponents: [CaptureProfileDialog],
})
export class CaptureProfileModule {
}
