import Rx from "rx";
import { isObservable } from "./utils";

function transposeVTree(vtree) {
  if (!vtree) {
    return null;
  } else if (isObservable(vtree)) {
    return vtree.flatMapLatest(transposeVTree);
  } else if (vtree.text) {
    return Rx.Observable.just(vtree);
  } else if (Array.isArray(vtree.children) && vtree.children.length > 0) {
    return Rx.Observable.combineLatest(
      vtree.children.map(transposeVTree),
      (...children) => Object.assign({}, vtree, { children })
    );
  } else if (typeof vtree === `object`) {
    return Rx.Observable.just(vtree);
  }

  throw new Error(`Unhandled vTree Value`);
}

export { transposeVTree };
