import { describe, it, expect } from 'vitest';
import {
  parsePanelColors,
  resolveColor,
  rgbToHs,
  hsToRgb,
  debounce,
  validateConfig,
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

  it('round-trips a mid-tone colour (normalised to V=1)', () => {
    // hsToRgb always returns V=1, so input is normalised to max=255.
    // (100,150,200) → max=200 → (128,191,255)
    const { h, s } = rgbToHs(100, 150, 200);
    const [r, g, b] = hsToRgb(h, s);
    expect(r).toBeCloseTo(128, -1);
    expect(g).toBeCloseTo(191, -1);
    expect(b).toBeCloseTo(255, -1);
  });

  it('returns h=0, s=0 for white', () => {
    expect(rgbToHs(255, 255, 255)).toEqual({ h: 0, s: 0 });
  });

  it('treats h=360 as red (same as h=0)', () => {
    const [r0, g0, b0] = hsToRgb(0, 1);
    const [r360, g360, b360] = hsToRgb(360, 1);
    expect(r360).toBe(r0);
    expect(g360).toBe(g0);
    expect(b360).toBe(b0);
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
