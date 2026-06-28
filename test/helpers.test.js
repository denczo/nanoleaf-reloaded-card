import { describe, it, expect } from 'vitest';
import {
  parsePanelColors,
  resolveColor,
  rgbToHs,
  hsToRgb,
  debounce,
  validateConfig,
  normalizeDevices,
  isDeviceOffline,
  parseAction,
  deviceStorageKey,
  clampIndex,
  hsFromWheel,
  wheelKnobPos,
  valueFromPointer,
  valueFraction,
  autoDetectDevice,
  autoDetectDevices,
  panelGeometry,
  polygonPoints,
} from '../src/helpers.js';

const DEVICE = {
  light_entity: 'light.nanoleaf',
  color_entity: 'light.nanoleaf_base_color',
  layout_sensor: 'sensor.nanoleaf_layout',
  panel_colors_entity: 'input_text.nanoleaf_panel_colors',
  pattern_entity: 'input_select.nanoleaf_pattern',
  brightness_entity: 'input_number.nanoleaf_brightness',
  spread_entity: 'input_number.nanoleaf_spread',
};

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

describe('normalizeDevices', () => {
  it('wraps a flat single-device config into a list', () => {
    const result = normalizeDevices({ ...DEVICE });
    expect(result).toHaveLength(1);
    expect(result[0].light_entity).toBe('light.nanoleaf');
  });

  it('passes through a devices array', () => {
    const cfg = {
      devices: [
        { ...DEVICE, name: 'A' },
        { ...DEVICE, name: 'B', light_entity: 'light.b' },
      ],
    };
    const result = normalizeDevices(cfg);
    expect(result.map((d) => d.name)).toEqual(['A', 'B']);
  });

  it('throws naming the device and missing key', () => {
    const cfg = { devices: [{ ...DEVICE, name: 'Office' }] };
    delete cfg.devices[0].spread_entity;
    expect(() => normalizeDevices(cfg)).toThrow('Office');
    expect(() => normalizeDevices(cfg)).toThrow('spread_entity');
  });

  it('throws when both devices and flat keys are present', () => {
    const cfg = { ...DEVICE, devices: [{ ...DEVICE }] };
    expect(() => normalizeDevices(cfg)).toThrow(/not both/);
  });

  it('throws on an empty devices array', () => {
    expect(() => normalizeDevices({ devices: [] })).toThrow(
      /empty/
    );
  });
});

describe('isDeviceOffline', () => {
  it('is offline when the entity is missing', () => {
    const hass = { states: {} };
    expect(isDeviceOffline(hass, DEVICE)).toBe(true);
  });

  it('is offline when state is unavailable', () => {
    const hass = {
      states: { 'light.nanoleaf': { state: 'unavailable' } },
    };
    expect(isDeviceOffline(hass, DEVICE)).toBe(true);
  });

  it('is online for a normal state', () => {
    const hass = {
      states: { 'light.nanoleaf': { state: 'on' } },
    };
    expect(isDeviceOffline(hass, DEVICE)).toBe(false);
  });
});

describe('parseAction', () => {
  it('splits domain.service and keeps data/target', () => {
    expect(
      parseAction({
        service: 'homeassistant.reload_config_entry',
        data: { entry_id: 'abc' },
      })
    ).toEqual({
      domain: 'homeassistant',
      service: 'reload_config_entry',
      data: { entry_id: 'abc' },
      target: undefined,
    });
  });

  it('returns undefined for missing or malformed action', () => {
    expect(parseAction(undefined)).toBeUndefined();
    expect(parseAction({})).toBeUndefined();
    expect(parseAction({ service: 'noscope' })).toBeUndefined();
  });
});

describe('deviceStorageKey', () => {
  it('derives a stable key from the light entities', () => {
    const key = deviceStorageKey([
      { light_entity: 'light.a' },
      { light_entity: 'light.b' },
    ]);
    expect(key).toBe('nanoleaf-card:light.a,light.b');
  });

  it('differs for different device sets', () => {
    const a = deviceStorageKey([{ light_entity: 'light.a' }]);
    const b = deviceStorageKey([{ light_entity: 'light.b' }]);
    expect(a).not.toBe(b);
  });
});

describe('clampIndex', () => {
  it('keeps a valid in-range index', () => {
    expect(clampIndex(2, 3)).toBe(2);
  });

  it('parses a numeric string', () => {
    expect(clampIndex('1', 3)).toBe(1);
  });

  it('falls back to 0 for out-of-range, missing, or junk', () => {
    expect(clampIndex(5, 3)).toBe(0);
    expect(clampIndex(-1, 3)).toBe(0);
    expect(clampIndex(null, 3)).toBe(0);
    expect(clampIndex('abc', 3)).toBe(0);
    expect(clampIndex(1.5, 3)).toBe(0);
  });
});

describe('hsFromWheel', () => {
  it('maps straight up to hue 0, full edge saturation', () => {
    const { h, s } = hsFromWheel(0, -65, 65);
    expect(h).toBeCloseTo(0);
    expect(s).toBeCloseTo(1);
  });

  it('maps right (3 o\'clock) to hue 90', () => {
    expect(hsFromWheel(65, 0, 65).h).toBeCloseTo(90);
  });

  it('maps down to hue 180 and left to hue 270', () => {
    expect(hsFromWheel(0, 65, 65).h).toBeCloseTo(180);
    expect(hsFromWheel(-65, 0, 65).h).toBeCloseTo(270);
  });

  it('centre has zero saturation; outside clamps to 1', () => {
    expect(hsFromWheel(0, 0, 65).s).toBe(0);
    expect(hsFromWheel(200, 0, 65).s).toBe(1);
  });
});

describe('wheelKnobPos', () => {
  it('is the inverse of hsFromWheel', () => {
    const pos = wheelKnobPos(90, 1, 65);
    expect(pos.x).toBeCloseTo(65);
    expect(pos.y).toBeCloseTo(0);
    const { h, s } = hsFromWheel(pos.x, pos.y, 65);
    expect(h).toBeCloseTo(90);
    expect(s).toBeCloseTo(1);
  });

  it('clamps saturation into the radius', () => {
    expect(wheelKnobPos(0, 2, 65).y).toBeCloseTo(-65);
    expect(wheelKnobPos(0, 0, 65)).toEqual({ x: 0, y: -0 });
  });
});

describe('valueFromPointer', () => {
  it('maps the track ends to min and max', () => {
    expect(valueFromPointer(0, 0, 100, 0, 100, 1)).toBe(0);
    expect(valueFromPointer(100, 0, 100, 0, 100, 1)).toBe(100);
  });

  it('snaps to the step and clamps out-of-bounds', () => {
    expect(valueFromPointer(53, 0, 100, 0, 100, 10)).toBe(50);
    expect(valueFromPointer(-20, 0, 100, 0, 100, 1)).toBe(0);
    expect(valueFromPointer(200, 0, 100, 0, 100, 1)).toBe(100);
  });
});

describe('valueFraction', () => {
  it('returns the clamped fill fraction', () => {
    expect(valueFraction(50, 0, 100)).toBe(0.5);
    expect(valueFraction(-5, 0, 100)).toBe(0);
    expect(valueFraction(150, 0, 100)).toBe(1);
  });

  it('returns 0 for a zero-width range', () => {
    expect(valueFraction(5, 5, 5)).toBe(0);
  });
});

const DETECT_HASS = {
  entities: {
    'light.panels': { platform: 'nanoleaf_reloaded' },
    'light.base_color': { platform: 'nanoleaf_reloaded' },
    'sensor.layout': { platform: 'nanoleaf_reloaded' },
    'sensor.panel_colors': { platform: 'nanoleaf_reloaded' },
    'select.pattern': { platform: 'nanoleaf_reloaded' },
    'number.brightness': { platform: 'nanoleaf_reloaded' },
    'number.spread': { platform: 'nanoleaf_reloaded' },
    'light.living_room': { platform: 'hue' },
  },
  states: {
    'light.panels': {},
    'light.base_color': {},
    'sensor.layout': {},
    'sensor.panel_colors': {},
    'select.pattern': {},
    'number.brightness': {},
    'number.spread': {},
    'light.living_room': {},
  },
};

describe('autoDetectDevice', () => {
  it('maps each integration entity to its field', () => {
    expect(autoDetectDevice(DETECT_HASS)).toEqual({
      light_entity: 'light.panels',
      color_entity: 'light.base_color',
      layout_sensor: 'sensor.layout',
      panel_colors_entity: 'sensor.panel_colors',
      pattern_entity: 'select.pattern',
      brightness_entity: 'number.brightness',
      spread_entity: 'number.spread',
    });
  });

  it('ignores entities from other integrations', () => {
    const cfg = autoDetectDevice(DETECT_HASS);
    expect(Object.values(cfg)).not.toContain('light.living_room');
  });

  it('returns all-empty fields for an empty hass', () => {
    expect(autoDetectDevice({})).toEqual({
      light_entity: '',
      color_entity: '',
      layout_sensor: '',
      panel_colors_entity: '',
      pattern_entity: '',
      brightness_entity: '',
      spread_entity: '',
    });
  });
});

const TWO_HASS = {
  entities: {
    'light.a_panels': { platform: 'nanoleaf_reloaded', device_id: 'A' },
    'light.a_base_color': {
      platform: 'nanoleaf_reloaded',
      device_id: 'A',
    },
    'select.a_pattern': {
      platform: 'nanoleaf_reloaded',
      device_id: 'A',
    },
    'number.a_spread': { platform: 'nanoleaf_reloaded', device_id: 'A' },
    'light.b_panels': { platform: 'nanoleaf_reloaded', device_id: 'B' },
    'select.b_pattern': {
      platform: 'nanoleaf_reloaded',
      device_id: 'B',
    },
    'number.b_spread': { platform: 'nanoleaf_reloaded', device_id: 'B' },
  },
  states: {
    'light.a_panels': {},
    'light.a_base_color': {},
    'select.a_pattern': {},
    'number.a_spread': {},
    'light.b_panels': {},
    'select.b_pattern': {},
    'number.b_spread': {},
  },
};

describe('autoDetectDevices', () => {
  it('groups into one device when there is no device_id', () => {
    const devices = autoDetectDevices(DETECT_HASS);
    expect(devices).toHaveLength(1);
    expect(devices[0].light_entity).toBe('light.panels');
  });

  it('splits entities into one config per controller', () => {
    const devices = autoDetectDevices(TWO_HASS);
    expect(devices).toHaveLength(2);
    const a = devices.find((d) => d.light_entity === 'light.a_panels');
    const b = devices.find((d) => d.light_entity === 'light.b_panels');
    expect(a.pattern_entity).toBe('select.a_pattern');
    expect(b.spread_entity).toBe('number.b_spread');
  });

  it('returns an empty array for an empty hass', () => {
    expect(autoDetectDevices({})).toEqual([]);
  });
});

describe('panelGeometry', () => {
  it('gives the right side count per shape', () => {
    expect(panelGeometry(8, 135).sides).toBe(3);
    expect(panelGeometry(9, 135).sides).toBe(3);
    expect(panelGeometry(7, 135).sides).toBe(6);
    expect(panelGeometry(2, 135).sides).toBe(4);
  });

  it('scales a mini triangle to about half a full one', () => {
    const full = panelGeometry(8, 135).radius;
    const mini = panelGeometry(9, 135).radius;
    expect(mini / full).toBeCloseTo(68 / 135, 2);
  });

  it('returns null for controller / power / unknown shapes', () => {
    expect(panelGeometry(12, 135)).toBeNull();
    expect(panelGeometry(5, 135)).toBeNull();
    expect(panelGeometry(99, 135)).toBeNull();
  });
});

describe('polygonPoints', () => {
  it('produces one point per side, apex up', () => {
    const pts = polygonPoints(100, 3).split(' ');
    expect(pts).toHaveLength(3);
    expect(pts[0]).toBe('0.00,-100.00');
  });

  it('applies the scale factor k', () => {
    const pts = polygonPoints(100, 3, 0.5).split(' ');
    expect(pts[0]).toBe('0.00,-50.00');
  });
});
