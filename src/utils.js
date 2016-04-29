export const SCOPE_PREFIX = `cycle-scope-`;

export function isObservable(obj) {
  return obj && typeof(obj.subscribe) === "function";
}

export function isElement(obj) {
  if (typeof(HTMLElement) === "object") {
    return obj instanceof HTMLElement || obj instanceof DocumentFragment;
  }

  return obj && typeof(obj) === "object" && (obj.nodeType === 1 || obj.nodeType === 11) &&
    typeof(obj.nodeName) === `string`;
}
