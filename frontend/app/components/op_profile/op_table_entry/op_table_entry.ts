import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {Store} from '@ngrx/store';
import {type Node} from 'org_xprof/frontend/app/common/interfaces/op_profile.jsonpb_decls';
import * as utils from 'org_xprof/frontend/app/common/utils/utils';
import {updateSelectedOpNodeChainAction} from 'org_xprof/frontend/app/store/actions';

/** An op table entry view component. */
@Component({
  standalone: false,
  selector: 'op-table-entry',
  templateUrl: './op_table_entry.ng.html',
  styleUrls: ['./op_table_entry.scss']
})
export class OpTableEntry implements OnChanges {
  /** The depth of node. */
  @Input() level = 0;

  /** The main node. */
  @Input() node?: Node;

  /** The root node. */
  @Input() rootNode?: Node;

  /** The selected node. */
  @Input() selectedNode?: Node;

  /** The property to sort by waste time. */
  @Input() byWasted = false;

  /** The property to show top 90%. */
  @Input() showP90 = false;

  /** The number of children nodes to be shown. */
  @Input() childrenCount = 10;

  // Filters out nodes that don't have descendants that match the filter.
  @Input() searchFilterString = '';

  /** The event when the mouse enter or leave. */
  @Output() readonly hover = new EventEmitter<Node|null>();

  /** The event when the selection is changed. */
  @Output() readonly selected = new EventEmitter<Node>();

  // TODO(xprof): rename the variable to be more self-explanatory or add
  // docstring
  children: Node[] = [];
  expanded = false;
  barWidth = '';
  flameColor = '';
  name = '';
  offset = '';
  percent = '';
  provenance = '-';
  timeWasted = '';
  hbmFraction = '';
  flopsUtilization = '';
  hbmUtilization = '';
  hbmFlameColor = '';
  numLeftOut = 0;

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
    this.name = (this.node && this.node.name) ? this.node.name : '';
    this.offset = this.level.toString() + 'em';
    this.provenance =
        this.node?.xla?.provenance?.replace(/^.*(:|\/)/, '') || '-';
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
    const targetP90NodeRawTimePs = this.node.metrics.rawTime * 0.9;
    const targetCount = Math.min(this.childrenCount, this.node.children.length);
    for (let i = 0; i < targetCount; i++) {
      if (tot >= targetP90NodeRawTimePs) {
        return i;
      }
      const child = this.node.children[i];
      if (child && child.metrics && child.metrics.rawTime) {
        tot += child.metrics.rawTime;
      }
    }
    return this.childrenCount;
  }

  private matchesSearchFilter(node: Node): boolean {
    if (!node || !node.name || node.children?.length === 0) {
      return false;
    }
    if (this.searchFilterString.length === 0) {
      return true;
    }
    if (node.name &&
        node.name.toLowerCase().includes(this.searchFilterString)) {
      return true;
    }
    return (node.children ?? [])
        .some((child) => this.matchesSearchFilter(child));
  }

  private getChildren(): Node[] {
    if (!this.node || !this.node.children || !this.rootNode) {
      return [];
    }
    let children: Node[] =
        (this.node.children.slice())
            .filter(
                (child) => this.level !== 0 || this.matchesSearchFilter(child));
    if (this.byWasted && this.rootNode) {
      children.sort(
          (a, b) => {
            const timeWastedA = utils.timeWasted(a, this.rootNode!);
            const timeWastedB = utils.timeWasted(b, this.rootNode!);
            if (isNaN(timeWastedA)) {
              return 1;
            } else if (isNaN(timeWastedB)) {
              return -1;
            }
            return utils.timeWasted(b, this.rootNode!) -
              utils.timeWasted(a, this.rootNode!);
          });
    }
    const k = this.get90ChildrenIndex();

    children = this.level ? children.slice(0, k) : children;

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
