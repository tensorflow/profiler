import {CommonModule} from '@angular/common';
import {MatOptionModule} from '@angular/material/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  OnChanges,
  output,
  SimpleChanges,
} from '@angular/core';
import {NavigationEvent} from 'org_xprof/frontend/app/common/interfaces/navigation_event';

/** A side navigation component. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
  ],
  selector: 'memory-viewer-control',
  templateUrl: './memory_viewer_control.ng.html',
  styleUrls: ['./memory_viewer_control.scss'],
})
export class MemoryViewerControl implements OnChanges {
  /** The hlo module list. */
  readonly moduleList = input<string[]>([]);

  /** The initially selected module. */
  readonly firstLoadSelectedModule = input('');

  /** The initially selected memory space color. */
  readonly firstLoadSelectedMemorySpaceColor = input('');

  /** The event when the controls are changed. */
  readonly changed = output<NavigationEvent>();

  selectedModule = '';
  selectedMemorySpaceColor = '';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['firstLoadSelectedModule']) {
      this.selectedModule = this.firstLoadSelectedModule();
    }
    if (changes['firstLoadSelectedMemorySpaceColor']) {
      this.selectedMemorySpaceColor = this.firstLoadSelectedMemorySpaceColor();
    }
  }

  emitUpdateEvent() {
    this.changed.emit({
      moduleName: this.selectedModule,
      memorySpaceColor: this.selectedMemorySpaceColor,
    });
  }
}
