# Risk of Rain 2 Item Priority Board

A fast, browser-based item-priority board for Risk of Rain 2.

Organize items by dragging them between columns, customize your own column layout, and save everything locally in your browser.

## Features

- **Two view modes**: List View (traditional columns) and Tier List View (compact icon grid)
- **List View**:
  - Drag-and-drop item ranking inside and across columns
  - Add, rename, remove, and reorder columns
  - Safe column delete behavior (items auto-move to a fallback column)
- **Tier List View**:
  - Compact icon-based display for viewing many items on one screen
  - Drag-and-drop reordering within and across category rows
  - Drag category headers to reorder row layout (syncs back to List View)
  - Hover tooltips showing full item details
- **Common Features**:
  - Search by item name and description
  - Filter by rarity
  - Export and import your layout as JSON
  - Local icon loading and intelligent caching (zero repeated downloads)
  - Persistent state with browser localStorage
  - View preference saved and restored

## View Modes

### List View (Default)
The traditional column-based layout. Each column represents a priority category. Ideal for detailed examination and precise ordering.

**Controls:**
- Click "List View" button to switch to this view
- Drag items to reorder within and across columns
- Click ✎ to rename columns, 🗑 to remove columns

### Tier List View
A compact, icon-grid layout showing all items in category rows. Perfect for viewing the complete item list at once.

**Controls:**
- Click "Tier List View" button to switch to this view
- Drag icons to reorder items within rows and across rows
- Drag row headers (category names) on the left to reorder category rows
- Hover over icons to see detailed item information
- Category row order automatically syncs back to List View when you switch views

## Run Online (GitHub Pages)

https://tinusheystek.github.io/RiskOfRain2ItemApp/

## Run Locally

Clone the project and just run the index.html

## Project Structure

- [index.html](index.html): App shell and UI structure (includes view toggle buttons and tier list container)
- [styles.css](styles.css): Visual styling (includes both List View and Tier List View styles)
- [items.js](items.js): Item dataset and default categories
- [app.js](app.js): App logic including:
  - List View and Tier List View rendering
  - Drag-and-drop for both views
  - Icon preloading and caching system
  - Search and rarity filtering
  - State persistence to localStorage
  - View mode switching
- [assets/icons](assets/icons): Local item icon files (WebP format)

## Data and Persistence

- **App State**: Stored in browser localStorage with three keys:
  - `ror2-item-board-v1`: Items with their current order
  - `ror2-columns-v1`: Category/column configuration
  - `ror2-view-mode-v1`: Selected view mode (list or tierlist)
- **Export/Import**: JSON format includes both columns and items
- **Icon Caching**: All unique item icons are preloaded on page load and cached to prevent repeated downloads
- Import supports both new format (columns + items) and legacy format (items array only)

## Notes

- This is an unofficial fan project.
- Item names and descriptions are based on community wiki/game data references.
