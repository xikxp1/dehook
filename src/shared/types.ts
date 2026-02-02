export interface HidingSettings {
  hideFeed: boolean;
  redirectToSubscriptions: boolean;
  hideSidebar: boolean;
  hideRecommended: boolean;
  hideChat: boolean;
  hidePlaylists: boolean;
  hideFundraiser: boolean;
  hideEndScreen: boolean;
  hideEndCards: boolean;
  hideShorts: boolean;
  hideComments: boolean;
  hideProfilePhotos: boolean;
  hideMixes: boolean;
  hideMerch: boolean;
  hideVideoInfo: boolean;
  hideButtonsBar: boolean;
  hideChannel: boolean;
  hideDescription: boolean;
  hideHeader: boolean;
  hideNotifications: boolean;
  hideInaptSearch: boolean;
  hideTrending: boolean;
  hideMoreYouTube: boolean;
  hideSubscriptions: boolean;
  disableAutoplay: boolean;
  disableAnnotations: boolean;
}

export interface ProtectionSettings {
  passwordHash: string | null;
  isLocked: boolean;
  autoRevertEnabled: boolean;
  autoRevertMinutes: number;
  lastUnlockTime: number | null;
}

export interface AppSettings {
  enabled: boolean;
  hiding: HidingSettings;
  protection: ProtectionSettings;
}

export type MessageType =
  | "GET_SETTINGS"
  | "UPDATE_SETTINGS"
  | "VERIFY_PASSWORD"
  | "SET_PASSWORD"
  | "RESET_TO_DEFAULTS"
  | "EXTEND_UNLOCK"
  | "SETTINGS_UPDATED";

export interface Message {
  type: MessageType;
  payload?: unknown;
}

export interface MessageResponse {
  success: boolean;
  error?: string;
  data?: unknown;
}
