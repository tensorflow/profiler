import 'org_xprof/frontend/app/common/interfaces/window';

/**
 * A class for measuring page initial loading latency.
 * Each tool page may have its own definition of initial loading complete.
 */
export class Throbber {
  private active = false;
  private startLoadTime = 0;

  constructor(private readonly toolname: string) {
    this.setActive(false);
  }
  start() {
    if (this.active) return;
    this.startLoadTime = performance.now();
    this.setActive(true);
  }
  stop() {
    if (!this.active) return;
    this.setActive(false);
  }
  setActive(active: boolean) {
    this.active = active;
  }
}
