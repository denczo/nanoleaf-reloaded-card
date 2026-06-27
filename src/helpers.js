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
  h = h % 360;
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

const REQUIRED_KEYS = [
  'light_entity',
  'color_entity',
  'layout_sensor',
  'panel_colors_entity',
  'pattern_entity',
  'brightness_entity',
  'spread_entity',
];

export function validateConfig(config, label) {
  const prefix = label ? `${label}: ` : '';
  for (const key of REQUIRED_KEYS) {
    if (!config[key]) {
      throw new Error(
        `nanoleaf-card: ${prefix}` +
        `missing required config key "${key}"`
      );
    }
  }
}

/**
 * Normalise a card config into a list of device objects.
 * Accepts either a `devices` array (multi-device) or the flat
 * seven-key single-device config — not both. Throws (naming the
 * device + key) on any missing required key, an empty `devices`
 * array, or both styles present at once.
 */
export function normalizeDevices(config) {
  const hasDevices = Array.isArray(config.devices);
  const hasFlat = REQUIRED_KEYS.some((k) => k in config);
  if (hasDevices && hasFlat) {
    throw new Error(
      'nanoleaf-card: use either "devices" or top-level entity ' +
      'keys, not both'
    );
  }
  if (hasDevices) {
    if (config.devices.length === 0) {
      throw new Error('nanoleaf-card: "devices" is empty');
    }
    config.devices.forEach((d, i) => {
      validateConfig(d, d.name || `devices[${i}]`);
    });
    return config.devices;
  }
  validateConfig(config);
  return [config];
}

/**
 * Stable localStorage key for a device list, so each distinct card
 * remembers its own selected device. Derived from the light
 * entities, which uniquely identify the configured devices.
 */
export function deviceStorageKey(devices) {
  return (
    'nanoleaf-card:' + devices.map((d) => d.light_entity).join(',')
  );
}

/**
 * Coerce a stored/raw index to a valid device index. Returns 0 for
 * anything missing, non-integer, or out of range.
 */
export function clampIndex(index, length) {
  const i = Number(index);
  if (!Number.isInteger(i) || i < 0 || i >= length) return 0;
  return i;
}

/**
 * A device is offline when its light_entity is absent from
 * hass.states or reports state "unavailable".
 */
export function isDeviceOffline(hass, device) {
  const st = hass?.states?.[device?.light_entity];
  return !st || st.state === 'unavailable';
}

/**
 * Split an HA action ({ service: "domain.svc", data?, target? })
 * into { domain, service, data, target } for callService.
 * Returns undefined if no usable service is given.
 */
export function parseAction(action) {
  if (!action || !action.service) return undefined;
  const dot = action.service.indexOf('.');
  if (dot === -1) return undefined;
  return {
    domain: action.service.slice(0, dot),
    service: action.service.slice(dot + 1),
    data: action.data,
    target: action.target,
  };
}

/**
 * Hue/saturation from a pointer offset relative to the colour
 * wheel centre. dx/dy are pixels from centre, radius the wheel
 * radius. 0deg points up, increasing clockwise (matches a
 * conic-gradient hue wheel). Returns { h: 0-360, s: 0-1 }.
 */
export function hsFromWheel(dx, dy, radius) {
  let h = (Math.atan2(dx, -dy) * 180) / Math.PI;
  if (h < 0) h += 360;
  const s = radius ? Math.min(1, Math.hypot(dx, dy) / radius) : 0;
  return { h, s };
}

/**
 * Knob centre offset (x, y px from the wheel centre) for a given
 * hue/saturation. Inverse of hsFromWheel.
 */
export function wheelKnobPos(h, s, radius) {
  const r = Math.min(1, Math.max(0, s)) * radius;
  const rad = (h * Math.PI) / 180;
  return { x: Math.sin(rad) * r, y: -Math.cos(rad) * r };
}

/**
 * Stepped, clamped slider value from a horizontal pointer.
 */
export function valueFromPointer(
  clientX, rectLeft, rectWidth, min, max, step
) {
  const t = rectWidth ? (clientX - rectLeft) / rectWidth : 0;
  const frac = Math.min(1, Math.max(0, t));
  const raw = min + frac * (max - min);
  const stepped = step ? Math.round(raw / step) * step : raw;
  return Math.min(max, Math.max(min, stepped));
}

/**
 * Fill fraction (0-1) of a slider value within [min, max].
 */
export function valueFraction(value, min, max) {
  if (max === min) return 0;
  return Math.min(1, Math.max(0, (value - min) / (max - min)));
}
