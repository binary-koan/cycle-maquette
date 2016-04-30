function last(collection) {
  return collection[collection.length - 1];
}

function hasTagName(selector) {
  return selector && selector[0] &&
    selector[0] !== "#" && selector[0] !== "." && selector[0] !== ":";
}

export function makeIsStrictlyInRootScope(namespace) {
  const classIsForeign = (c) => {
    const matched = c.match(/cycle-scope-(\S+)/);
    return matched && namespace.indexOf(`.${c}`) === -1;
  };
  const classIsDomestic = (c) => {
    const matched = c.match(/cycle-scope-(\S+)/);
    return matched && namespace.indexOf(`.${c}`) !== -1;
  };
  return function isStrictlyInRootScope(leaf) {
    const some = Array.prototype.some;
    const split = String.prototype.split;
    for (let el = leaf; el; el = el.parentElement) {
      const classList = el.classList || split.call(el.className, ` `);
      if (some.call(classList, classIsDomestic)) {
        return true;
      }
      if (some.call(classList, classIsForeign)) {
        return false;
      }
    }
    return true;
  };
}

// The idea of this function is to create a selector matching the smallest possible DOM tree
// specified by `namespace`. For example, DOM.select("a").select(".test") should match "a.test"
// but DOM.select("p").select("a.test") should match "p a.test"
export function topLevelSelector(namespace) {
  const mergedNamespaces = [""];

  namespace.forEach(selector => {
    if (hasTagName(last(mergedNamespaces)) && hasTagName(selector)) {
      mergedNamespaces.push(selector);
    } else if (hasTagName(selector)) {
      mergedNamespaces.push(selector + mergedNamespaces.pop());
    } else {
      mergedNamespaces.push(mergedNamespaces.pop() + selector);
    }
  });

  return mergedNamespaces.join(" ");
}

export function descendantSelector(namespace) {
  return namespace.join(" ");
}
