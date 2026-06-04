import { LitElement, html, css } from 'lit';
import { validateConfig } from './helpers.js';

class NanoleafCard extends LitElement {
  setConfig(config) {
    validateConfig(config);
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    this.requestUpdate();
  }

  render() {
    if (!this._hass || !this._config) return html``;
    return html`<ha-card>nanoleaf-card ok</ha-card>`;
  }
}

customElements.define('nanoleaf-card', NanoleafCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'nanoleaf-card',
  name: 'Nanoleaf Card',
  description: 'Control panel for Nanoleaf light panels',
});
