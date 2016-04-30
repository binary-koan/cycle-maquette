import makeEventsSelector from "./makeEventsSelector";
import { makeIsStrictlyInRootScope, topLevelSelector, descendantSelector } from "./selectionScopes";
import { isolateSource, isolateSink } from "../isolation";

function removeDuplicates(arr) {
  const newArray = [];
  arr.forEach((element) => {
    if (newArray.indexOf(element) === -1) {
      newArray.push(element);
    }
  });
  return newArray;
}

const getScope = namespace =>
  namespace.filter(c => c.indexOf(`.cycle-scope`) > -1);

function makeFindElements(namespace) {
  return function findElements(rootElement) {
    if (topLevelSelector(namespace) === ``) {
      return rootElement;
    }
    const slice = Array.prototype.slice;

    const scope = getScope(namespace);
    // Uses global selector && is isolated
    if (namespace.indexOf(`*`) > -1 && scope.length > 0) {
      // grab top-level boundary of scope
      const topNode = rootElement.querySelector(descendantSelector(scope));
      // grab all children
      const childNodes = topNode.getElementsByTagName(`*`);
      return removeDuplicates([topNode].concat(slice.call(childNodes)))
        .filter(makeIsStrictlyInRootScope(namespace));
    }

    return removeDuplicates(
        slice.call(rootElement.querySelectorAll(descendantSelector(namespace)))
        .concat(slice.call(rootElement.querySelectorAll(topLevelSelector(namespace))))
      ).filter(makeIsStrictlyInRootScope(namespace));
  };
}

export default function makeElementSelector(rootElement$) {
  return function elementSelector(selector) {
    if (typeof selector !== `string`) {
      throw new Error(`DOM driver's select() expects the argument to be a ` +
        `string as a CSS selector`);
    }

    const namespace = this.namespace;
    const trimmedSelector = selector.trim();
    const childNamespace = trimmedSelector === `:root` ?
      namespace :
      namespace.concat(trimmedSelector);

    return {
      observable: rootElement$.map(makeFindElements(childNamespace)),
      namespace: childNamespace,
      select: makeElementSelector(rootElement$),
      events: makeEventsSelector(rootElement$, childNamespace),
      isolateSource,
      isolateSink
    };
  };
}
