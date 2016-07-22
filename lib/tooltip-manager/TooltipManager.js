import './styles.scss';
import { autobindMethods } from '@whastings/js_utils';
import { getViewportBounds, toDocumentBounds } from 'lib/utils';

const ARROW_BUFFER = 18;
const MOUSE_OVER_TIME = 100;
const POSITION_OPPOSITES = {
  bottom: 'top',
  left: 'right',
  right: 'left',
  top: 'bottom'
};

export default class TooltipManager {
  constructor(el) {
    this.el = el;
    this.revealTimeout = null;

    this.createTooltip();
    this.listenForTriggers();
  }

  createTooltip() {
    let tooltip = this.tooltip = document.createElement('div');
    tooltip.classList.add('tooltip');
    document.body.insertBefore(tooltip, document.body.firstChild);
  }

  handleMouseOut(event) {
    let { target } = event;
    if (target.hasAttribute('data-tooltip')) {
      if (this.revealTimeout) {
        window.clearTimeout(this.revealTimeout);
        this.revealTimeout = null;
      } else {
        window.requestAnimationFrame(() => this.hideTooltip());
      }
    }
  }

  handleMouseOver(event) {
    let { target } = event;
    if (target.hasAttribute('data-tooltip')) {
      this.revealTimeout = window.setTimeout(() => {
        this.revealTimeout = null;
        window.requestAnimationFrame(() => this.showTooltipFor(target));
      }, MOUSE_OVER_TIME);
    }
  }

  hideTooltip() {
    this.tooltip.classList.remove('visible');
  }

  listenForTriggers() {
    this.el.addEventListener('mouseover', this.handleMouseOver);
    this.el.addEventListener('mouseout', this.handleMouseOut);
  }

  setPosition(triggerEl) {
    let { tooltip } = this;

    if (this.currentPosition) {
      tooltip.classList.remove(this.currentPosition);
    }

    let position = triggerEl.getAttribute('data-tooltip-position') || 'top';
    let didPosition = positionTooltip(triggerEl, tooltip, position);
    if (!didPosition) {
      position = POSITION_OPPOSITES[position];
      positionTooltip(triggerEl, tooltip, position);
    }

    this.currentPosition = position;
    tooltip.classList.add(position);
  }

  showTooltipFor(triggerEl) {
    let { tooltip } = this;
    let text = triggerEl.getAttribute('data-tooltip');
    tooltip.textContent = text;
    this.setPosition(triggerEl);
    tooltip.classList.add('visible');
  }
}

autobindMethods(TooltipManager, 'handleMouseOut', 'handleMouseOver');

function calcHorizontalCenter(tooltipWidth, triggerBounds) {
  return triggerBounds.left - Math.round(tooltipWidth / 2 - triggerBounds.width / 2);
}

function calcVerticalCenter(tooltipHeight, triggerBounds) {
  return triggerBounds.top - Math.round(tooltipHeight / 2 - triggerBounds.height / 2);
}

function positionTooltip(triggerEl, tooltip, position) {
  let triggerBounds = toDocumentBounds(triggerEl.getBoundingClientRect());
  let viewportBounds = getViewportBounds();
  // Force synchronous layout for the sake of correct positioning.
  let tooltipHeight = tooltip.clientHeight;
  let tooltipWidth = tooltip.clientWidth;
  let tooltipTop;
  let tooltipLeft;
  let isInViewport;

  switch (position) {
    case 'top':
      tooltipTop = triggerBounds.top - tooltipHeight - ARROW_BUFFER;
      tooltipLeft = calcHorizontalCenter(tooltipWidth, triggerBounds);
      isInViewport = tooltipTop > viewportBounds.top;
      break;
    case 'bottom':
      tooltipTop = triggerBounds.bottom + ARROW_BUFFER;
      tooltipLeft = calcHorizontalCenter(tooltipWidth, triggerBounds);
      isInViewport = (tooltipTop + tooltipHeight) < viewportBounds.bottom;
      break;
    case 'left':
      tooltipLeft = triggerBounds.left - tooltipWidth - ARROW_BUFFER;
      tooltipTop = calcVerticalCenter(tooltipHeight, triggerBounds);
      isInViewport = tooltipLeft > viewportBounds.left;
      break;
    case 'right':
      tooltipLeft = triggerBounds.right + ARROW_BUFFER;
      tooltipTop = calcVerticalCenter(tooltipHeight, triggerBounds);
      isInViewport = (tooltipLeft + tooltipWidth) < viewportBounds.right;
      break;
  }

  if (!isInViewport) {
    return false;
  }

  tooltip.style.transform = `translate(${tooltipLeft}px, ${tooltipTop}px)`;
  return true;
}
