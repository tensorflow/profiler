import {GVIZ_FOR_TESTING} from 'org_xprof/frontend/app/common/constants/testing';

/** Interface for injecting mock libraries into the window built-in object. */
declare interface WindowForTesting {
  google?: typeof GVIZ_FOR_TESTING;
}

/** Injects GVIZ_FOR_TESTING into the global window. */
export function injectMockGviz() {
  // Need to cast through unknown because the types do not overlap.
  const windowForTesting = window as unknown as WindowForTesting;
  windowForTesting.google = GVIZ_FOR_TESTING;
}
