# Nanoleaf HACS Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task.
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single self-contained LitElement Lovelace card that
replaces the existing 5-card YAML stack for controlling Nanoleaf
panels from Home Assistant.

**Architecture:** One LitElement component (`nanoleaf-card`) bundled
by Rollup into a single IIFE JS file. Pure helper functions live in
`src/helpers.js` and are unit-tested with Vitest. The component reads
seven HA entity IDs from its YAML config and writes back via
`hass.callService()`.

**Tech Stack:** LitElement 3, Rollup 4,
@rollup/plugin-node-resolve, rollup-plugin-terser, Vitest

---

## File map

```
nanoleaf-card/
├── src/
│   ├── helpers.js          pure functions (parsePanelColors,
│   │                       resolveColor, rgbToHs, hsToRgb, debounce)
│   └── nanoleaf-card.js    LitElement component
├── dist/
│   └── nanoleaf-card.js    Rollup output — committed to repo
├── test/
│   └── helpers.test.js     Vitest unit tests
├── package.json
├── rollup.config.js
├── hacs.json
└── README.md
```

---

## Task 1: Project scaffold + build toolchain

**Files:**
- Create: `package.json`
- Create: `rollup.config.js`
- Create: `src/nanoleaf-card.js` (placeholder)

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "nanoleaf-card",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "rollup -c",
    "test": "vitest run"
  },
  "devDependencies": {
    "@rollup/plugin-node-resolve": "^15.0.0",
    "lit": "^3.0.0",
    "rollup": "^4.0.0",
    "rollup-plugin-terser": "^7.0.2",
    "vitest": "^1.0.0"
  }
}
```

- [ ] **Step 2: Create `rollup.config.js`**

```js
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/nanoleaf-card.js',
  output: {
    file: 'dist/nanoleaf-card.js',
    format: 'iife',
    name: 'NanoleafCard',
  },
  plugins: [resolve(), terser()],
};
```

- [ ] **Step 3: Create placeholder `src/nanoleaf-card.js`**

```js
import { LitElement, html, css } from 'lit';

class NanoleafCard extends LitElement {
  render() {
    return html`<ha-card>nanoleaf-card loading…</ha-card>`;
  }
}

customElements.define('nanoleaf-card', NanoleafCard);
```

- [ ] **Step 4: Install dependencies**

```bash
cd /home/dev/nanoleaf-card && npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 5: Verify build runs**

```bash
cd /home/dev/nanoleaf-card && npm run build
```

Expected: `dist/nanoleaf-card.js` created, no errors.

- [ ] **Step 6: Commit**

```bash
git -C /home/dev/nanoleaf-card add \
  package.json package-lock.json \
  rollup.config.js src/nanoleaf-card.js
git -C /home/dev/nanoleaf-card commit \
  -m "chore: project scaffold and build toolchain"
```

---

## Task 2: Pure helper functions + unit tests

**Files:**
- Create: `src/helpers.js`
- Create: `test/helpers.test.js`

These functions have no DOM or HA dependencies — test them fully.

- [ ] **Step 1: Write failing tests**

Create `test/helpers.test.js`:

```js
import { describe, it, expect } from 'vitest';
import {
  parsePanelColors,
  resolveColor,
  rgbToHs,
  hsToRgb,
  debounce,
} from '../src/helpers.js';

describe('parsePanelColors', () => {
  it('parses a multi-panel string', () => {
    const result = parsePanelColors('12:ff0000,34:00ff00');
    expect(result).toEqual({ '12': 'ff0000', '34': '00ff00' });
  });

  it('returns empty object for empty string', () => {
    expect(parsePanelColors('')).toEqual({});
  });

  it('ignores entries without colon', () => {
    expect(parsePanelColors('badentry,12:aabbcc')).toEqual({
      '12': 'aabbcc',
    });
  });
});

describe('resolveColor', () => {
  it('returns dim grey when light is off', () => {
    expect(resolveColor('ff0000', false)).toBe('rgb(77,77,77)');
  });

  it('returns dim grey when color is black', () => {
    expect(resolveColor('000000', true)).toBe('rgb(77,77,77)');
  });

  it('normalises red to full brightness', () => {
    // ff0000: max=255, scale=1, no change
    expect(resolveColor('ff0000', true)).toBe('rgb(255,0,0)');
  });

  it('normalises a dim colour to full brightness', () => {
    // 800000: r=128, max=128, scale=2 → r=255
    expect(resolveColor('800000', true)).toBe('rgb(255,0,0)');
  });

  it('preserves ratio for mixed colour', () => {
    // 804000: r=128,g=64,b=0 max=128 scale=2 → r=255,g=128,b=0
    expect(resolveColor('804000', true)).toBe('rgb(255,128,0)');
  });
});

describe('rgbToHs + hsToRgb round-trip', () => {
  it('round-trips pure red', () => {
    const { h, s } = rgbToHs(255, 0, 0);
    const [r, g, b] = hsToRgb(h, s);
    expect(r).toBeCloseTo(255, 0);
    expect(g).toBeCloseTo(0, 0);
    expect(b).toBeCloseTo(0, 0);
  });

  it('round-trips a mid-tone colour', () => {
    const { h, s } = rgbToHs(100, 150, 200);
    const [r, g, b] = hsToRgb(h, s);
    expect(r).toBeCloseTo(100, -1);
    expect(g).toBeCloseTo(150, -1);
    expect(b).toBeCloseTo(200, -1);
  });

  it('returns h=0, s=0 for white', () => {
    expect(rgbToHs(255, 255, 255)).toEqual({ h: 0, s: 0 });
  });
});

describe('debounce', () => {
  it('calls fn after delay', async () => {
    let called = 0;
    const fn = debounce(() => { called++; }, 20);
    fn();
    expect(called).toBe(0);
    await new Promise((r) => setTimeout(r, 30));
    expect(called).toBe(1);
  });

  it('resets timer on repeated calls', async () => {
    let called = 0;
    const fn = debounce(() => { called++; }, 20);
    fn(); fn(); fn();
    await new Promise((r) => setTimeout(r, 30));
    expect(called).toBe(1);
  });
});
```

- [ ] **Step 2: Run tests — expect all to fail**

```bash
cd /home/dev/nanoleaf-card && npm test
```

Expected: failures like `Cannot find module '../src/helpers.js'`.

- [ ] **Step 3: Create `src/helpers.js`**

```js
/**
 * Parse "panelId:rrggbb,..." into { panelId: 'rrggbb', ... }
 */
export function parsePanelColors(str) {
  const map = {};
  if (!str) return map;
  for (const entry of str.split(',')) {
    const idx = entry.indexOf(':');
    if (idx !== -1) {
      map[entry.slice(0, idx).trim()] = entry.slice(idx + 1).trim();
    }
  }
  return map;
}

/**
 * Resolve a hex colour to an rgb() string.
 * If off or black → dim grey. Otherwise normalise to max channel = 255.
 */
export function resolveColor(hex, isOn) {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const maxc = Math.max(r, g, b);
  if (!isOn || maxc === 0) return 'rgb(77,77,77)';
  const scale = 255 / maxc;
  return (
    `rgb(${Math.round(r * scale)},` +
    `${Math.round(g * scale)},` +
    `${Math.round(b * scale)})`
  );
}

/**
 * Convert RGB (0-255 each) to HS { h: 0-360, s: 0-1 }.
 * Value is ignored (always treated as 1).
 */
export function rgbToHs(r, g, b) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  return { h, s };
}

/**
 * Convert HS { h: 0-360, s: 0-1 } to RGB [r, g, b] (0-255 each).
 * Value is fixed at 1 (full brightness).
 */
export function hsToRgb(h, s) {
  const c = s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = 1 - c;
  let rp = 0, gp = 0, bp = 0;
  if (h < 60) { rp = c; gp = x; }
  else if (h < 120) { rp = x; gp = c; }
  else if (h < 180) { gp = c; bp = x; }
  else if (h < 240) { gp = x; bp = c; }
  else if (h < 300) { rp = x; bp = c; }
  else { rp = c; bp = x; }
  return [
    Math.round((rp + m) * 255),
    Math.round((gp + m) * 255),
    Math.round((bp + m) * 255),
  ];
}

/**
 * Return a debounced version of fn that fires after `delay` ms
 * of inactivity.
 */
export function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
```

- [ ] **Step 4: Run tests — expect all to pass**

```bash
cd /home/dev/nanoleaf-card && npm test
```

Expected: all tests green, no failures.

- [ ] **Step 5: Commit**

```bash
git -C /home/dev/nanoleaf-card add \
  src/helpers.js test/helpers.test.js
git -C /home/dev/nanoleaf-card commit \
  -m "feat: pure helper functions with unit tests"
```

---

## Task 3: setConfig validation

**Files:**
- Modify: `src/nanoleaf-card.js`

- [ ] **Step 1: Add validation test to `test/helpers.test.js`**

Two edits to the file:

**a) Add to the existing import line at the top:**
```js
import {
  parsePanelColors,
  resolveColor,
  rgbToHs,
  hsToRgb,
  debounce,
  validateConfig,   // add this
} from '../src/helpers.js';
```

**b) Append this describe block at the bottom of the file:**
```js

describe('validateConfig', () => {
  const valid = {
    light_entity: 'light.nanoleaf',
    color_entity: 'light.nanoleaf_base_color',
    layout_sensor: 'sensor.nanoleaf_layout',
    panel_colors_entity: 'input_text.nanoleaf_panel_colors',
    pattern_entity: 'input_select.nanoleaf_pattern',
    brightness_entity: 'input_number.nanoleaf_brightness',
    spread_entity: 'input_number.nanoleaf_spread',
  };

  it('does not throw for a complete config', () => {
    expect(() => validateConfig(valid)).not.toThrow();
  });

  it('throws with the missing key name', () => {
    const bad = { ...valid };
    delete bad.spread_entity;
    expect(() => validateConfig(bad)).toThrow('spread_entity');
  });

  it('throws for an empty config', () => {
    expect(() => validateConfig({})).toThrow();
  });
});
```
```

- [ ] **Step 2: Run test — expect failure**

```bash
cd /home/dev/nanoleaf-card && npm test
```

Expected: `Cannot find export 'validateConfig'`.

- [ ] **Step 3: Add `validateConfig` to `src/helpers.js`**

Append to the end of `src/helpers.js`:

```js
const REQUIRED_KEYS = [
  'light_entity',
  'color_entity',
  'layout_sensor',
  'panel_colors_entity',
  'pattern_entity',
  'brightness_entity',
  'spread_entity',
];

export function validateConfig(config) {
  for (const key of REQUIRED_KEYS) {
    if (!config[key]) {
      throw new Error(
        `nanoleaf-card: missing required config key "${key}"`
      );
    }
  }
}
```

- [ ] **Step 4: Run tests — expect all green**

```bash
cd /home/dev/nanoleaf-card && npm test
```

Expected: all passing.

- [ ] **Step 5: Wire `validateConfig` into the component**

Replace `src/nanoleaf-card.js` placeholder with:

```js
import { LitElement, html, css, svg } from 'lit';
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
```

- [ ] **Step 6: Build to verify no errors**

```bash
cd /home/dev/nanoleaf-card && npm run build
```

Expected: `dist/nanoleaf-card.js` updated, no errors.

- [ ] **Step 7: Commit**

```bash
git -C /home/dev/nanoleaf-card add \
  src/helpers.js src/nanoleaf-card.js test/helpers.test.js
git -C /home/dev/nanoleaf-card commit \
  -m "feat: setConfig validation"
```

---

## Task 4: SVG panel renderer

**Files:**
- Modify: `src/nanoleaf-card.js`

- [ ] **Step 1: Add `_renderSVG` method to the component**

Replace the `render()` stub and add `_renderSVG` in
`src/nanoleaf-card.js`. Full file:

```js
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
```

- [ ] **Step 2: Build**

```bash
cd /home/dev/nanoleaf-card && npm run build
```

Expected: no errors.

- [ ] **Step 3: Smoke-test in HA (manual)**

Copy `dist/nanoleaf-card.js` to your HA server's
`config/www/nanoleaf-card.js`. In HA Settings → Dashboards →
Resources, add `/local/nanoleaf-card.js` as a JavaScript module.
Add this to a dashboard YAML:

```yaml
type: custom:nanoleaf-card
light_entity: light.nanoleaf
color_entity: light.nanoleaf_base_color
layout_sensor: sensor.nanoleaf_layout
panel_colors_entity: input_text.nanoleaf_panel_colors
pattern_entity: input_select.nanoleaf_pattern
brightness_entity: input_number.nanoleaf_brightness
spread_entity: input_number.nanoleaf_spread
```

Expected: SVG panel layout visible. Panels show current colours
(or dim grey if off). Power button not yet wired.

- [ ] **Step 4: Commit**

```bash
git -C /home/dev/nanoleaf-card add \
  src/nanoleaf-card.js dist/nanoleaf-card.js
git -C /home/dev/nanoleaf-card commit \
  -m "feat: SVG panel renderer"
```

---

## Task 5: Controls — power, colour, pattern, sliders

**Files:**
- Modify: `src/nanoleaf-card.js`

Replace the full file with the complete component:

- [ ] **Step 1: Write the full component**

Full `src/nanoleaf-card.js`:

```js
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
```

- [ ] **Step 2: Run tests (helpers still green)**

```bash
cd /home/dev/nanoleaf-card && npm test
```

Expected: all tests pass.

- [ ] **Step 3: Build**

```bash
cd /home/dev/nanoleaf-card && npm run build
```

Expected: no errors, `dist/nanoleaf-card.js` updated.

- [ ] **Step 4: Smoke-test in HA (manual)**

Copy `dist/nanoleaf-card.js` to HA's `config/www/nanoleaf-card.js`
and hard-refresh. Verify:

- SVG panels render with correct colours
- Power button toggles the light
- Colour wheel changes `light.nanoleaf_base_color`
- Solid/Linear/Radial/Rainbow buttons highlight the active pattern
- Brightness and spread sliders call `input_number.set_value`
  (watch HA Developer Tools → States to confirm)

- [ ] **Step 5: Commit**

```bash
git -C /home/dev/nanoleaf-card add \
  src/nanoleaf-card.js dist/nanoleaf-card.js
git -C /home/dev/nanoleaf-card commit \
  -m "feat: full card render with all controls"
```

---

## Task 6: HACS packaging + README

**Files:**
- Create: `hacs.json`
- Create: `README.md`
- Create: `.gitignore`

- [ ] **Step 1: Create `hacs.json`**

```json
{
  "name": "Nanoleaf Card",
  "render_readme": true,
  "content_in_root": false,
  "filename": "dist/nanoleaf-card.js"
}
```

- [ ] **Step 2: Create `.gitignore`**

```
node_modules/
```

- [ ] **Step 3: Create `README.md`**

```markdown
# Nanoleaf Card

Custom Lovelace card for Home Assistant.
Displays your Nanoleaf panel layout and lets you control
power, colour, pattern, brightness, and spread from one card.
No HACS card dependencies.

## Installation

### Manual (homelab)

1. Copy `dist/nanoleaf-card.js` to `config/www/nanoleaf-card.js`
2. In HA: Settings → Dashboards → Resources →
   Add `/local/nanoleaf-card.js` (JavaScript module)

### Via HACS custom repo

Add this repository URL in HACS → Frontend → Custom repositories.

## Configuration

```yaml
type: custom:nanoleaf-card
light_entity: light.nanoleaf
color_entity: light.nanoleaf_base_color
layout_sensor: sensor.nanoleaf_layout
panel_colors_entity: input_text.nanoleaf_panel_colors
pattern_entity: input_select.nanoleaf_pattern
brightness_entity: input_number.nanoleaf_brightness
spread_entity: input_number.nanoleaf_spread
```

## Required HA helpers

| Entity | Type | Purpose |
|---|---|---|
| `sensor.nanoleaf_layout` | REST sensor | Panel positions |
| `input_text.nanoleaf_panel_colors` | Helper | Per-panel hex colours |
| `input_select.nanoleaf_pattern` | Helper | Solid/Linear/Radial/Rainbow |
| `input_number.nanoleaf_brightness` | Helper | Brightness 0–100 |
| `input_number.nanoleaf_spread` | Helper | Spread/radius |
```

- [ ] **Step 4: Final build + test**

```bash
cd /home/dev/nanoleaf-card && npm test && npm run build
```

Expected: all tests pass, `dist/nanoleaf-card.js` rebuilt.

- [ ] **Step 5: Commit everything**

```bash
git -C /home/dev/nanoleaf-card add \
  hacs.json README.md .gitignore dist/nanoleaf-card.js
git -C /home/dev/nanoleaf-card commit \
  -m "chore: HACS packaging and README"
```
