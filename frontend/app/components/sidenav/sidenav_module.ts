import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatOptionModule} from '@angular/material/core';
import {MatDividerModule} from '@angular/material/divider';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';

import {SideNav} from './sidenav';

/** A side navigation module. */
@NgModule({
  declarations: [SideNav],
  imports: [
    CommonModule, MatButtonModule, MatDividerModule, MatFormFieldModule,
    MatSelectModule, MatOptionModule
  ],
  exports: [SideNav]
})
export class SideNavModule {
}
