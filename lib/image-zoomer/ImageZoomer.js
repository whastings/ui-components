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

  activate() {
    this.zoomBox.classList.add('active');
    this.zoomWindow.classList.add('active');
    this.listenForMouseMove();
  }

  deactivate() {
    this.zoomBox.classList.remove('active');
    this.zoomWindow.classList.remove('active');
    this.listenForMouseEnter();
  }

  handleMouseMove(event) {
    if (this.isMoveScheduled) {
      return;
    }

    window.requestAnimationFrame(() => {
      // Can't listen for mouseleave on image because it fires inside zoom box.
      if (isWithinImage(this.imageBounds, event)) {
        this.updateUI(event.pageX, event.pageY);
      } else {
        this.deactivate();
      }
      this.isMoveScheduled = false;
    });
    this.isMoveScheduled = true;
  }

  listenForMouseEnter() {
    let { image } = this;
    body.removeEventListener('mousemove', this.handleMouseMove);
    image.addEventListener('mouseenter', this.activate);
    if (this._zoomBox) { // Don't create zoom box until it's needed.
      this._zoomBox.addEventListener('mouseenter', this.activate);
    }
  }

  listenForMouseMove() {
    let { image, zoomBox } = this;
    image.removeEventListener('mouseenter', this.activate);
    zoomBox.removeEventListener('mouseenter', this.activate);
    // Can't listen for mousemove on image because event won't fire when mouse leaves.
    body.addEventListener('mousemove', this.handleMouseMove);
  }

  moveZoomedImage(xPercent, yPercent) {
    let { zoomedImage } = this;
    let xOffset = Math.round(zoomedImage.clientWidth * xPercent) * -1;
    let yOffset = Math.round(zoomedImage.clientHeight * yPercent) * -1;

    zoomedImage.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
  }

  updateUI(mouseX, mouseY) {
    let { imageBounds, zoomBox, zoomBoxBounds } = this;
    let { x: xOffset, y: yOffset } = getZoomBoxOffset(mouseX, mouseY, zoomBoxBounds, imageBounds);
    zoomBox.style.transform = `translate(${xOffset}px, ${yOffset}px)`;

    this.moveZoomedImage(xOffset / imageBounds.width, yOffset / imageBounds.height);
  }
}

autobindMethods(ImageZoomer, 'activate', 'handleMouseMove');

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

  zoomBox.style.width = Math.round(image.clientWidth * widthPercentage) + 'px';
  zoomBox.style.height = Math.round(image.clientHeight * heightPercentage) + 'px';

  return zoomBox;
}

function createZoomWindow(image) {
  let zoomWindow = document.createElement('div');
  zoomWindow.classList.add('zoom-window');

  image.setAttribute('aria-hidden', 'true');
  zoomWindow.appendChild(image);
  return zoomWindow;
}

function getZoomBoxOffset(mouseX, mouseY, zoomBoxBounds, imageBounds) {
  let x = mouseX - (zoomBoxBounds.width / 2);
  let y = mouseY - (zoomBoxBounds.height / 2);

  x = containNum(x, imageBounds.left, imageBounds.right - zoomBoxBounds.width);
  y = containNum(y, imageBounds.top, imageBounds.bottom - zoomBoxBounds.height);

  x -= zoomBoxBounds.left;
  y -= zoomBoxBounds.top;

  return {x: Math.round(x), y: Math.round(y)};
}

function isWithinImage(imageBounds, event) {
  let { bottom, left, right, top } = imageBounds;
  let { pageX, pageY } = event;

  return pageX > left && pageX < right && pageY > top && pageY < bottom;
}
