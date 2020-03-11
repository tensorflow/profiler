import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatRadioModule} from '@angular/material/radio';
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
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
  ],
  exports: [CaptureProfileDialog]
})
export class CaptureProfileDialogModule {
}
