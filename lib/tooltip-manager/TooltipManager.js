import './styles.scss';
import { autobindMethods } from '@whastings/js_utils';
import { toDocumentBounds } from 'lib/utils';

const MOUSE_OVER_TIME = 100;

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

  showTooltipFor(triggerEl) {
    let { tooltip } = this;
    let text = triggerEl.getAttribute('data-tooltip');
    let position = triggerEl.getAttribute('data-tooltip-position') || 'top';
    tooltip.textContent = text;
    positionTooltip(triggerEl, tooltip, position);
    tooltip.classList.add('visible');
    tooltip.classList.add(position);
  }
}

autobindMethods(TooltipManager, 'handleMouseOut', 'handleMouseOver');

function positionTooltip(triggerEl, tooltip) {
  let triggerBounds = toDocumentBounds(triggerEl.getBoundingClientRect());
  let { left, top } = triggerBounds;
  // Force synchronous layout for the sake of correct positioning.
  let tooltipHeight = tooltip.clientHeight;

  top = top - tooltipHeight - 16;
  left -= Math.round(tooltip.clientWidth / 2 - triggerBounds.width / 2);
  tooltip.style.transform = `translate(${left}px, ${top}px)`;
}
