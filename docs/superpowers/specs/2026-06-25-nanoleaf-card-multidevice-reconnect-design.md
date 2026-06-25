# Nanoleaf Card — Multi-Device + Connection Resilience

**Date:** 2026-06-25
**Status:** Approved
**Builds on:** 2026-06-04-nanoleaf-hacs-card-design.md (v1)

## Overview

Two related enhancements to the standalone `nanoleaf-card`:

1. **Multi-device** — one card drives several Nanoleaf controllers,
   one at a time, via an in-card device picker (Approach B).
2. **Connection resilience** — the card detects when the active
   device is offline, shows a clear disconnected state instead of
   broken controls, auto-recovers when it returns, and offers a
   reconnect button wired to a configurable HA service.

The two are coupled: each device can be independently offline, so
the picker surfaces per-device availability and the disconnected
state always reflects the *active* device.

## Scope

- In-card device selector (2–3 devices, explicit config)
- Backward-compatible flat single-device config
- Per-device offline detection + disconnected UI
- Auto-recover on entity return
- Reconnect button → configurable `reconnect_action`
- Offline marker per device in the picker

Out of scope: auto-discovery of devices (rejected — fragile);
the card talking to the controller directly (it stays HA-only);
publishing card/ambileaf status back to HA.

## Config schema

New `devices` array; each entry is the v1 seven-key set plus an
optional `name` and `reconnect_action`:

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
    # ...same seven keys
```

### Backward compatibility

The current flat config (seven keys at top level, no `devices`)
still validates. It is normalised internally to a single-device
list with no `name`; the picker is hidden when there is one device.

`setConfig()` accepts exactly one of: a `devices` array (≥1 entry)
OR the flat seven keys. It throws a clear error if both or neither
are present, or if any device is missing a required key (naming the
device and key).

## Device selector

- Rendered in the card header only when `devices.length > 1`.
- A compact dropdown (scales past 3 better than tabs).
- Selecting a device sets `_activeIndex` and re-renders; the card
  controls exactly that one device.
- Each option shows the device `name` (fallback: the `light_entity`
  id) and a small `●` offline marker when that device's
  `light_entity` state is `unavailable`.
- `_activeIndex` defaults to 0 and is held in component state (not
  persisted across reloads in v1).

## Connection resilience

### Detection

The active device is **disconnected** when its `light_entity` is
absent from `hass.states` or its state is `unavailable`. (HA reports
`unavailable` for entities of an offline device.)

### Disconnected UI

- The SVG panel area and controls are replaced by a centered
  disconnected panel: a warning glyph + "‹device name› unreachable".
- If `reconnect_action` is configured for the device, a **Reconnect**
  button is shown below; otherwise no button.
- Styling uses the existing HA CSS vars; the card keeps its normal
  size to avoid layout jump.

### Auto-recover

No explicit polling. The card already re-renders on every `hass`
update (`set hass` → `requestUpdate()`), so when the entity returns
to a real state the normal controls render again automatically.

### Reconnect button

On click → `_callService()` with the device's `reconnect_action`
(`service` split into `domain`/`service`, plus optional `data` and
`target`). Any HA service works: `homeassistant.reload_config_entry`,
a `script.*`, a `rest_command.*`, etc. The button does not assume
success — recovery is observed via the entity returning to normal.

## Component changes

- `setConfig()` — normalise to a `devices` list; validate each.
- New `_activeIndex` state + `_activeDevice` getter.
- `render()` — branch: picker (if >1) → if active device offline,
  disconnected panel; else the existing v1 controls bound to the
  active device's entities.
- All existing handlers (`_togglePower`, `_onColorChanged`,
  `_selectPattern`, brightness/spread) read entity ids from
  `_activeDevice` instead of flat config fields.
- New helpers (pure, unit-tested):
  - `normalizeDevices(config)` → `{devices: [...]}` or throws
  - `isDeviceOffline(hass, device)` → boolean
  - `parseAction(reconnect_action)` → `{domain, service, data,
    target}` for `callService`

## Testing

- `normalizeDevices` — flat→single, devices array passthrough,
  missing-key error names device+key, both/neither error.
- `isDeviceOffline` — missing entity, `unavailable`, normal state.
- `parseAction` — `domain.service` split, optional data/target,
  undefined input.
- Existing v1 helper tests stay green.
- Component render branches verified manually in HA (offline state,
  picker switching, reconnect call) — no DOM test harness in v1.

## Build / distribution

Unchanged from v1: Rollup IIFE to `dist/nanoleaf-card.js`, committed
for HACS to serve. README updated with the `devices` schema,
`reconnect_action`, and the offline behavior.
