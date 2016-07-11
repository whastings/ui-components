import 'site/styles/main.scss';
import registerImageZoomer from 'lib/image-zoomer';

if ('registerElement' in document) {
  registerCustomElements();
} else {
  let polyfillScript = document.createElement('script');
  polyfillScript.src = 'document-register-element.js';
  polyfillScript.onload = registerCustomElements;
  document.body.appendChild(polyfillScript);
}

function registerCustomElements() {
  [
    registerImageZoomer
  ].forEach((fn) => fn());
}
