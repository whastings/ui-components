import './styles.scss';
import { autobindMethods } from '@whastings/js_utils';
import { getViewportBounds, toDocumentBounds } from 'lib/utils';

const ARROW_BUFFER = 18;
const ENTRANCE_DELAY = 200;
const POSITION_OPPOSITES = {
  bottom: 'top',
  left: 'right',
  right: 'left',
  top: 'bottom'
};
const TRANSITION_TIME = 300;

export default class TooltipManager {
  constructor(el) {
    this.currentPosition = null;
    this.el = el;
    this.isTransitioning = false;
    this.revealTimeout = null;
    this.transitionQueue = [];

    this.createTooltip();
    this.listenForTriggers();
  }

  createTooltip() {
    let tooltip = this.tooltip = document.createElement('div');
    tooltip.classList.add('tooltip');
    document.body.insertBefore(tooltip, document.body.firstChild);
  }

  handleTriggerLeave(event) {
    let { target } = event;

    if (!target.hasAttribute('data-tooltip')) {
      return;
    }

    if (this.revealTimeout) {
      window.clearTimeout(this.revealTimeout);
      this.revealTimeout = null;
    } else {
      let transition = () =>
        window.requestAnimationFrame(() => this.hideTooltip());

      if (this.isTransitioning) {
        this.transitionQueue.push(transition);
      } else {
        this.isTransitioning = true;
        transition();
      }
    }
  }

  handleTriggerEnter(event) {
    let { target } = event;

    if (!target.hasAttribute('data-tooltip')) {
      return;
    }

    this.revealTimeout = window.setTimeout(() => {
      this.revealTimeout = null;
      let transition = () =>
        window.requestAnimationFrame(() => this.showTooltipFor(target));

      let { transitionQueue } = this;
      if (this.isTransitioning) {
        // If two transitions are in the queue, they're an open and close that
        // have yet to run and so should be skipped.
        if (transitionQueue.length === 2) {
          transitionQueue.splice(0, 2);
        }
        transitionQueue.push(transition);
      } else {
        this.isTransitioning = true;
        transition();
      }
    }, ENTRANCE_DELAY);
  }

  hideTooltip() {
    this.tooltip.classList.remove('visible');
    this.scheduleTransitionEnd();
  }

  listenForTriggers() {
    this.el.addEventListener('mouseover', this.handleTriggerEnter);
    this.el.addEventListener('focus', this.handleTriggerEnter, true);
    this.el.addEventListener('mouseout', this.handleTriggerLeave);
    this.el.addEventListener('blur', this.handleTriggerLeave, true);
  }

  scheduleTransitionEnd() {
    window.setTimeout(() => {
      if (this.transitionQueue.length) {
        this.transitionQueue.shift()();
      } else {
        this.isTransitioning = false;
      }
    }, TRANSITION_TIME);
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

    this.scheduleTransitionEnd();
  }
}

autobindMethods(TooltipManager, 'handleTriggerLeave', 'handleTriggerEnter');

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

  tooltipLeft = Math.round(tooltipLeft);
  tooltipTop = Math.round(tooltipTop);
  tooltip.style.transform = `translate(${tooltipLeft}px, ${tooltipTop}px)`;
  return true;
}
