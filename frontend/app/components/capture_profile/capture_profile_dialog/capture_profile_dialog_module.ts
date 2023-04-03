import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatLegacyButtonModule} from '@angular/material/button';
import {MatLegacyDialogModule} from '@angular/material/dialog';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatLegacyFormFieldModule} from '@angular/material/form-field';
import {MatLegacyInputModule} from '@angular/material/input';
import {MatLegacyRadioModule} from '@angular/material/radio';
import {MatLegacySelectModule} from '@angular/material/select';
import {MatTooltipModule} from '@angular/material/tooltip';
import {BrowserModule} from '@angular/platform-browser';

import {CaptureProfileDialog} from './capture_profile_dialog';

/** A capture profile dialog module. */
@NgModule({
  declarations: [CaptureProfileDialog],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    MatLegacyButtonModule,
    MatLegacyDialogModule,
    MatExpansionModule,
    MatLegacyFormFieldModule,
    MatLegacyInputModule,
    MatLegacyRadioModule,
    MatLegacySelectModule,
    MatTooltipModule,
  ],
  exports: [CaptureProfileDialog]
})
export class CaptureProfileDialogModule {
}
