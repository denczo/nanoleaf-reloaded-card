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
