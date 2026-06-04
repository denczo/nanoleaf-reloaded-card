# Nanoleaf HACS Card — Design Spec

**Date:** 2026-06-04
**Status:** Approved

## Overview

A standalone custom Lovelace card for Home Assistant, distributed via
HACS. Replaces the existing multi-card YAML stack (stack-in-card,
html-template-card, light-entity-card, button-card, mushroom-number-card,
card_mod) with a single self-contained LitElement component. No HACS
card dependencies at runtime.

## Scope

Port the existing card's features exactly — no new features in v1:

- SVG panel layout renderer (triangles at real physical positions)
- Power toggle button overlaid on the SVG
- Color wheel (base color)
- Pattern selector: Solid / Linear / Radial / Rainbow
- Brightness slider
- Spread slider

Click-to-color per-panel editing is out of scope for v1 (planned v2).

## Architecture

### File: `nanoleaf-card.js`

Single bundled JS file served from HA's `www/` directory. Registered as
a custom element `nanoleaf-card`.

```
nanoleaf-card/
├── src/
│   └── nanoleaf-card.js   ← source
├── dist/
│   └── nanoleaf-card.js   ← built output (committed, served by HA)
├── hacs.json
└── README.md
```

### LitElement component

```
class NanoleafCard extends LitElement
  setConfig(config)       validates + stores entity IDs
  set hass(hass)          stores hass, calls requestUpdate()
  render()                shadow DOM: SVG + controls
  _renderSVG()            builds SVG string from positionData
  _callService(domain, service, data)   thin wrapper
```

`render()` re-runs on every `hass` update. LitElement diffs the shadow
DOM so only changed nodes are touched.

## Entity configuration

All entity IDs are configured in the card's YAML:

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

`setConfig()` throws if any required key is missing, which surfaces a
clear error card in HA's UI.

## SVG panel renderer

Reads `sensor.nanoleaf_layout` attributes:
- `positionData` — array of `{panelId, x, y, o, shapeType}`
- `sideLength` — mm per side

Filters to `shapeType === 8` (triangles; skips controller square = 7).

**Geometry (direct JS port of existing Jinja math):**

```
rad = sideLength / 1.732
k   = 0.75
padx = sideLength / 1.5
pady = sideLength / 6

viewBox: minx=(0 - max(xs)) - padx  to  maxx=(0 - min(xs)) + padx
         miny=min(ys) - pady         to  maxy=max(ys) + pady

per panel:
  transform="translate(-p.x, p.y) rotate(180 - p.o)"
  polygon points: 0,-(rad*k)  -(s/2*k),(rad/2)*k  (s/2*k),(rad/2)*k
```

**Color resolution:**

Reads `input_text.nanoleaf_panel_colors` state — format:
`"panelId:rrggbb,panelId:rrggbb,..."`.

Per panel:
- Parse hex → r, g, b
- If light is off OR maxChannel === 0 → fill = `rgb(77,77,77)` (dim)
- Otherwise → normalize: scale = 255 / maxChannel, fill =
  `rgb(r*scale, g*scale, b*scale)` (saturated at full brightness)

SVG is rendered with `pointer-events: none` in v1. Panel `<g>` elements
are individually addressable by `data-panel-id` for v2 click support.

## Controls

### Power toggle
- Icon button overlaid on SVG (z-index above)
- Reads `light.nanoleaf` state for on/off color
- On tap → `light.toggle` on `light_entity`

### Color wheel
- Uses HA's built-in `<ha-color-picker>` element (globally registered
  by HA frontend before any custom card loads)
- Reads current rgb from `light.nanoleaf_base_color` state attribute
  `rgb_color` (array `[r, g, b]`)
- On change → `light.turn_on` with `rgb_color` on `color_entity`

### Pattern buttons (Solid / Linear / Radial / Rainbow)
- Native `<button>` elements with CSS vars for theming
- Active state: button whose value matches
  `input_select.nanoleaf_pattern` state gets
  `color: var(--primary-color); font-weight: bold`
- On click → `input_select.select_option` on `pattern_entity`

### Brightness + Spread sliders
- `<input type="range">` elements
- Min / max / step read from entity attributes
  (`min`, `max`, `step` on the `input_number` entity)
- On input → `input_number.set_value`, debounced 150ms to avoid
  flooding HA with service calls

## Styling

All styles in shadow DOM via `static styles = css\`...\``. Uses HA CSS
custom properties (`--primary-color`, `--secondary-text-color`,
`--card-background-color`, etc.) so it inherits the active theme.
Card padding and border-radius match HA's default `ha-card` appearance.

## Build toolchain

- **Bundler:** Rollup with `@rollup/plugin-node-resolve`
- **Output:** `dist/nanoleaf-card.js` — single IIFE, no dynamic imports
- **Dev loop:** `npm run build` → copy `dist/nanoleaf-card.js` to HA's
  `www/` folder → hard-refresh browser
- `dist/nanoleaf-card.js` is committed to the repo so HACS can serve it
  directly without a build step on install

## HACS distribution

```json
{
  "name": "Nanoleaf Card",
  "render_readme": true,
  "content_in_root": false,
  "filename": "dist/nanoleaf-card.js"
}
```

Install options (in priority order):
1. **HACS custom repo** — add GitHub repo URL in HACS → Frontend,
   installs `dist/nanoleaf-card.js` and registers the resource
2. **Manual** — copy `dist/nanoleaf-card.js` to
   `config/www/nanoleaf-card.js`, add resource in
   Settings → Dashboards → Resources

For a private homelab repo, option 2 is the simplest path initially.

## Out of scope (v2+)

- Click-to-color: enable `pointer-events` on panel `<g>` elements,
  open a color picker popover on click, write result back to
  `input_text.nanoleaf_panel_colors` and call
  `rest_command.nanoleaf_display_static`
- Effect picker (effect_list from HA Nanoleaf integration)
- HACS submission to public catalogue
