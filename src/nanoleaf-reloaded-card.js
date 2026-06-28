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
  hsFromWheel,
  wheelKnobPos,
  valueFromPointer,
  valueFraction,
  autoDetectDevice,
  autoDetectDevices,
  panelGeometry,
  polygonPoints,
  FIELDS,
} from './helpers.js';

const PATTERNS = ['solid', 'linear', 'radial', 'rainbow'];

// Spread slider curve: >1 gives finer control at the low end where
// subtle gradients live (log-style feel). Brightness stays linear.
const SPREAD_GAMMA = 2.2;

class NanoleafCard extends LitElement {
  static styles = css`
    :host { display: block; }
    ha-card { overflow: hidden; padding: 0; }
    svg { display: block; }
    /* fade panel colours in the preview, mirroring the hardware */
    svg polygon { transition: fill 0.45s ease, stroke 0.45s ease; }
    /* fixed-height preview, inset from the side and bottom edges;
       the SVG inside scales its contents down to fit this box */
    .svg-wrapper {
      position: relative;
      height: 260px;
      box-sizing: border-box;
      padding: 0 16px 16px;
    }
    /* full-width button bar above the preview */
    .power-bar {
      padding: 0;
    }
    .power-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      cursor: pointer;
      padding: 6px 0;
      transition: background 0.15s ease;
    }
    .power-btn:hover {
      background: rgba(255,255,255,0.06);
    }
    .power-btn:active {
      background: rgba(255,255,255,0.12);
    }
    .power-btn ha-icon {
      --mdc-icon-size: 28px;
    }
    .controls {
      background: rgba(255,255,255,0.05);
      border-radius: 12px;
      margin: 0 12px 12px;
      /* less vertical padding so the dial fills more height */
      padding: 6px 12px;
    }
    /* dial column : sliders column = 1 : 2; stretch so both
       columns are full height and the dial centres within it */
    .color-row {
      display: flex;
      align-items: stretch;
      gap: 12px;
      padding: 0;
    }
    .wheel-wrap {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      /* a little breathing room above/below the dial */
      padding: 8px 0;
    }
    .color-wheel {
      position: relative;
      width: 100%;
      max-width: 160px;
      aspect-ratio: 1 / 1;
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
      flex: 2;
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

  static getConfigElement() {
    return document.createElement('nanoleaf-reloaded-card-editor');
  }

  // One card controls one controller; pre-fill with the first
  // detected controller. Add another card for another controller.
  static getStubConfig(hass) {
    return autoDetectDevice(hass);
  }

  setConfig(config) {
    this._devices = normalizeDevices(config);
    this._config = config;
    this._activeIndex = 0;
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
    if (this._powerOv !== undefined) {
      const on = hass.states[d.light_entity]?.state === 'on';
      if (on === this._powerOv) {
        this._powerOv = undefined;
        clearTimeout(this._powerTimer);
      }
    }
  }

  get _activeDevice() {
    return this._devices?.[this._activeIndex];
  }

  get _isOn() {
    // optimistic override so the power state flips instantly on tap
    if (this._powerOv !== undefined) return this._powerOv;
    return (
      this._hass?.states[this._activeDevice?.light_entity]?.state ===
      'on'
    );
  }

  render() {
    if (!this._hass || !this._config) return html``;
    const d = this._activeDevice;

    if (isDeviceOffline(this._hass, d)) {
      const action = parseAction(d.reconnect_action);
      return html`
        <ha-card>
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
    // unit offsets (-1..1) so the knob is positioned as a % of the
    // wheel — works at any responsive wheel size
    const knob = wheelKnobPos(hs.h, hs.s, 1);
    const swatch = hsToRgb(hs.h, hs.s);

    return html`
      <ha-card>
        <div class="power-bar">
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
        <div class="svg-wrapper">
          ${this._renderSVG(layoutState, colorsState)}
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
                  style="left:${50 + knob.x * 50}%;top:${
                    50 + knob.y * 50
                  }%;background:rgb(${swatch.join(',')})"
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
      parseFloat(layoutState?.attributes?.sideLength) || 135;

    // every light panel, with its shape geometry; controller /
    // power / unknown shapeTypes return null and are dropped.
    const panels = positionData
      .map((p) => ({ ...p, geom: panelGeometry(p.shapeType, s) }))
      .filter((p) => p.geom);

    if (!panels.length) {
      return html`<div style="height:260px"></div>`;
    }

    const panelColors = parsePanelColors(colorsState?.state ?? '');
    // --- Gap algorithm: shape- and scale-independent -------------
    // Each panel is sized from the ACTUAL distance to its nearest
    // neighbour (the layout "pitch"), not from nominal shape sizes —
    // those rely on a reported sideLength that can mismatch the panels
    // actually present (e.g. an all-mini controller), which shrinks
    // every panel and blows the gaps wide open. Each panel's edges are
    // then inset by a fixed fraction of its pitch, so the space
    // between any two shapes is the same ratio at any size or shape.
    const GAP_RATIO = 0.05; // gap between panels = 5% of local pitch
    const ROUND_FRAC = 0.22; // rounded-corner stroke, fraction of drawR
    const cx = panels.map((p) => -p.x);
    const cy = panels.map((p) => p.y);
    const pitchOf = (i) => {
      let m = Infinity;
      for (let j = 0; j < panels.length; j++) {
        if (j === i) continue;
        const d = Math.hypot(cx[i] - cx[j], cy[i] - cy[j]);
        if (d < m) m = d;
      }
      // lone panel: fall back to its own nominal edge-to-edge pitch
      const g = panels[i].geom;
      return Number.isFinite(m)
        ? m
        : 2 * g.radius * Math.cos(Math.PI / g.sides);
    };
    // drawR solves: 2·inradius + stroke = pitch·(1 - GAP_RATIO), with
    // inradius = drawR·cos(π/n) and stroke = drawR·ROUND_FRAC. This
    // yields the same gap ratio for triangles, squares, hexagons, …
    const geomOf = panels.map((p, i) => {
      const cos = Math.cos(Math.PI / p.geom.sides);
      const drawR =
        (pitchOf(i) * (1 - GAP_RATIO)) / (2 * cos + ROUND_FRAC);
      const stroke = drawR * ROUND_FRAC;
      return { drawR, stroke, reach: drawR + stroke / 2 };
    });
    // viewBox tightly bounds the painted panels (centre = (-x, y));
    // the wrapper's CSS padding supplies the breathing room.
    const minx = Math.min(
      ...panels.map((p, i) => cx[i] - geomOf[i].reach)
    );
    const maxx = Math.max(
      ...panels.map((p, i) => cx[i] + geomOf[i].reach)
    );
    const miny = Math.min(
      ...panels.map((p, i) => cy[i] - geomOf[i].reach)
    );
    const maxy = Math.max(
      ...panels.map((p, i) => cy[i] + geomOf[i].reach)
    );

    const polygons = panels.map((p, i) => {
      const hex = panelColors[String(p.panelId)] ?? '000000';
      const fill = resolveColor(hex, this._isOn);
      const pts = polygonPoints(geomOf[i].drawR, p.geom.sides);
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
            stroke-width=${geomOf[i].stroke}
            stroke-linejoin="round"
          />
        </g>`;
    });

    const vbW = maxx - minx;
    const vbH = maxy - miny;
    // Fixed-height viewport: the SVG fills the wrapper and scales its
    // contents to fit (preserveAspectRatio meet), so every controller's
    // preview is the same height and a larger construct is scaled down.
    return html`
      <svg
        viewBox="${minx} ${miny} ${vbW} ${vbH}"
        preserveAspectRatio="xMidYMid meet"
        style="display:block;width:100%;height:100%;
               pointer-events:none;"
      >
        ${polygons}
      </svg>`;
  }

  _reconnect() {
    const a = parseAction(this._activeDevice.reconnect_action);
    if (!a) return;
    this._callService(a.domain, a.service, a.data || {}, a.target);
  }

  _togglePower() {
    // Flip the display immediately. The actual command is DEBOUNCED so
    // spamming on/off sends only the final state once, instead of N
    // sequential round-trips that make the device physically bounce.
    this._powerTarget = !this._isOn;
    this._powerOv = this._powerTarget;
    this.requestUpdate();
    clearTimeout(this._powerTimer);
    this._powerTimer = setTimeout(() => {
      this._powerOv = undefined;
      this.requestUpdate();
    }, 3000);
    clearTimeout(this._powerSendTimer);
    this._powerSendTimer = setTimeout(() => {
      this._callService(
        'light',
        this._powerTarget ? 'turn_on' : 'turn_off',
        { entity_id: this._activeDevice.light_entity }
      );
    }, 350);
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
    this._optimisticOn();
    // domain from the entity itself: select.* or input_select.*
    this._callService(entityId.split('.')[0], 'select_option', {
      entity_id: entityId,
      option: pattern,
    });
  }

  // pattern / brightness / spread push a static effect, which powers
  // the panels on. Flip the card on immediately so the preview and
  // power button match the hardware; cleared once HA confirms.
  _optimisticOn() {
    if (this._isOn) return;
    this._powerOv = true;
    this.requestUpdate();
    clearTimeout(this._powerTimer);
    this._powerTimer = setTimeout(() => {
      this._powerOv = undefined;
      this.requestUpdate();
    }, 4000);
  }

  _renderPill(icon, state, attr, kind) {
    const min = Number(attr.min ?? 0);
    const max = Number(attr.max ?? 100);
    const step = Number(attr.step ?? 1);
    const gamma = kind === 'spread' ? SPREAD_GAMMA : 1;
    const val = this._ov?.[kind] ?? Number(state?.state ?? min);
    const frac = valueFraction(val, min, max, gamma);
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
    const gamma = kind === 'spread' ? SPREAD_GAMMA : 1;
    const v = valueFromPointer(
      e.clientX, r.left, r.width, min, max, step, gamma
    );
    this._ov = { ...this._ov, [kind]: v };
    this._optimisticOn();
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

class NanoleafCardEditor extends LitElement {
  static properties = { _config: { state: true } };

  static styles = css`
    .editor { display: flex; flex-direction: column; gap: 12px; }
    .field { display: flex; flex-direction: column; gap: 4px; }
    label { font-size: 13px; color: var(--secondary-text-color); }
    .hint {
      font-size: 12px;
      color: var(--secondary-text-color);
      margin-top: -6px;
    }
    select,
    input[type='text'] {
      padding: 8px;
      border-radius: 8px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font-size: 14px;
    }
  `;

  setConfig(config) {
    this._config = config || {};
  }

  set hass(hass) {
    this._hass = hass;
    this.requestUpdate();
  }

  // The single device this card controls. Reads a flat config, or
  // the first entry of a legacy devices: array.
  _device() {
    if (Array.isArray(this._config?.devices)) {
      return this._config.devices[0] || {};
    }
    const d = {};
    for (const f of FIELDS) {
      if (this._config?.[f.key] != null) d[f.key] = this._config[f.key];
    }
    if (this._config?.name != null) d.name = this._config.name;
    return d;
  }

  _options(domain) {
    return Object.keys(this._hass?.states ?? {})
      .filter((id) => id.split('.')[0] === domain)
      .sort();
  }

  // Emit a flat single-device config, preserving unrelated top-level
  // keys (type, layout options) and dropping any legacy devices: list.
  _emit(device) {
    const fieldKeys = new Set([...FIELDS.map((f) => f.key), 'name']);
    const base = {};
    for (const [k, v] of Object.entries(this._config || {})) {
      if (k === 'devices' || fieldKeys.has(k)) continue;
      base[k] = v;
    }
    const config = { ...base, ...device };
    this._config = config;
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config },
        bubbles: true,
        composed: true,
      })
    );
  }

  _updateField(key, value) {
    const device = { ...this._device() };
    if (value === '') delete device[key];
    else device[key] = value;
    this._emit(device);
  }

  // Controllers detected from the integration, for the picker.
  _controllers() {
    return autoDetectDevices(this._hass);
  }

  _controllerLabel(d, i) {
    const lid = d.light_entity;
    const name = this._hass?.states[lid]?.attributes?.friendly_name;
    return name || lid || `Controller ${i + 1}`;
  }

  // Fill this card's fields from the chosen controller.
  _selectController(e) {
    const i = Number(e.target.value);
    const detected = this._controllers();
    if (detected[i]) this._emit(detected[i]);
  }

  render() {
    if (!this._hass) return html``;
    const dev = this._device();
    const controllers = this._controllers();
    const selectedIdx = controllers.findIndex(
      (c) => c.light_entity && c.light_entity === dev.light_entity
    );
    return html`
      <div class="editor">
        <div class="field">
          <label>Controller</label>
          <select @change=${this._selectController}>
            <option value="" ?selected=${selectedIdx < 0}>
              — pick a controller —
            </option>
            ${controllers.map(
              (c, i) => html`
                <option value=${i} ?selected=${i === selectedIdx}>
                  ${this._controllerLabel(c, i)}
                </option>`
            )}
          </select>
        </div>
        <div class="hint">
          One card controls one controller — add another card for
          another. Pick a controller to auto-fill, or set the entities
          manually below.
        </div>
        <div class="field">
          <label>Name (optional)</label>
          <input
            type="text"
            .value=${dev.name ?? ''}
            @input=${(e) => this._updateField('name', e.target.value)}
          />
        </div>
        ${FIELDS.map((f) => {
          const val = dev[f.key] ?? '';
          return html`
            <div class="field">
              <label>${f.label}</label>
              <select
                @change=${(e) =>
                  this._updateField(f.key, e.target.value)}
              >
                <option value="" ?selected=${!val}>—</option>
                ${this._options(f.domain).map(
                  (id) => html`
                    <option value=${id} ?selected=${id === val}>
                      ${id}
                    </option>`
                )}
              </select>
            </div>`;
        })}
      </div>`;
  }
}

customElements.define(
  'nanoleaf-reloaded-card-editor',
  NanoleafCardEditor
);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'nanoleaf-reloaded-card',
  name: 'Nanoleaf Reloaded Card',
  description: 'Control panel for Nanoleaf light panels',
  preview: true,
});
