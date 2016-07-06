import ImageZoomer from './ImageZoomer';

export default function register() {
  let prototype = Object.create(HTMLElement.prototype);

  prototype.attachedCallback = function() {
    let image = this.querySelector('img');

    if (!image) {
      throw new Error('<image-zoomer> must contain an image');
    }
    this.zoomer = new ImageZoomer(image);
  };

  document.registerElement('image-zoomer', {prototype});
}
