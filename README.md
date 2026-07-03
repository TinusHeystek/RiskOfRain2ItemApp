# Risk of Rain 2 Item Priority Board

A fast, browser-based item-priority board for Risk of Rain 2.

Organize items by dragging them between columns, customize your own column layout, and save everything locally in your browser.

## Features

- Drag-and-drop item ranking inside and across columns
- Search by item name and description
- Filter by rarity
- Add, rename, remove, and reorder columns
- Safe column delete behavior (items auto-move to a fallback column)
- Export and import your layout as JSON
- Local icon loading from project assets
- Persistent state with browser localStorage

## Run Online (GitHub Pages)

https://tinusheystek.github.io/RiskOfRain2ItemApp/

## Run Locally

Clone the project and just run the index.html

## Project Structure

- [index.html](index.html): App shell and UI structure
- [styles.css](styles.css): Visual styling
- [items.js](items.js): Item dataset and default categories
- [app.js](app.js): App logic (rendering, DnD, persistence, filters)
- [assets/icons](assets/icons): Local item icon files

## Data and Persistence

- All app state is stored in browser localStorage.
- Exported JSON includes both columns and items.
- Import supports both new format (columns + items) and legacy format (items array only).

## Notes

- This is an unofficial fan project.
- Item names and descriptions are based on community wiki/game data references.
