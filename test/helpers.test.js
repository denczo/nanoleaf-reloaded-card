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
