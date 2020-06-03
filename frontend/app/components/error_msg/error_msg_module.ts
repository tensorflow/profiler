import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ErrorMsg} from './error_msg';

@NgModule({
  declarations: [ErrorMsg],
  imports: [CommonModule],
  exports: [ErrorMsg]
})
export class ErrorMsgModule {
}
