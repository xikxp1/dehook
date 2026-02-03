export const SELECTORS = {
  homeFeed: [
    'ytd-browse[page-subtype="home"] ytd-rich-grid-renderer',
    'ytd-browse[page-subtype="home"] #contents',
    'ytd-mini-guide-entry-renderer:has(a[title="Home"])',
    'ytd-guide-entry-renderer:has(a[title="Home"])',
  ],
  sidebar: [
    "#secondary",
    "#related",
    "ytd-watch-next-secondary-results-renderer",
  ],
  recommended: ["ytd-compact-video-renderer", "ytd-compact-radio-renderer"],
  liveChat: ["#chat-container", "ytd-live-chat-frame"],
  playlist: ["ytd-playlist-panel-renderer"],
  fundraiser: ["ytd-donation-shelf-renderer"],
  endScreen: [".ytp-ce-element", ".ytp-endscreen-content"],
  endCards: [".ytp-cards-button", ".ytp-ce-element"],
  shorts: [
    "ytd-reel-shelf-renderer",
    "ytd-rich-shelf-renderer[is-shorts]",
    "ytd-shorts",
    'ytd-mini-guide-entry-renderer a[title="Shorts"]',
    'ytd-guide-entry-renderer a[title="Shorts"]',
  ],
  comments: ["#comments", "ytd-comments"],
  profilePhotos: ["#comments #author-thumbnail", "#comments yt-img-shadow"],
  mixes: ["ytd-radio-renderer", '[href*="&list=RD"]'],
  merch: [
    "ytd-merch-shelf-renderer",
    "ytd-offer-module-renderer",
    "ytd-ticket-shelf-renderer",
  ],
  videoInfo: ["#above-the-fold", "#below"],
  buttonsBar: ["#top-level-buttons-computed", "#menu-container"],
  channel: ["#owner", "ytd-video-owner-renderer"],
  description: ["#description", "ytd-text-inline-expander"],
  header: ["#masthead-container", "ytd-masthead"],
  notifications: [
    "ytd-notification-topbar-button-renderer",
    "#notification-button",
  ],
  inaptSearch: [
    "ytd-search ytd-shelf-renderer:not([is-shorts])",
    "ytd-search ytd-horizontal-card-list-renderer",
  ],
  trending: [
    'ytd-guide-entry-renderer a[href="/gaming"]',
    'ytd-guide-entry-renderer a[href*="/channel/UCEgdi0XIXXZ-qJOFPf4JSKw"]',
    'ytd-guide-entry-renderer a[href*="/channel/UC-9-kyTW8ZkZNDHQJ6FgpwQ"]',
    '#guide a[href*="/feed/explore"]',
    '#guide a[href*="/feed/trending"]',
  ],
  moreYouTube: [
    'ytd-guide-entry-renderer a[href="/premium"]',
    'ytd-guide-entry-renderer a[href*="studio.youtube.com"]',
    'ytd-guide-entry-renderer a[href*="music.youtube.com"]',
    'ytd-guide-entry-renderer a[href*="youtubekids.com"]',
  ],
  subscriptions: [
    '#guide a[href*="/feed/subscriptions"]',
    'ytd-mini-guide-entry-renderer a[href*="/feed/subscriptions"]',
  ],
  mostRelevant: [
    'ytd-browse[page-subtype="subscriptions"] ytd-horizontal-card-list-renderer[card-list-style="HORIZONTAL_CARD_LIST_STYLE_TYPE_CHANNEL_SHELF"]',
  ],
  autoplay: [".ytp-autonav-toggle-button"],
} as const;

export type SelectorKey = keyof typeof SELECTORS;
