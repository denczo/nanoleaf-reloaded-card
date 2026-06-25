import { LitElement, html, css, svg } from 'lit';
import {
  normalizeDevices,
  parsePanelColors,
  resolveColor,
  rgbToHs,
  hsToRgb,
  debounce,
  isDeviceOffline,
  parseAction,
  deviceStorageKey,
  clampIndex,
} from './helpers.js';

const PATTERNS = ['solid', 'linear', 'radial', 'rainbow'];

class NanoleafCard extends LitElement {
  static styles = css`
    :host { display: block; }
    ha-card { overflow: hidden; padding: 0; }
    svg { display: block; }
    .svg-wrapper { position: relative; }
    .device-bar {
      display: flex;
      justify-content: flex-end;
      padding: 8px 12px 0;
    }
    .device-select {
      background: var(--card-background-color);
      color: var(--primary-text-color);
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 4px 8px;
      font-size: 14px;
    }
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
    .offline {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      min-height: 300px;
      color: var(--secondary-text-color);
      text-align: center;
    }
    .offline ha-icon {
      --mdc-icon-size: 48px;
      color: var(--error-color, var(--disabled-text-color));
    }
    .offline-msg { font-size: 15px; }
    .reconnect-btn {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
      border: none;
      border-radius: 8px;
      padding: 8px 16px;
      font-size: 14px;
      cursor: pointer;
    }
  `;

  setConfig(config) {
    this._devices = normalizeDevices(config);
    this._config = config;
    this._storageKey = deviceStorageKey(this._devices);
    this._activeIndex = clampIndex(
      this._loadIndex(),
      this._devices.length
    );
    this._debouncedSetBrightness = debounce(
      (v) => this._setValue(this._activeDevice.brightness_entity, v),
      150
    );
    this._debouncedSetSpread = debounce(
      (v) => this._setValue(this._activeDevice.spread_entity, v),
      150
    );
  }

  set hass(hass) {
    this._hass = hass;
    this.requestUpdate();
  }

  get _activeDevice() {
    return this._devices?.[this._activeIndex];
  }

  get _isOn() {
    return (
      this._hass?.states[this._activeDevice?.light_entity]?.state ===
      'on'
    );
  }

  _renderPicker() {
    if (!this._devices || this._devices.length < 2) return '';
    return html`
      <div class="device-bar">
        <select class="device-select" @change=${this._selectDevice}>
          ${this._devices.map(
            (dev, i) => html`
              <option value=${i} ?selected=${i === this._activeIndex}>
                ${dev.name || dev.light_entity}${
                  isDeviceOffline(this._hass, dev) ? ' ●' : ''
                }
              </option>`
          )}
        </select>
      </div>`;
  }

  render() {
    if (!this._hass || !this._config) return html``;
    const d = this._activeDevice;

    if (isDeviceOffline(this._hass, d)) {
      const action = parseAction(d.reconnect_action);
      return html`
        <ha-card>
          ${this._renderPicker()}
          <div class="offline">
            <ha-icon icon="mdi:lan-disconnect"></ha-icon>
            <div class="offline-msg">
              ${d.name || 'Nanoleaf'} unreachable
            </div>
            ${action
              ? html`<button
                  class="reconnect-btn"
                  @click=${this._reconnect}
                >
                  Reconnect
                </button>`
              : ''}
          </div>
        </ha-card>`;
    }

    const layoutState = this._hass.states[d.layout_sensor];
    const colorsState = this._hass.states[d.panel_colors_entity];
    const patternState = this._hass.states[d.pattern_entity];
    const brightnessState = this._hass.states[d.brightness_entity];
    const spreadState = this._hass.states[d.spread_entity];
    const colorState = this._hass.states[d.color_entity];

    const activePattern = patternState?.state ?? '';
    const brigAttr = brightnessState?.attributes ?? {};
    const spreadAttr = spreadState?.attributes ?? {};

    const hs = rgbToHs(
      ...(colorState?.attributes?.rgb_color ?? [128, 128, 128])
    );

    return html`
      <ha-card>
        ${this._renderPicker()}
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

  _selectDevice(e) {
    this._activeIndex = clampIndex(
      e.target.value,
      this._devices.length
    );
    this._saveIndex();
    this.requestUpdate();
  }

  _loadIndex() {
    try {
      return window.localStorage.getItem(this._storageKey);
    } catch (e) {
      return null;
    }
  }

  _saveIndex() {
    try {
      window.localStorage.setItem(
        this._storageKey,
        String(this._activeIndex)
      );
    } catch (e) {
      /* storage unavailable — selection just won't persist */
    }
  }

  _reconnect() {
    const a = parseAction(this._activeDevice.reconnect_action);
    if (!a) return;
    this._callService(a.domain, a.service, a.data || {}, a.target);
  }

  _togglePower() {
    this._callService('light', 'toggle', {
      entity_id: this._activeDevice.light_entity,
    });
  }

  _onColorChanged(e) {
    const { h, s } = e.detail.color;
    const rgb = hsToRgb(h, s);
    this._callService('light', 'turn_on', {
      entity_id: this._activeDevice.color_entity,
      rgb_color: rgb,
    });
  }

  _selectPattern(pattern) {
    this._callService('input_select', 'select_option', {
      entity_id: this._activeDevice.pattern_entity,
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

  _callService(domain, service, data, target) {
    this._hass.callService(domain, service, data, target);
  }
}

customElements.define('nanoleaf-card', NanoleafCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'nanoleaf-card',
  name: 'Nanoleaf Card',
  description: 'Control panel for Nanoleaf light panels',
});
