

# Add Control Panel Buttons to Right Zone

## Overview
Add five new control buttons to the right zone of the cockpit interface: **Start**, **Stop**, **Infrared**, **Sonar**, and **Autopilot**. These buttons will be positioned below the existing E-STOP and AUTO buttons, following the Mercedes AMG F1 design aesthetic with proper visual hierarchy.

## Visual Layout

```text
+---------------------------+
|          GEAR             |
+---------------------------+
|   S   3   2   1   N   R   |
+---------------------------+
|     LIVE TELEMETRY        |
+---------------------------+
|        E-STOP             |
+---------------------------+
|       AUTO OFF            |
+---------------------------+
|                           |
|   INFRARED    SONAR       |  <- Middle section
|       AUTOPILOT           |     (sensor toggles)
|                           |
+---------------------------+
|   START      STOP         |  <- Bottom section
+---------------------------+     (power controls)
```

## Button Design Specifications

### Sensor Toggles (Middle Section)
- **Infrared**: Toggle button with Eye icon, amber/orange accent color when active
- **Sonar**: Toggle button with Radio icon, cyan/blue accent color when active  
- **Autopilot**: Toggle button with Navigation icon, teal (primary) glow when active

### Power Controls (Bottom Section)
- **Start**: Circular/rounded button with Play icon, green color with pulse animation when active
- **Stop**: Circular/rounded button with Square icon, red color matching the destructive theme

## Technical Implementation

### 1. Update GearShifter Props Interface
Add new props for the additional control states and handlers:
- `isInfraredOn`, `onInfraredToggle`
- `isSonarOn`, `onSonarToggle`  
- `isAutopilotOn`, `onAutopilotToggle`
- `isStarted`, `onStart`, `onStop`

### 2. Update GearShifter.tsx Component
- Import additional Lucide icons: `Play`, `Square`, `Eye`, `Radio`, `Navigation`
- Add middle section with 2x2 grid layout for Infrared, Sonar, and Autopilot buttons
- Add bottom section with side-by-side Start and Stop buttons
- Style buttons with:
  - Carbon fiber backgrounds (`bg-card`)
  - Glowing borders when active
  - Consistent sizing: `h-[3.5dvh]` for sensor toggles, `h-[4dvh]` for power buttons
  - Touch feedback class for press animations
  - Racing text typography

### 3. Update CockpitController.tsx
- Add new state variables:
  - `isInfraredOn: boolean`
  - `isSonarOn: boolean`
  - `isAutopilotOn: boolean`
  - `isStarted: boolean`
- Create handler callbacks for each toggle/button
- Wire up `sendCommand` calls to communicate with Flask backend
- Pass new props to `GearShifter` component

### 4. Visual Styling Details

| Button | Icon | Inactive State | Active State |
|--------|------|----------------|--------------|
| Start | Play | Green border, dark bg | Solid green, pulse glow |
| Stop | Square | Red border, dark bg | Solid red |
| Infrared | Eye | Amber border, dark bg | Solid amber, glow |
| Sonar | Radio | Cyan border, dark bg | Solid cyan, glow |
| Autopilot | Navigation | Teal border, dark bg | Solid teal, glow |

### 5. Add Custom CSS (if needed)
Add glow utilities for new colors:
- `glow-green` for Start button
- `glow-amber` for Infrared
- `glow-cyan` for Sonar

## Files to Modify
1. **src/components/cockpit/GearShifter.tsx** - Add new buttons with layout
2. **src/components/cockpit/CockpitController.tsx** - Add states and handlers
3. **src/index.css** - Add new glow utility classes

## Sizing Considerations
The right zone has limited vertical space (`flex-[0.25]`). The layout will use:
- Compact button heights (`3.5-4dvh`)
- Minimal gaps (`gap-0.5`)
- Flex layout with `justify-between` to distribute buttons evenly
- The Start/Stop buttons anchored to the bottom using `mt-auto`

