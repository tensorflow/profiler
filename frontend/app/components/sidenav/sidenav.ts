import {Component, EventEmitter, Input, Output} from '@angular/core';

import {DEFAULT_HOST} from 'org_xprof/frontend/app/common/constants/constants';
import {NavigationEvent} from 'org_xprof/frontend/app/common/interfaces/navigation_event';
import {Tool} from 'org_xprof/frontend/app/common/interfaces/tool';
import {DataService} from 'org_xprof/frontend/app/services/data_service/data_service';

/** A side navigation component. */
@Component({
  selector: 'sidenav',
  templateUrl: './sidenav.ng.html',
  styleUrls: ['./sidenav.scss']
})
export class SideNav {
  /** The tool datasets. */
  @Input()
  set datasets(tools: Tool[]|null) {
    if (tools && tools.length > 0) {
      this.tools = tools;
      this.runs = tools.map(tool => tool.name);
      this.selectedRun = tools[0].name;
      this.updateTags();
    }
  }

  /** Navigation Update Event */
  @Output() update = new EventEmitter<NavigationEvent>();

  private tools: Tool[] = [];

  captureButtonLabel = 'Capture Profile';
  runs: string[] = [];
  tags: string[] = [];
  hosts: string[] = [];
  selectedRun = '';
  selectedTag = '';
  selectedHost = '';

  constructor(private readonly dataService: DataService) {}

  updateTags() {
    const tool = this.tools.find(tool => tool.name === this.selectedRun);
    if (tool && tool.activeTools && tool.activeTools.length > 0) {
      this.tags = tool.activeTools;
      this.selectedTag = this.tags[0];
      this.updateHosts();
    } else {
      this.tags = [];
      this.selectedTag = '';
      this.hosts = [];
      this.selectedHost = '';
      this.emitUpdateEvent();
    }
  }

  updateHosts() {
    const run = this.selectedRun;
    const tag = this.selectedTag;
    this.hosts = [];
    this.selectedHost = '';
    this.dataService.getHosts(run, tag).subscribe(hosts => {
      hosts = hosts || [''];
      if (((hosts as string[])).length === 1 &&
          ((hosts as string[]))[0] === '') {
        (hosts as string[])[0] = DEFAULT_HOST;
      }
      if (run === this.selectedRun && tag === this.selectedTag) {
        this.hosts = hosts as string[];
        this.selectedHost = this.hosts[0];
        this.emitUpdateEvent();
      }
    });
  }

  emitUpdateEvent() {
    this.update.emit({
      run: this.selectedRun,
      tag: this.selectedTag,
      host: this.selectedHost === DEFAULT_HOST ? '' : this.selectedHost
    });
  }
}
