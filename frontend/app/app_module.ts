import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {EmptyPageModule} from 'org_xprof/frontend/app/components/empty_page/empty_page_module';
import {MainPageModule} from 'org_xprof/frontend/app/components/main_page/main_page_module';

import {App} from './app';

/** The root component module. */
@NgModule({
  declarations: [App],
  imports: [
    BrowserModule, HttpClientModule, EmptyPageModule, MainPageModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [App]
})
export class AppModule {
}
