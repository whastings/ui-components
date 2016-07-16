import TooltipManager from './TooltipManager';

export default function register() {
  let prototype = Object.create(HTMLElement.prototype);

  prototype.attachedCallback = function() {
    this.manager = new TooltipManager(this);
  };

  document.registerElement('tooltip-manager', {prototype});
}
