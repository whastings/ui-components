export function getCachedProp(obj, propName, valueFn) {
  let cachedPropName = `_${propName}`;

  if (!obj.hasOwnProperty(cachedPropName)) {
    obj[cachedPropName] = valueFn.call(obj);
  }

  return obj[cachedPropName];
}

export function toDocumentBounds(bounds) {
  let { scrollX, scrollY } = window;
  let { bottom, height, left, right, top, width } = bounds;

  return {
    bottom: bottom + scrollY,
    height,
    left: left + scrollX,
    right: right + scrollX,
    top: top + scrollY,
    width
  };
}
