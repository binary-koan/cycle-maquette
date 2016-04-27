const SCOPE_PREFIX = `cycle-scope-`;

function isElement(obj) {
  if (typeof(HTMLElement) === "object") {
    return obj instanceof HTMLElement || obj instanceof DocumentFragment;
  }

  return obj && typeof(obj) === "object" && (obj.nodeType === 1 || obj.nodeType === 11) &&
    typeof(obj.nodeName) === `string`;
}

const domSelectorParser =
  selectors => {
    const domElement =
      typeof(selectors) === "string" ?
        document.querySelector(selectors) :
        selectors;

    if (typeof(domElement) === "string" && domElement === null) {
      throw new Error(`Cannot render into unknown element \`${selectors}\``);
    } else if (!isElement(domElement)) {
      throw new Error("Given container is neither a DOM element nor a selector string.");
    }
    return domElement;
  };

export { domSelectorParser, SCOPE_PREFIX };
