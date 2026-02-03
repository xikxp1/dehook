# DeHook Implementation Plan

Chrome extension to limit YouTube usage with password-protected settings and auto-revert timer.

## Current Status

- [x] Phase 1: Project Setup
- [x] Phase 2: Core Element Hiding
- [x] Phase 3: Settings & Storage
- [x] Phase 4: Popup UI
- [x] Phase 5: Password Protection
- [x] Phase 6: Auto-Revert Timer
- [x] Phase 7: Options Page
- [x] Phase 8: Polish (testing, icons)

## Project Structure

```
dehook/
├── dist/                    # Build output (load in Chrome)
├── src/
│   ├── background/index.ts  # Service worker
│   ├── content/
│   │   ├── index.ts         # CSS injection
│   │   ├── selectors.ts     # YouTube selectors
│   │   └── styles/youtube.css
│   ├── popup/               # Quick toggles UI
│   ├── options/             # Full settings page
│   └── shared/
│       ├── types.ts
│       ├── constants.ts
│       └── crypto.ts        # PBKDF2 hashing
├── scripts/build.ts
└── public/icons/
```

## Commands

- `bun run build` - Production build to dist/
- `bun run dev` - Development build with watch
- `bun run format` - Lint and format

## Testing Checklist

1. Load unpacked extension from `dist/` in Chrome
2. Navigate to youtube.com
3. Verify elements are hidden based on settings
4. Test popup quick toggles
5. Set a password in options
6. Verify settings are locked
7. Test unlock with correct/incorrect password
8. Set short timer (1 min) and verify auto-revert
9. Test all hiding options work correctly

## Remaining Work

### Icons ✓
- Source icon: `public/icons/i1024px.png`
- Build script auto-generates 16, 32, 48, 128px using `sharp`

### CSS Selectors ✓
- Tested selectors on live YouTube via Playwright (Feb 2026)
- Updated selectors.ts with verified selectors:
  - Shorts: Added mini-guide and guide entry selectors for sidebar Shorts link
  - Trending/Explore: Updated to target Gaming, Sports, Music channel links
  - More from YouTube: Updated to target Premium, Studio, Music, Kids links
  - Subscriptions: Added mini-guide entry selector
  - Home Feed: Added sidebar home button selectors (mini-guide and guide entry)

### Edge Cases
- ~~Handle YouTube SPA navigation~~ ✓ (added `yt-navigate-finish` event listener)
- Test on different YouTube pages (home, watch, shorts, search)

### Selector Testing Notes (Feb 2026)
Elements found on YouTube pages:
- Homepage: 37 shorts links, 4 ad slots, 2 shorts shelf sections
- Video page: 19 comment threads, 20 author thumbnails, sidebar with recommendations
- Sidebar sections: Explore (Music, Gaming, Sports), More from YouTube (Premium, Studio, Music, Kids)

### Extension Test Results ✓
Tested with Playwright + extension loaded:
- Homepage: Shorts link hidden (1 total, 0 visible), mini-guide Shorts hidden
- Video page: Sidebar hidden (2 total, 0 visible), comments hidden, 31 shorts links hidden
- Test script: `bun run scripts/test-extension.ts`

### Bug Fixes (Feb 2026)
- **Subscriptions page fix**: Removed overly broad shorts selectors that hid content on subscriptions page
  - Removed `[is-shorts]` - was hiding any element with is-shorts attribute
  - Removed `a[href*="/shorts/"]` - was hiding all links to shorts videos
  - Shorts hiding now only targets shelf sections and sidebar navigation, not individual videos in feeds
- **Subscriptions page fix #2**: Scoped inaptSearch selectors to search pages only
  - `ytd-shelf-renderer:not([is-shorts])` was hiding the "Latest" section on subscriptions page
  - Changed to `ytd-search ytd-shelf-renderer:not([is-shorts])` to only affect search results
  - Same fix applied to `ytd-horizontal-card-list-renderer`
- **Redirect not working on SPA navigation**: Added `yt-navigate-finish` event listener
  - YouTube uses client-side navigation (SPA), so clicking the logo doesn't trigger page reload
  - Added listener for YouTube's custom `yt-navigate-finish` event to detect navigation
  - Redirect to subscriptions now works when clicking YouTube logo or Home button

### New Features (Feb 2026)
- **Hide Most Relevant**: Added setting to hide "Most relevant" section on subscriptions page
  - Targets `ytd-horizontal-card-list-renderer[card-list-style="HORIZONTAL_CARD_LIST_STYLE_TYPE_CHANNEL_SHELF"]`
  - Also targets new `ytd-rich-section-renderer:has(ytd-rich-shelf-renderer:not([is-shorts]))` format
  - Scoped to subscriptions page only using `ytd-browse[page-subtype="subscriptions"]`
  - Default: enabled (hidden)
