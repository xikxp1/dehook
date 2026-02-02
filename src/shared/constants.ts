import type { AppSettings, HidingSettings } from "./types.ts";

export const STORAGE_KEY = "dehook_settings";
export const ALARM_NAME = "dehook_auto_revert";

export const DEFAULT_HIDING_SETTINGS: HidingSettings = {
  hideFeed: true,
  redirectToSubscriptions: true,
  hideSidebar: true,
  hideRecommended: true,
  hideChat: true,
  hidePlaylists: false,
  hideFundraiser: true,
  hideEndScreen: true,
  hideEndCards: true,
  hideShorts: true,
  hideComments: false,
  hideProfilePhotos: false,
  hideMixes: true,
  hideMerch: true,
  hideVideoInfo: false,
  hideButtonsBar: false,
  hideChannel: false,
  hideDescription: false,
  hideHeader: false,
  hideNotifications: true,
  hideInaptSearch: true,
  hideTrending: true,
  hideMoreYouTube: true,
  hideSubscriptions: false,
  disableAutoplay: true,
  disableAnnotations: true,
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  enabled: true,
  hiding: DEFAULT_HIDING_SETTINGS,
  protection: {
    passwordHash: null,
    isLocked: true,
    autoRevertEnabled: true,
    autoRevertMinutes: 60,
    lastUnlockTime: null,
  },
};
