# MolTeacher — Molecular Studio

A React + Vite classroom molecular viewer rebuilt from the original single-file HTML app. The workspace is split into React components, reusable view templates, chemistry data, and the 3D/interaction engine.

## Run locally

```bash
npm install
npm run dev
```

Create a production build with `npm run build`; serve it with `npm run preview`.

## Included

- PubChem name search with 3D-to-2D fallback, plus nine built-in molecule presets.
- Interactive 3D and 2D views, mouse/touch pan, zoom and rotate, atom labels, element color controls, and bond-order editing.
- A reaction-equation editor with live chemical subscript formatting, editable coefficients, and a saved equation callout in the workspace.
- Separate settings and export dialogs for theme/background, label typography, and SVG/PNG downloads.
- Persistent preferences, responsive layout, keyboard shortcuts, reduced-motion support, and bundled Three.js/KaTeX (no visualization CDNs).

## Visual system

The default dark surfaces use the sampled Claude-style neutrals from the supplied reference: `#151515`, `#1f1f1f`, `#242424`, `#2c2c2c`, and `#363636`. The supplied SVG palette is used for element and bond colors, including blue `#4682D5` / `#3266AD`, red `#B53333` / `#DD5353`, green `#437426` / `#5A9130`, and ochre `#A87829` / `#D19E41`. Saturated colors are reserved for molecule meaning and restrained focus states; controls and surfaces stay neutral.

Typography uses system sans-serif defaults, with optional rounded sans or serif atom labels. The UI does not use a monospaced typeface.

## Ideas for a next iteration

- A stoichiometric balancing assistant that explains each balancing step.
- Classroom presentation mode with guided highlights, saved snapshots, and lesson annotations.
- A compare workspace for side-by-side molecules, intermolecular distances, and atom selection.
- More robust 2D layouts sourced directly from PubChem records for large or non-planar compounds.
