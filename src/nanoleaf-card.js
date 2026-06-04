import { LitElement, html, css, svg } from 'lit';
import {
  validateConfig,
  parsePanelColors,
  resolveColor,
} from './helpers.js';

class NanoleafCard extends LitElement {
  static styles = css`
    :host { display: block; }
    ha-card { overflow: hidden; padding: 0; }
    svg { display: block; }
  `;

  setConfig(config) {
    validateConfig(config);
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    this.requestUpdate();
  }

  get _isOn() {
    return (
      this._hass?.states[this._config?.light_entity]?.state === 'on'
    );
  }

  render() {
    if (!this._hass || !this._config) return html``;
    const layoutState =
      this._hass.states[this._config.layout_sensor];
    const colorsState =
      this._hass.states[this._config.panel_colors_entity];
    return html`
      <ha-card>
        <div class="svg-wrapper">
          ${this._renderSVG(layoutState, colorsState)}
        </div>
      </ha-card>`;
  }

  _renderSVG(layoutState, colorsState) {
    const positionData =
      layoutState?.attributes?.positionData ?? [];
    const s =
      parseFloat(layoutState?.attributes?.sideLength) || 150;
    const panels = positionData.filter((p) => p.shapeType === 8);

    if (!panels.length) {
      return html`<div style="height:280px"></div>`;
    }

    const panelColors = parsePanelColors(colorsState?.state ?? '');
    const rad = s / 1.732;
    const k = 0.75;
    const padx = s / 1.5;
    const pady = s / 6;
    const xs = panels.map((p) => p.x);
    const ys = panels.map((p) => p.y);
    const minx = 0 - Math.max(...xs) - padx;
    const maxx = 0 - Math.min(...xs) + padx;
    const miny = Math.min(...ys) - pady;
    const maxy = Math.max(...ys) + pady;

    const polygons = panels.map((p) => {
      const hex =
        panelColors[String(p.panelId)] ?? '000000';
      const fill = resolveColor(hex, this._isOn);
      const pts = [
        `0,${-(rad * k)}`,
        `${-(s / 2) * k},${(rad / 2) * k}`,
        `${(s / 2) * k},${(rad / 2) * k}`,
      ].join(' ');
      return svg`
        <g
          data-panel-id=${p.panelId}
          transform="translate(${-p.x},${p.y})
                     rotate(${180 - p.o})"
        >
          <polygon
            points=${pts}
            fill=${fill}
            stroke=${fill}
            stroke-width="15"
            stroke-linejoin="round"
          />
        </g>`;
    });

    return html`
      <svg
        viewBox="${minx} ${miny} ${maxx - minx} ${maxy - miny}"
        style="width:100%;height:280px;pointer-events:none;"
      >
        ${polygons}
      </svg>`;
  }

  _callService(domain, service, data) {
    this._hass.callService(domain, service, data);
  }
}

customElements.define('nanoleaf-card', NanoleafCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'nanoleaf-card',
  name: 'Nanoleaf Card',
  description: 'Control panel for Nanoleaf light panels',
});
