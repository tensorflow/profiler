import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {Store} from '@ngrx/store';
import {Node} from 'org_xprof/frontend/app/common/interfaces/op_profile.jsonpb_decls';
import * as utils from 'org_xprof/frontend/app/common/utils/utils';
import {updateSelectedOpNodeChainAction} from 'org_xprof/frontend/app/store/actions';

/** An op table entry view component. */
@Component({
  selector: 'op-table-entry',
  templateUrl: './op_table_entry.ng.html',
  styleUrls: ['./op_table_entry.scss']
})
export class OpTableEntry implements OnChanges {
  /** The depth of node. */
  @Input() level: number = 0;

  /** The main node. */
  @Input() node?: Node;

  /** The root node. */
  @Input() rootNode?: Node;

  /** The selected node. */
  @Input() selectedNode?: Node;

  /** The property to sort by waste time. */
  @Input() byWasted: boolean = false;

  /** The property to show top 90%. */
  @Input() showP90: boolean = false;

  /** The number of children nodes to be shown. */
  @Input() childrenCount: number = 10;

  /** The event when the mouse enter or leave. */
  @Output() hover = new EventEmitter<Node|null>();

  /** The event when the selection is changed. */
  @Output() selected = new EventEmitter<Node>();

  children: Node[] = [];
  expanded: boolean = false;
  barWidth: string = '';
  flameColor: string = '';
  hideFlopsUtilization: boolean = false;
  name: string = '';
  offset: string = '';
  percent: string = '';
  provenance: string = '';
  timeWasted: string = '';
  hbmFraction = '';
  flopsUtilization: string = '';
  hbmUtilization: string = '';
  hbmFlameColor: string = '';
  numLeftOut: number = 0;

  constructor(private readonly store: Store<{}>) {}

  ngOnChanges(changes: SimpleChanges) {
    if (!this.node || !this.rootNode) {
      this.children = [];
      return;
    }

    if (this.level === 0) {
      this.expanded = true;
    }
    this.children = this.getChildren();
    this.numLeftOut = this.getLeftOut();
    if (!!this.node && !!this.rootNode && !!this.node.metrics) {
      this.percent =
          utils.percent(utils.timeFraction(this.node, this.rootNode));
      this.barWidth = this.percent;
    } else {
      this.barWidth = '0';
      this.percent = '';
    }
    this.flameColor = utils.flameColor(
        utils.flopsUtilization(this.node, this.rootNode), 0.7, 1, Math.sqrt);
    this.hideFlopsUtilization = !utils.hasFlopsUtilization(this.node);
    this.name = (this.node && this.node.name) ? this.node.name : '';
    this.offset = this.level.toString() + 'em';
    this.provenance = (this.node && this.node.xla && this.node.xla.provenance) ?
        this.node.xla.provenance.replace(/^.*(:|\/)/, '') :
        '';
    this.timeWasted = utils.percent(utils.timeWasted(this.node, this.rootNode));
    this.flopsUtilization =
        utils.percent(utils.flopsUtilization(this.node, this.rootNode));

    if (this.node?.metrics?.rawBytesAccessedArray &&
        this.rootNode?.metrics?.rawBytesAccessedArray) {
      const hbmType = utils.MemBwType.MEM_BW_TYPE_HBM_RW;
      const hbmFraction = this.node.metrics.rawBytesAccessedArray[hbmType] /
          this.rootNode.metrics.rawBytesAccessedArray[hbmType];
      this.hbmFraction = utils.percent(hbmFraction);
    }

    const hbmUtilization = utils.memoryBandwidthUtilization(
        this.node, utils.MemBwType.MEM_BW_TYPE_HBM_RW);
    this.hbmUtilization = utils.percent(hbmUtilization);
    this.hbmFlameColor = utils.bwColor(hbmUtilization);
  }

  private get90ChildrenIndex() {
    if (!this.showP90 || !this.node || !this.rootNode || !this.node.children ||
        this.node.children.length === 0 || !this.node.metrics ||
        !this.node.metrics.rawTime) {
      return this.childrenCount;
    }

    let tot = 0;
    const target90 = utils.timeFraction(this.node, this.rootNode) * 0.9;
    const targetCount = Math.min(this.childrenCount, this.node.children.length);
    for (let i = 0; i < targetCount; i++) {
      if (tot >= target90) {
        return i;
      }
      const child = this.node.children[i];
      if (child && child.metrics && child.metrics.rawTime) {
        tot += child.metrics.rawTime;
      }
    }
    return this.childrenCount;
  }

  private getChildren(): Node[] {
    if (!this.node || !this.node.children || !this.rootNode) {
      return [];
    }
    let children: Node[] = [];
    const k = this.get90ChildrenIndex();

    children = this.level ? this.node.children.slice(0, k) :
                            this.node.children.slice();
    if (this.byWasted && this.rootNode) {
      children.sort(
          (a, b) => utils.timeWasted(b, this.rootNode!) -
              utils.timeWasted(a, this.rootNode!));
    }

    return children;
  }

  private getLeftOut(): number {
    if (!this.level || !this.node || !this.node.numChildren) return 0;
    return this.node.numChildren -
        Math.min(this.childrenCount, this.children.length);
  }

  onSelect($event: Node) {
    this.selected.emit($event);
    this.store.dispatch(updateSelectedOpNodeChainAction({
      selectedOpNodeName: this.node?.name,
    }));
  }

  toggleExpanded() {
    this.expanded = !this.expanded;
    this.selected.emit(this.node);
  }
}
