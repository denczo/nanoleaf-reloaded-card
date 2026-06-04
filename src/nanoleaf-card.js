import { LitElement, html, css, svg } from 'lit';
import {
  validateConfig,
  parsePanelColors,
  resolveColor,
  rgbToHs,
  hsToRgb,
  debounce,
} from './helpers.js';

const PATTERNS = ['solid', 'linear', 'radial', 'rainbow'];

class NanoleafCard extends LitElement {
  static styles = css`
    :host { display: block; }
    ha-card { overflow: hidden; padding: 0; }
    svg { display: block; }
    .svg-wrapper { position: relative; }
    .power-btn {
      position: absolute;
      top: 8px;
      right: 12px;
      z-index: 2;
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
    }
    .controls {
      background: rgba(255,255,255,0.05);
      border-radius: 12px;
      margin: 0 12px 12px;
      padding: 12px;
    }
    .color-row {
      display: flex;
      height: 150px;
      gap: 12px;
      align-items: stretch;
    }
    ha-color-picker { flex: none; }
    .right-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 0;
    }
    .pattern-row {
      display: flex;
      justify-content: space-between;
      padding-bottom: 10px;
    }
    .pattern-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px 0;
      font-size: 14px;
      color: var(--secondary-text-color);
    }
    .pattern-btn.active {
      color: var(--primary-color);
      font-weight: bold;
    }
    .slider-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 5px 0;
    }
    ha-icon.slider-icon {
      --mdc-icon-size: 20px;
      color: var(--secondary-text-color);
    }
    input[type='range'] {
      flex: 1;
      accent-color: var(--primary-color);
    }
  `;

  setConfig(config) {
    validateConfig(config);
    this._config = config;
    this._debouncedSetBrightness = debounce(
      (v) => this._setValue(this._config.brightness_entity, v),
      150
    );
    this._debouncedSetSpread = debounce(
      (v) => this._setValue(this._config.spread_entity, v),
      150
    );
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
    const patternState =
      this._hass.states[this._config.pattern_entity];
    const brightnessState =
      this._hass.states[this._config.brightness_entity];
    const spreadState =
      this._hass.states[this._config.spread_entity];
    const colorState =
      this._hass.states[this._config.color_entity];

    const activePattern = patternState?.state ?? '';
    const brigAttr = brightnessState?.attributes ?? {};
    const spreadAttr = spreadState?.attributes ?? {};

    const hs = rgbToHs(
      ...(colorState?.attributes?.rgb_color ?? [128, 128, 128])
    );

    return html`
      <ha-card>
        <div class="svg-wrapper">
          ${this._renderSVG(layoutState, colorsState)}
          <button
            class="power-btn"
            @click=${this._togglePower}
            title="Toggle power"
          >
            <ha-icon
              icon="mdi:power"
              style="color:${
                this._isOn
                  ? 'var(--primary-color)'
                  : 'var(--disabled-text-color)'
              }"
            ></ha-icon>
          </button>
        </div>
        <div class="controls">
          <div class="color-row">
            <ha-color-picker
              .desiredHsColor=${hs}
              @color-changed=${this._onColorChanged}
            ></ha-color-picker>
            <div class="right-col">
              <div class="pattern-row">
                ${PATTERNS.map(
                  (p) => html`
                    <button
                      class="pattern-btn ${
                        activePattern === p ? 'active' : ''
                      }"
                      @click=${() => this._selectPattern(p)}
                    >
                      ${p[0].toUpperCase() + p.slice(1)}
                    </button>`
                )}
              </div>
              <div class="slider-row">
                <ha-icon
                  class="slider-icon"
                  icon="mdi:brightness-6"
                ></ha-icon>
                <input
                  type="range"
                  min=${brigAttr.min ?? 0}
                  max=${brigAttr.max ?? 100}
                  step=${brigAttr.step ?? 1}
                  .value=${String(brightnessState?.state ?? 0)}
                  @input=${this._onBrightnessInput}
                />
              </div>
              <div class="slider-row">
                <ha-icon
                  class="slider-icon"
                  icon="mdi:arrow-expand-horizontal"
                ></ha-icon>
                <input
                  type="range"
                  min=${spreadAttr.min ?? 0}
                  max=${spreadAttr.max ?? 100}
                  step=${spreadAttr.step ?? 1}
                  .value=${String(spreadState?.state ?? 0)}
                  @input=${this._onSpreadInput}
                />
              </div>
            </div>
          </div>
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
      const hex = panelColors[String(p.panelId)] ?? '000000';
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

  _togglePower() {
    this._callService('light', 'toggle', {
      entity_id: this._config.light_entity,
    });
  }

  _onColorChanged(e) {
    const { h, s } = e.detail.color;
    const rgb = hsToRgb(h, s);
    this._callService('light', 'turn_on', {
      entity_id: this._config.color_entity,
      rgb_color: rgb,
    });
  }

  _selectPattern(pattern) {
    this._callService('input_select', 'select_option', {
      entity_id: this._config.pattern_entity,
      option: pattern,
    });
  }

  _onBrightnessInput(e) {
    this._debouncedSetBrightness(parseFloat(e.target.value));
  }

  _onSpreadInput(e) {
    this._debouncedSetSpread(parseFloat(e.target.value));
  }

  _setValue(entityId, value) {
    this._callService('input_number', 'set_value', {
      entity_id: entityId,
      value,
    });
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
