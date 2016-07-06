import './styles.scss';
import { autobindMethods } from '@whastings/js_utils';
import { getCachedProp, toDocumentBounds } from 'lib/utils';

const { body } = document;

export default class ImageZoomer {
  constructor(image) {
    let parentEl = image.parentNode;
    this.image = image;
    this.zoomedImage = image.cloneNode();

    let zoomContainer = this.zoomContainer = document.createElement('div');
    zoomContainer.classList.add('zoom-container');
    zoomContainer.appendChild(image);
    parentEl.appendChild(zoomContainer);

    this.zoomWindow = createZoomWindow(this.zoomedImage);
    parentEl.appendChild(this.zoomWindow);

    this.listenForMouseEnter();
  }

  get imageBounds() {
    return getCachedProp(
      this,
      'imageBounds',
      () => toDocumentBounds(this.image.getBoundingClientRect())
    );
  }

  get zoomBox() {
    return getCachedProp(this, 'zoomBox', () => {
      let zoomBox = createZoomBox(this.image, this.zoomWindow, this.zoomedImage);
      this.zoomContainer.appendChild(zoomBox);
      return zoomBox;
    });
  }

  activateZoomBox() {
    this.zoomBox.classList.add('active');
    this.listenForMouseMove();
  }

  deactivateZoomBox() {
    this.zoomBox.classList.remove('active');
    this.listenForMouseEnter();
  }

  listenForMouseEnter() {
    let { image } = this;
    body.removeEventListener('mousemove', this.moveZoomBox);
    image.addEventListener('mouseenter', this.activateZoomBox);
  }

  listenForMouseMove() {
    let { image } = this;
    image.removeEventListener('mouseenter', this.activateZoomBox);
    // Can't listen for mousemove on image because event won't fire when mouse leaves.
    body.addEventListener('mousemove', this.moveZoomBox);
  }

  moveZoomBox(event) {
    // Can't listen for mouseleave on image because it fires inside zoom box.
    if (!isWithinImage(this.imageBounds, event)) {
      this.deactivateZoomBox();
      return;
    }
  }
}

autobindMethods(ImageZoomer, 'activateZoomBox', 'moveZoomBox');

function createZoomBox(image, zoomWindow, zoomedImage) {
  let zoomBox = document.createElement('div');
  zoomBox.classList.add('zoom-box');

  let widthPercentage = zoomWindow.clientWidth / zoomedImage.clientWidth;
  let heightPercentage = zoomWindow.clientHeight / zoomedImage.clientHeight;

  zoomBox.style.width = Math.floor(image.clientWidth * widthPercentage) + 'px';
  zoomBox.style.height = Math.floor(image.clientHeight * heightPercentage) + 'px';

  return zoomBox;
}

function createZoomWindow(image) {
  let zoomWindow = document.createElement('div');
  zoomWindow.classList.add('zoom-window');

  image.setAttribute('aria-hidden', 'true');
  zoomWindow.appendChild(image);
  return zoomWindow;
}

function isWithinImage(imageBounds, event) {
  let { bottom, left, right, top } = imageBounds;
  let { pageX, pageY } = event;

  return pageX > left && pageX < right && pageY > top && pageY < bottom;
}
