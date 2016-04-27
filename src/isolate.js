import { SCOPE_PREFIX } from "./utils";

export function isolateSource(source$, scope) {
  return source$.select(`.${SCOPE_PREFIX}${scope}`);
}

export function isolateSink(sink$, scope) {
  return sink$.map(vTree => {
    if (vTree.vnodeSelector.indexOf(`${SCOPE_PREFIX}${scope}`) === -1) {
      vTree.vnodeSelector = `${vTree.vnodeSelector}.${SCOPE_PREFIX}${scope}`;
    }
    return vTree;
  });
}
