# Canvas Studio

A working local visual website editor inspired by the workflows of modern design tools. This is an independent implementation, with no Framer source code or private APIs.

## Run

Requires Node.js 18 or newer. No dependencies are needed to run the editor.

```powershell
cd C:\Users\User\Desktop\web_dev_api\AI\framer
node server.mjs
```

Open **http://127.0.0.1:4173**. You can also double-click `start.cmd`. Keep its terminal open while editing. To use a different port, set the `PORT` environment variable before starting.

## Included

- Canvas: select, multi-select, drag, resize, snapping, zoom, pan, alignment, and keyboard nudging.
- Nested layers: reorder, nest, group/ungroup, hide, lock, rename, duplicate, copy/paste, and arrange front/back.
- Design inspector: dimensions, position, rotation, fills and gradients, opacity, borders, shadows, radius, fonts, text, semantics, clipping, and links.
- Direct text editing: double-click text on the canvas; Escape cancels and Ctrl+Enter commits.
- Responsive layouts: desktop base styles with tablet and mobile property overrides; reset overrides per layer.
- Pages: create, duplicate, rename, slug, delete, and link between pages in the exported site.
- Reusable components: save frames/layers, insert instances, update all instances, and detach.
- Images: local uploads, image URLs, alt text, reusable asset library.
- CMS: collections, text fields, records, inline editing, CSV export, and canvas collection bindings.
- Local assistant: deterministic commands that edit the real document and participate in undo/redo.
- Ready-to-edit hero, features, pricing, contact, and footer sections.
- Preview: working website preview at desktop, tablet, and mobile widths; on-load animations and page/anchor navigation.
- Export: standalone HTML with all pages, responsive CSS, embedded uploaded images, CMS content, and site metadata.
- Persistence: local browser autosave, JSON project export/import, and undo/redo.

## Try the assistant

Open **Assistant** in the right panel. Supported examples:

```text
Create a landing page for a design studio
Add a features section
Create page About
Add text "Something extraordinary"
Set selected text to "Make it yours"
Set font size to 64
Set color to #8b5cf6
Set radius to 24
Move selected to 80, 200
Resize selected to 480 x 160
Make the background #111827
Use dark theme
Center selected
Duplicate selected
Undo
help
```

Commands operate on the active page and breakpoint. Select a layer for targeted edits. Unknown commands explain what is supported and leave the document unchanged. Landing-page generation uses editable local templates, rather than a language model.

## Important limits

This delivers the core editor, rather than full Framer parity. It does not include Framer's proprietary engine, production hosting/custom domains, account management, cloud storage, real-time collaboration, advanced constraint/flex/grid layout, animation timelines, external code components, CMS detail-page routing, or a language-model connection. Stack buttons arrange children once; they do not create a continuously reflowing flex layout.

The contact form is exported but needs a submission service before it can send messages. Preview states this explicitly. Uploaded images are stored with the project in browser localStorage; the browser's storage quota limits project size. Each uploaded image is capped at 3 MB. Export regular JSON backups. Data is scoped to the browser and origin, so changing the port uses a separate local project store.

## Shortcuts

| Action | Shortcut |
|---|---|
| Select / pan | V / H or hold Space |
| Add text / frame | T / F |
| Undo / redo | Ctrl+Z / Ctrl+Shift+Z |
| Duplicate | Ctrl+D |
| Group / ungroup | Ctrl+G / Ctrl+Shift+G |
| Multi-select | Shift+click |
| Copy / paste | Ctrl+C / Ctrl+V |
| Nudge | Arrow keys; Shift for 10px |
| Fit canvas | 1 |
| Preview | Ctrl+Enter |
| Save JSON backup | Ctrl+S |
| Delete | Delete |

Drag layer rows to reorder; hold Alt when dropping onto a frame to nest. Right-click canvas layers for more actions. The editor uses base absolute positioning and manual responsive overrides, so inspect all breakpoints before exporting.

## Verify

```powershell
npm test
```

For browser integration checks, install development dependencies with `npm install`, start the server in a separate terminal, and run:

```powershell
node tests/browser-check.mjs
node tests/browser-extended.mjs
```

Browser checks use an installed Google Chrome. They use isolated temporary browser contexts, so they do not alter the project saved in your normal browser.

## Files

`model.js` holds the document model, history, validation, and export. `commands.js` implements local editing commands. `app.js` implements the editor UI. `server.mjs` serves these files on loopback only. `styles.css` and `index.html` define the interface.
