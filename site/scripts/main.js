import 'site/styles/main.scss';
import registerImageZoomer from 'lib/image-zoomer';
import registerTooltipManager from 'lib/tooltip-manager';

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
    registerImageZoomer,
    registerTooltipManager
  ].forEach((fn) => fn());
}
