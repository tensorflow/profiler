import {Component, EventEmitter, Input, Output,} from '@angular/core';
import {NavigationEvent} from 'org_xprof/frontend/app/common/interfaces/navigation_event';

/** A side navigation component. */
@Component({
  standalone: false,
  selector: 'memory-viewer-control',
  templateUrl: './memory_viewer_control.ng.html',
  styleUrls: ['./memory_viewer_control.scss'],
})
export class MemoryViewerControl {
  /** The hlo module list. */
  @Input() moduleList: string[] = [];

  /** The event when the controls are changed. */
  @Output() readonly changed = new EventEmitter<NavigationEvent>();

  selectedMemorySpaceColor = '0';

  get selectedModule(): string {
    return this.moduleList.length ? this.moduleList[0] : '';
  }

  emitUpdateEvent() {
    this.changed.emit({
      moduleName: this.selectedModule,
      memorySpaceColor: this.selectedMemorySpaceColor,
    });
  }
}
