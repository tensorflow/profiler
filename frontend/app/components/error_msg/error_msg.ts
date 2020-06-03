import {Component, Input} from '@angular/core';

/** An error message view component. */
@Component({
  selector: 'error-msg',
  templateUrl: './error_msg.ng.html',
  styleUrls: ['./error_msg.scss']
})
export class ErrorMsg {
  /** The error messages. */
  @Input() errors: string[] = [];

  /** The warning messages. */
  @Input() warnings: string[] = [];
}
