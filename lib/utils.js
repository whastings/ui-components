export function getCachedProp(obj, propName, valueFn) {
  let cachedPropName = `_${propName}`;

  if (!obj.hasOwnProperty(cachedPropName)) {
    obj[cachedPropName] = valueFn.call(obj);
  }

  return obj[cachedPropName];
}

export function toDocumentBounds(bounds) {
  let { scrollX, scrollY } = window;

  return {
    bottom: bounds.bottom + scrollY,
    left: bounds.left + scrollX,
    right: bounds.right + scrollX,
    top: bounds.top + scrollY
  };
}
