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

  get zoomBoxBounds() {
    return getCachedProp(
      this,
      'zoomBoxBounds',
      () => toDocumentBounds(this.zoomBox.getBoundingClientRect())
    );
  }

  activateZoomBox() {
    this.zoomBox.classList.add('active');
    this.listenForMouseMove();
  }

  deactivateZoomBox() {
    this.zoomBox.classList.remove('active');
    this.listenForMouseEnter();
  }

  handleMouseMove(event) {
    // Can't listen for mouseleave on image because it fires inside zoom box.
    if (!isWithinImage(this.imageBounds, event)) {
      this.deactivateZoomBox();
      return;
    }

    if (!this.isMoveScheduled) {
      this.isMoveScheduled = true;
      window.requestAnimationFrame(() => {
        this.moveZoomBox(event.pageX, event.pageY);
        this.isMoveScheduled = false;
      });
    }
  }

  listenForMouseEnter() {
    let { image } = this;
    body.removeEventListener('mousemove', this.handleMouseMove);
    image.addEventListener('mouseenter', this.activateZoomBox);
  }

  listenForMouseMove() {
    let { image } = this;
    image.removeEventListener('mouseenter', this.activateZoomBox);
    // Can't listen for mousemove on image because event won't fire when mouse leaves.
    body.addEventListener('mousemove', this.handleMouseMove);
  }

  moveZoomBox(x, y) {
    let { imageBounds, zoomBox, zoomBoxBounds } = this;

    x = x - (zoomBoxBounds.width / 2);
    y = y - (zoomBoxBounds.height / 2);
    x = containNum(x, imageBounds.left, imageBounds.right - zoomBoxBounds.width);
    y = containNum(y, imageBounds.top, imageBounds.bottom - zoomBoxBounds.height);

    let xOffset = x - zoomBoxBounds.left;
    let yOffset = y - zoomBoxBounds.top;

    zoomBox.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
  }
}

autobindMethods(ImageZoomer, 'activateZoomBox', 'handleMouseMove');

function containNum(num, lowerBound, upperBound) {
  if (num < lowerBound) {
    return lowerBound;
  }
  if (num > upperBound) {
    return upperBound;
  }
  return num;
}

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
