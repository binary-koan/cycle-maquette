import flatten from 'lodash.flatten'

function isNodeProperties(properties) {
  return properties && !Array.isArray(properties) &&
    typeof(properties) === 'object' && !properties.hasOwnProperty('vnodeSelector');
}

function resolveChildren(children) {
  return flatten(children).filter(Boolean).map(child =>
    typeof(child) === 'string' ? h("", child) : child
  );
}

function h(vnodeSelector, properties, ...children) {
  let text;

  if (typeof(vnodeSelector) !== 'string') {
    throw new Error('h() must be passed a string selector');
  }

  if (!isNodeProperties(properties)) {
    children.unshift(properties);
    properties = undefined;
  }

  if (children.length === 1 && typeof(children[0]) === 'string') {
    text = (children[0] === '') ? undefined : children[0];
    children = undefined;
  } else if (children.length > 0) {
    children = resolveChildren(children);
  }

  return { vnodeSelector, properties, children, text, domNode: null };
}

export default h
