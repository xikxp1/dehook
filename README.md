# DeHook

A Chrome extension to limit YouTube usage by hiding distracting elements. Features password-protected settings that auto-revert to restrictive defaults after a configurable time.

Inspired by [Unhook](https://chromewebstore.google.com/detail/unhook-remove-youtube-rec/khncfooichmfjbepaaaebmommgaepoid).

## Features

### Element Hiding
- **Feed & Recommendations**: Hide home feed, sidebar recommendations, and redirect home to subscriptions
- **Shorts**: Hide all Shorts content and navigation
- **Comments**: Hide comment sections
- **Video Elements**: End screens, end cards, playlists, merch, fundraisers
- **Navigation**: Hide trending, explore sections, notifications
- **Playback**: Disable autoplay and annotations

### Protection
- **Password Lock**: Protect settings with a password (PBKDF2 hashed)
- **Auto-Revert**: Settings automatically reset to restrictive defaults after a configurable timer
- **Quick Toggles**: Popup for fast access to common settings

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   bun install
   ```
3. Build the extension:
   ```bash
   bun run build
   ```
4. Open Chrome and navigate to `chrome://extensions`
5. Enable "Developer mode"
6. Click "Load unpacked" and select the `dist/` folder

## Development

```bash
# Build with watch mode
bun run dev

# Production build
bun run build

# Format code
bun run format
```

## Usage

1. Click the extension icon for quick toggles
2. Right-click the icon and select "Options" for full settings
3. Set a password to lock settings
4. Configure auto-revert timer to automatically restore restrictive settings

## Project Structure

```
src/
├── background/    # Service worker (timer, messaging)
├── content/       # Content scripts (CSS injection)
├── popup/         # Quick toggle interface
├── options/       # Full settings page
└── shared/        # Types, constants, crypto utilities
```

## Tech Stack

- Chrome Extension Manifest V3
- TypeScript
- Bun (build/bundling)
- Biome (linting/formatting)
