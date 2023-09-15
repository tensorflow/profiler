import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatButtonModule} from '@angular/material/button';
import {MatLegacyDialogModule} from '@angular/material/legacy-dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatLegacyRadioModule} from '@angular/material/legacy-radio';
import {MatSelectModule} from '@angular/material/select';
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
    MatFormFieldModule,
    MatInputModule,
    MatLegacyRadioModule,
    MatSelectModule,
    MatLegacyTooltipModule,
  ],
  exports: [CaptureProfileDialog]
})
export class CaptureProfileDialogModule {
}
