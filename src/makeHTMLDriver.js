import Rx from "rx";
import transposeVTree from "./transposeVTree";

const VOID_ELEMENTS = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "keygen",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
];

function makeBogusSelect() {
  return function select() {
    return {
      observable: Rx.Observable.empty(),
      events() {
        return Rx.Observable.empty();
      }
    };
  };
}

function truthyValuedKeys(object) {
  return Object.keys(object).filter(key => object[key]);
}

function makeHTMLDriver() {
  function tagNameFromSelector(selector) {
    const match = selector.match(/^[^#\.]+/);

    return match ? match[0] : "div";
  }

  function idFromSelector(selector) {
    const match = selector.match(/#[^#\.]+/g);

    return match && match[0];
  }

  function classListFromSelector(selector) {
    const match = selector.match(/\.[^#\.]+/g);

    return match ? match.map(part => part.slice(1)) : [];
  }

  function mergeProperties(id, classList, properties = {}) {
    const attrs = { id };
    let html;

    Object.keys(properties).forEach(propName => {
      const propValue = properties[propName];

      if (propName === "key" || propValue === null || propValue === undefined) {
        return;
      } else if (propName === "class") {
        propValue.split(" ").forEach(className => classList.push(className));
      } else if (propName === "classes") {
        // object with string keys and boolean values
        truthyValuedKeys(propValue).forEach(className => classList.push(className));
      } else if (propName === "styles") {
        // object with string keys and string (!) values
        attrs.style = Object.keys(propValue).map(name =>
          `${name}: ${propValue[name]};`
        );
      } else {
        if (typeof(propValue) === "function") {
          return;
        } else if (propName === "innerHTML") {
          html = propValue;
        } else {
          attrs[propName] = propValue;
        }
      }
    });

    attrs.class = classList.join(" ");

    return { attrs, html };
  }

  function vnodeToHTML(vnode) {
    const selector = vnode.vnodeSelector;

    if (selector === "") {
      return vnode.text;
    }

    const tagName = tagNameFromSelector(selector);
    let { attrs, html } = mergeProperties(
      idFromSelector(selector),
      classListFromSelector(selector),
      vnode.properties
    );

    if (!html) {
      html = vnode.children ?
        vnode.children.map(child => vnodeToHTML(child)).join("") :
        vnode.text;
    }

    attrs = Object.keys(attrs).filter(name => attrs[name])
      .map(attr => `${attr}="${attrs[attr]}"`).join(" ");

    if (attrs.length > 0) {
      attrs = ` ${attrs}`;
    }

    if (VOID_ELEMENTS.indexOf(tagName) >= 0) {
      return `<${tagName}${attrs} />`;
    }

    return `<${tagName}${attrs}>${html}</${tagName}>`;
  }

  return function htmlDriver(vtree$) {
    const output$ = vtree$.flatMapLatest(transposeVTree).last().map(vnodeToHTML);
    output$.select = makeBogusSelect();
    return output$;
  };
}

export { makeHTMLDriver };
