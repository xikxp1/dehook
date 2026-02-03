# DeHook

Chrome extension to limit YouTube usage with password-protected settings that auto-revert.

Consult @docs/PLAN.md before every task. Update @docs/PLAN.md after every change to keep it up-to-date.

## Tech Stack

- Chrome Extension (Manifest V3)
- TypeScript
- Bun for building/bundling

## Project Structure

```
src/
├── background/    # Service worker
├── content/       # Content scripts for YouTube
├── popup/         # Extension popup UI
└── options/       # Settings page
docs/
└── settings.html  # Reference Unhook settings
```

## Commands

Always use `bun` instead of `npm`.

Use `bun add <package>` to add new dependencies, avoid editing `package.json` manually.

- `bun run dev` - Build with watch mode
- `bun run build` - Production build
- `bun run format` - Run linter and formatter

Always use `bun format` after making changes.

Use code simplifier skill after initial implementation.

## Development Workflow

1. Load unpacked extension from `dist/` in Chrome
2. Use Chrome DevTools to inspect YouTube pages

## Key Features

- Hide YouTube recommendations, shorts, comments, etc.
- Password protection for settings changes
- Auto-revert settings to restrictive defaults after configurable time
- Settings stored in chrome.storage.local

## Domain Terms

- **Auto-revert**: Timer that resets settings to default restrictive state
- **Protected settings**: Settings that require password to modify
