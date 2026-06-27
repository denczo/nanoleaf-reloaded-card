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
  hsFromWheel,
  wheelKnobPos,
  valueFromPointer,
  valueFraction,
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
    .wheel-wrap {
      flex: none;
      display: flex;
      align-items: center;
    }
    .color-wheel {
      position: relative;
      width: 130px;
      height: 130px;
      border-radius: 50%;
      touch-action: none;
      cursor: pointer;
      background:
        radial-gradient(circle at center,
          #fff 0%, rgba(255,255,255,0) 70%),
        conic-gradient(
          hsl(0,100%,50%), hsl(60,100%,50%),
          hsl(120,100%,50%), hsl(180,100%,50%),
          hsl(240,100%,50%), hsl(300,100%,50%),
          hsl(360,100%,50%));
      box-shadow: inset 0 0 0 1px rgba(0,0,0,0.25);
    }
    .wheel-knob {
      position: absolute;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid #fff;
      box-shadow: 0 0 3px rgba(0,0,0,0.7);
      transform: translate(-50%, -50%);
      pointer-events: none;
    }
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
    .pill-slider {
      position: relative;
      height: 42px;
      border-radius: 12px;
      margin: 4px 0;
      overflow: hidden;
      cursor: pointer;
      touch-action: none;
      background: rgba(255,255,255,0.07);
    }
    .pill-fill {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      border-radius: 12px;
      background: rgba(255,255,255,0.22);
    }
    .pill-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      --mdc-icon-size: 20px;
      color: var(--primary-text-color);
      pointer-events: none;
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
    this._debouncedColor = debounce((rgb) => {
      this._callService('light', 'turn_on', {
        entity_id: this._activeDevice.color_entity,
        rgb_color: rgb,
      });
    }, 150);
    this._ov = {};
  }

  set hass(hass) {
    this._hass = hass;
    this._reconcileOverrides(hass);
    this.requestUpdate();
  }

  // Drop optimistic overrides once HA reports the value we sent,
  // so external changes are reflected again.
  _reconcileOverrides(hass) {
    const d = this._activeDevice;
    if (!d) return;
    const slots = {
      brightness: d.brightness_entity,
      spread: d.spread_entity,
    };
    for (const [key, ent] of Object.entries(slots)) {
      if (this._ov?.[key] === undefined) continue;
      if (Number(hass.states[ent]?.state) === this._ov[key]) {
        const next = { ...this._ov };
        delete next[key];
        this._ov = next;
      }
    }
    if (this._wheelHs && this._sentRgb) {
      const cur = hass.states[d.color_entity]?.attributes?.rgb_color;
      if (
        cur &&
        cur[0] === this._sentRgb[0] &&
        cur[1] === this._sentRgb[1] &&
        cur[2] === this._sentRgb[2]
      ) {
        this._wheelHs = undefined;
      }
    }
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

    const hs =
      this._wheelHs ??
      rgbToHs(
        ...(colorState?.attributes?.rgb_color ?? [128, 128, 128])
      );
    const knob = wheelKnobPos(hs.h, hs.s, 65);
    const swatch = hsToRgb(hs.h, hs.s);

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
            <div class="wheel-wrap">
              <div
                class="color-wheel"
                @pointerdown=${this._wheelDown}
                @pointermove=${this._wheelMove}
                @pointerup=${this._wheelUp}
                @pointercancel=${this._wheelUp}
              >
                <div
                  class="wheel-knob"
                  style="left:${65 + knob.x}px;top:${
                    65 + knob.y
                  }px;background:rgb(${swatch.join(',')})"
                ></div>
              </div>
            </div>
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
              ${this._renderPill(
                'mdi:brightness-6',
                brightnessState,
                brigAttr,
                'brightness'
              )}
              ${this._renderPill(
                'mdi:arrow-expand-horizontal',
                spreadState,
                spreadAttr,
                'spread'
              )}
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

  _wheelDown(e) {
    this._wheelDragging = true;
    e.target.setPointerCapture?.(e.pointerId);
    this._wheelApply(e);
  }

  _wheelMove(e) {
    if (this._wheelDragging) this._wheelApply(e);
  }

  _wheelUp(e) {
    this._wheelDragging = false;
    e.target.releasePointerCapture?.(e.pointerId);
  }

  _wheelApply(e) {
    const r = e.currentTarget.getBoundingClientRect();
    const dx = e.clientX - r.left - r.width / 2;
    const dy = e.clientY - r.top - r.height / 2;
    const hs = hsFromWheel(dx, dy, r.width / 2);
    this._wheelHs = hs;
    const rgb = hsToRgb(hs.h, hs.s);
    this._sentRgb = rgb;
    this._debouncedColor(rgb);
    this.requestUpdate();
  }

  _selectPattern(pattern) {
    const entityId = this._activeDevice.pattern_entity;
    // domain from the entity itself: select.* or input_select.*
    this._callService(entityId.split('.')[0], 'select_option', {
      entity_id: entityId,
      option: pattern,
    });
  }

  _renderPill(icon, state, attr, kind) {
    const min = Number(attr.min ?? 0);
    const max = Number(attr.max ?? 100);
    const step = Number(attr.step ?? 1);
    const val = this._ov?.[kind] ?? Number(state?.state ?? min);
    const frac = valueFraction(val, min, max);
    return html`
      <div
        class="pill-slider"
        @pointerdown=${(e) =>
          this._pillDown(e, min, max, step, kind)}
        @pointermove=${(e) =>
          this._pillMove(e, min, max, step, kind)}
        @pointerup=${this._pillUp}
        @pointercancel=${this._pillUp}
      >
        <div class="pill-fill" style="width:${frac * 100}%"></div>
        <ha-icon class="pill-icon" icon=${icon}></ha-icon>
      </div>`;
  }

  _pillDown(e, min, max, step, kind) {
    this._pillDragging = true;
    e.target.setPointerCapture?.(e.pointerId);
    this._pillApply(e, min, max, step, kind);
  }

  _pillMove(e, min, max, step, kind) {
    if (this._pillDragging) {
      this._pillApply(e, min, max, step, kind);
    }
  }

  _pillUp(e) {
    this._pillDragging = false;
    e.target.releasePointerCapture?.(e.pointerId);
  }

  _pillApply(e, min, max, step, kind) {
    const r = e.currentTarget.getBoundingClientRect();
    const v = valueFromPointer(
      e.clientX, r.left, r.width, min, max, step
    );
    this._ov = { ...this._ov, [kind]: v };
    if (kind === 'brightness') this._debouncedSetBrightness(v);
    else this._debouncedSetSpread(v);
    this.requestUpdate();
  }

  _setValue(entityId, value) {
    // domain from the entity itself: number.* or input_number.*
    this._callService(entityId.split('.')[0], 'set_value', {
      entity_id: entityId,
      value,
    });
  }

  _callService(domain, service, data, target) {
    this._hass.callService(domain, service, data, target);
  }
}

customElements.define('nanoleaf-reloaded-card', NanoleafCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'nanoleaf-reloaded-card',
  name: 'Nanoleaf Reloaded Card',
  description: 'Control panel for Nanoleaf light panels',
});
