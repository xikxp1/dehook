import { DEFAULT_APP_SETTINGS, STORAGE_KEY } from "../shared/constants.ts";
import type { AppSettings, HidingSettings } from "../shared/types.ts";
import { SELECTORS, type SelectorKey } from "./selectors.ts";

const SETTING_TO_SELECTOR: Record<keyof HidingSettings, SelectorKey | null> = {
  hideFeed: "homeFeed",
  redirectToSubscriptions: null,
  hideSidebar: "sidebar",
  hideRecommended: "recommended",
  hideChat: "liveChat",
  hidePlaylists: "playlist",
  hideFundraiser: "fundraiser",
  hideEndScreen: "endScreen",
  hideEndCards: "endCards",
  hideShorts: "shorts",
  hideComments: "comments",
  hideProfilePhotos: "profilePhotos",
  hideMixes: "mixes",
  hideMerch: "merch",
  hideVideoInfo: "videoInfo",
  hideButtonsBar: "buttonsBar",
  hideChannel: "channel",
  hideDescription: "description",
  hideHeader: "header",
  hideNotifications: "notifications",
  hideInaptSearch: "inaptSearch",
  hideTrending: "trending",
  hideMoreYouTube: "moreYouTube",
  hideSubscriptions: "subscriptions",
  hideMostRelevant: "mostRelevant",
  disableAutoplay: "autoplay",
  disableAnnotations: null,
};

let styleElement: HTMLStyleElement | null = null;
let currentSettings: AppSettings = DEFAULT_APP_SETTINGS;

function generateCSS(settings: AppSettings): string {
  if (!settings.enabled) return "";

  const rules: string[] = [];
  const hiding = settings.hiding;

  for (const [settingKey, selectorKey] of Object.entries(SETTING_TO_SELECTOR)) {
    if (!selectorKey) continue;

    const isEnabled = hiding[settingKey as keyof HidingSettings];
    if (isEnabled && SELECTORS[selectorKey]) {
      const selectors = SELECTORS[selectorKey];
      rules.push(`${selectors.join(", ")} { display: none !important; }`);
    }
  }

  return rules.join("\n");
}

function applyStyles(settings: AppSettings) {
  const css = generateCSS(settings);

  if (!styleElement) {
    styleElement = document.createElement("style");
    styleElement.id = "dehook-styles";
    (document.head || document.documentElement).appendChild(styleElement);
  }

  styleElement.textContent = css;
}

function handleRedirect(settings: AppSettings) {
  if (
    settings.enabled &&
    settings.hiding.hideFeed &&
    settings.hiding.redirectToSubscriptions
  ) {
    const isHomePage =
      window.location.pathname === "/" ||
      window.location.pathname === "/feed/home";
    if (isHomePage) {
      window.location.replace("https://www.youtube.com/feed/subscriptions");
    }
  }
}

function handleAutoplay(settings: AppSettings) {
  if (settings.enabled && settings.hiding.disableAutoplay) {
    const disableAutoplayToggle = () => {
      const toggle = document.querySelector(
        ".ytp-autonav-toggle-button",
      ) as HTMLElement | null;
      if (toggle && toggle.getAttribute("aria-checked") === "true") {
        toggle.click();
      }
    };

    disableAutoplayToggle();

    const observer = new MutationObserver(() => {
      disableAutoplayToggle();
    });
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }
}

async function init() {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  currentSettings =
    (result[STORAGE_KEY] as AppSettings) || DEFAULT_APP_SETTINGS;

  applyStyles(currentSettings);
  handleRedirect(currentSettings);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      handleAutoplay(currentSettings);
    });
  } else {
    handleAutoplay(currentSettings);
  }
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "SETTINGS_UPDATED") {
    currentSettings = message.payload as AppSettings;
    applyStyles(currentSettings);
    handleRedirect(currentSettings);
  }
});

// Listen for YouTube SPA navigation
window.addEventListener("yt-navigate-finish", () => {
  handleRedirect(currentSettings);
});

init();
