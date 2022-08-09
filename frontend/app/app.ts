import {Component, OnInit} from '@angular/core';
import {compareTagNames} from 'org_xprof/frontend/app/common/classes/sorting';
import {Tool} from 'org_xprof/frontend/app/common/interfaces/tool';
import {DataDispatcher} from 'org_xprof/frontend/app/services/data_dispatcher/data_dispatcher';
import {DataService} from 'org_xprof/frontend/app/services/data_service/data_service';

/** The root component. */
@Component({
  selector: 'app',
  templateUrl: './app.ng.html',
  styleUrls: ['./app.css'],
})
export class App implements OnInit {
  loading = true;
  comparing = false;
  dataFound = false;
  datasets: Tool[] = [];

  constructor(
      // tslint:disable-next-line:no-unused-variable declare to instantiate
      private readonly dataDispatcher: DataDispatcher,
      private readonly dataService: DataService) {
    document.addEventListener('tensorboard-reload', () => {
      if (!this.loading && !this.comparing) {
        this.compareDatasets();
      }
    });
  }

  private processTools(tools: {[key: string]: string[]}): Tool[] {
    const datasets: Tool[] = [];
    const keys = Object.keys(tools);
    const values = Object.values(tools);
    for (let i = 0; i < keys.length; i++) {
      datasets.push({name: keys[i], activeTools: values[i] || []});
    }
    datasets.sort((a, b) => -compareTagNames(a.name, b.name));
    return datasets;
  }

  ngOnInit() {
    this.dataService.getTools().subscribe(tools => {
      // TODO(b/241842487): update the datasets here to cache run to tools list,
      // intially populating tools list with 1st run
      // updating the datasets as user call other runs to get more tools list
      this.datasets =
          this.processTools((tools || {}) as {[key: string]: string[]});
      this.dataFound = this.datasets.length !== 0;
      this.loading = false;
    });
  }

  compareDatasets() {
    this.comparing = true;
    this.dataService.getTools().subscribe(tools => {
      const datasets: Tool[] =
          this.processTools((tools || {}) as {[key: string]: string[]});
      if (JSON.stringify(datasets) !== JSON.stringify(this.datasets)) {
        document.dispatchEvent(new Event('plugin-reload'));
      }
      this.comparing = false;
    });
  }
}
