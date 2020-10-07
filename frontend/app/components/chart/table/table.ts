import 'org_xprof/frontend/app/common/typing/google_visualization/google_visualization';
import {Component, ElementRef, HostListener, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';

/** A table view component. */
@Component({
  selector: 'table',
  templateUrl: './table.ng.html',
  styleUrls: ['./table.scss']
})
export class Table implements OnChanges, OnInit {
  @Input() dataView?: google.visualization.DataView;
  @Input() showRowNumber = false;
  @Input() page = 'disable';
  @Input() pageSize = 10;

  table?: google.visualization.Table;
  height = '150px';

  @ViewChild('table', {static: false}) tableRef!: ElementRef;

  ngOnInit() {
    this.loadGoogleChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.drawTable();
  }

  @HostListener('window:resize')
  onResize() {
    const tableElement = this.tableRef.nativeElement.querySelector('table');
    if (tableElement) {
      this.height = String(Number(tableElement.clientHeight) + 20) + 'px';
    }
  }

  drawTable() {
    if (!this.table || !this.dataView) {
      return;
    }

    const options: google.visualization.TableOptions = {
      allowHtml: true,
      alternatingRowStyle: false,
      showRowNumber: this.showRowNumber,
      page: this.page,
      pageSize: this.pageSize,
      cssClassNames: {
        'headerCell': 'google-chart-table-header-cell',
        'tableCell': 'google-chart-table-table-cell',
      },
    };

    this.table.draw(this.dataView, options);

    this.onResize();
  }

  loadGoogleChart() {
    if (!google || !google.charts) {
      setTimeout(() => {
        this.loadGoogleChart();
      }, 100);
    }

    google.charts.safeLoad({'packages': ['table']});
    google.charts.setOnLoadCallback(() => {
      this.table = new google.visualization.Table(this.tableRef.nativeElement);
      this.drawTable();
    });
  }
}
