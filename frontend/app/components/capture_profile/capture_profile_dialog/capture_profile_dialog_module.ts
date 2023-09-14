import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatButtonModule} from '@angular/material/button';
import {MatLegacyDialogModule} from '@angular/material/legacy-dialog';
import {MatLegacyFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule} from '@angular/material/legacy-input';
import {MatLegacyRadioModule} from '@angular/material/legacy-radio';
import {MatLegacySelectModule} from '@angular/material/legacy-select';
import {MatLegacyTooltipModule} from '@angular/material/legacy-tooltip';
import {BrowserModule} from '@angular/platform-browser';

import {CaptureProfileDialog} from './capture_profile_dialog';

/** A capture profile dialog module. */
@NgModule({
  declarations: [CaptureProfileDialog],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatLegacyDialogModule,
    MatExpansionModule,
    MatLegacyFormFieldModule,
    MatLegacyInputModule,
    MatLegacyRadioModule,
    MatLegacySelectModule,
    MatLegacyTooltipModule,
  ],
  exports: [CaptureProfileDialog]
})
export class CaptureProfileDialogModule {
}
