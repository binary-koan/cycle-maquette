import { dom } from "maquette";

import { domSelectorParser } from "./utils";
import { transposeVTree } from "./transposition";
import { isolateSink, isolateSource } from "./isolate";
import { makeElementSelector } from "./select";
import { makeEventsSelector } from "./events";

function checkDOMDriverInput(view$) {
  if (!view$ || typeof view$.subscribe !== "function") {
    throw new Error("The DOM driver function expects as input an " +
      "Observable of virtual DOM elements");
  }
}

function defaultOnErrorFn(msg) {
  console.error(msg);
}

const defaults = {
  onError: defaultOnErrorFn
};

function makeDOMDriver(container, {
  onError = defaultOnErrorFn
} = defaults) {
  const rootElement = domSelectorParser(container);

  if (typeof onError !== `function`) {
    throw new Error("You provided an 'onError' to makeDOMDriver but it was " +
      "not a function. It should be a callback function to handle errors.");
  }

  function DOMDriver(view$) {
    checkDOMDriverInput(view$);

    // Initialize the projection with a blank text node
    // (easier than doing it the first time the DOM is rendered)
    const projection = dom.append(rootElement, { vnodeSelector: "", text: "" });

    const rootElement$ = view$
      .flatMapLatest(transposeVTree)
      .do(projection.update)
      .map(({ domNode }) => domNode)
      .doOnError(onError)
      .replay(null, 1);

    const disposable = rootElement$.connect();

    return {
      observable: rootElement$,
      namespace: [],
      select: makeElementSelector(rootElement$),
      events: makeEventsSelector(rootElement$),
      dispose: () => disposable.dispose(),
      isolateSink,
      isolateSource
    };
  }

  return DOMDriver;
}

export { makeDOMDriver };
