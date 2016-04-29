import { dom } from "maquette";

import { isElement, isObservable } from "./utils";
import { isolateSink, isolateSource } from "./isolation";
import transposeVTree from "./transposeVTree";
import makeElementSelector from "./dom/makeElementSelector";
import makeEventsSelector from "./dom/makeEventsSelector";

function domSelectorParser(selectors) {
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
}

function checkDOMDriverInput(view$) {
  if (!isObservable(view$)) {
    throw new Error(
      "The DOM driver function expects as input an Observable of virtual DOM elements"
    );
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

    let projection;
    function updateProjection(vtree) {
      if (projection) {
        projection.update(vtree);
      } else {
        projection = dom.append(rootElement, vtree);
      }
    }

    const rootElement$ = view$
      .flatMapLatest(transposeVTree)
      .do(updateProjection)
      .map(({ domNode }) => domNode.parentNode) // Return the container element
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
