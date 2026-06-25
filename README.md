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

### Single device

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

### Multiple devices

Configure several controllers under `devices`; the card shows a
picker in its header and controls one device at a time. Each entry
takes the same seven keys plus an optional `name` and
`reconnect_action`. (The single-device form above still works.)
The card remembers your last-selected device per browser across
reloads.

```yaml
type: custom:nanoleaf-card
devices:
  - name: Living Room
    light_entity: light.nanoleaf_lr
    color_entity: light.nanoleaf_lr_base_color
    layout_sensor: sensor.nanoleaf_lr_layout
    panel_colors_entity: input_text.nanoleaf_lr_panel_colors
    pattern_entity: input_select.nanoleaf_lr_pattern
    brightness_entity: input_number.nanoleaf_lr_brightness
    spread_entity: input_number.nanoleaf_lr_spread
    reconnect_action:                 # optional
      service: homeassistant.reload_config_entry
      data: { entry_id: abc123 }
  - name: Office
    light_entity: light.nanoleaf_office
    color_entity: light.nanoleaf_office_base_color
    layout_sensor: sensor.nanoleaf_office_layout
    panel_colors_entity: input_text.nanoleaf_office_panel_colors
    pattern_entity: input_select.nanoleaf_office_pattern
    brightness_entity: input_number.nanoleaf_office_brightness
    spread_entity: input_number.nanoleaf_office_spread
```

## Offline handling

When a device's `light_entity` becomes `unavailable`, the card
shows an "unreachable" state instead of broken controls, and
returns to normal automatically when the device comes back. If a
`reconnect_action` is set for that device, a **Reconnect** button
calls it (any HA service — `homeassistant.reload_config_entry`,
a `script.*`, a `rest_command.*`, …). In the device picker, an
offline device is marked with `●`.

## Required HA helpers

| Entity | Type | Purpose |
|---|---|---|
| `sensor.nanoleaf_layout` | REST sensor | Panel positions |
| `input_text.nanoleaf_panel_colors` | Helper | Per-panel hex colours |
| `input_select.nanoleaf_pattern` | Helper | Solid/Linear/Radial/Rainbow |
| `input_number.nanoleaf_brightness` | Helper | Brightness 0–100 |
| `input_number.nanoleaf_spread` | Helper | Spread/radius |
