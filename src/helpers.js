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
