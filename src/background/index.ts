import {
  ALARM_NAME,
  DEFAULT_APP_SETTINGS,
  DEFAULT_HIDING_SETTINGS,
  STORAGE_KEY,
} from "../shared/constants.ts";
import { hashPassword, verifyPassword } from "../shared/crypto.ts";
import type { AppSettings, Message, MessageResponse } from "../shared/types.ts";

chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.local.get(STORAGE_KEY);
  if (!existing[STORAGE_KEY]) {
    await chrome.storage.local.set({ [STORAGE_KEY]: DEFAULT_APP_SETTINGS });
  }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    await revertToDefaults();
  }
});

async function checkAlarmState() {
  const settings = await getSettings();
  if (settings.protection.autoRevertEnabled && !settings.protection.isLocked) {
    const alarm = await chrome.alarms.get(ALARM_NAME);
    if (!alarm && settings.protection.lastUnlockTime) {
      const elapsed = Date.now() - settings.protection.lastUnlockTime;
      const remaining =
        settings.protection.autoRevertMinutes * 60 * 1000 - elapsed;
      if (remaining > 0) {
        chrome.alarms.create(ALARM_NAME, { delayInMinutes: remaining / 60000 });
      } else {
        await revertToDefaults();
      }
    }
  }
}
checkAlarmState();

async function getSettings(): Promise<AppSettings> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return (result[STORAGE_KEY] as AppSettings) || DEFAULT_APP_SETTINGS;
}

async function saveSettings(settings: AppSettings): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: settings });
  const tabs = await chrome.tabs.query({ url: "*://www.youtube.com/*" });
  for (const tab of tabs) {
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: "SETTINGS_UPDATED",
        payload: settings,
      });
    }
  }
}

async function revertToDefaults(): Promise<void> {
  const settings = await getSettings();
  settings.hiding = { ...DEFAULT_HIDING_SETTINGS };
  settings.protection.isLocked = true;
  settings.protection.lastUnlockTime = null;
  await saveSettings(settings);
  await chrome.alarms.clear(ALARM_NAME);
}

chrome.runtime.onMessage.addListener(
  (message: Message, _sender, sendResponse) => {
    handleMessage(message).then(sendResponse);
    return true;
  },
);

async function handleMessage(message: Message): Promise<MessageResponse> {
  const settings = await getSettings();

  switch (message.type) {
    case "GET_SETTINGS":
      return { success: true, data: settings };

    case "VERIFY_PASSWORD": {
      const password = message.payload as string;
      if (!settings.protection.passwordHash) {
        return { success: false, error: "No password set" };
      }
      const valid = await verifyPassword(
        settings.protection.passwordHash,
        password,
      );
      if (valid) {
        settings.protection.isLocked = false;
        settings.protection.lastUnlockTime = Date.now();
        await saveSettings(settings);
        if (settings.protection.autoRevertEnabled) {
          chrome.alarms.create(ALARM_NAME, {
            delayInMinutes: settings.protection.autoRevertMinutes,
          });
        }
      }
      return { success: valid };
    }

    case "SET_PASSWORD": {
      const password = message.payload as string;
      settings.protection.passwordHash = await hashPassword(password);
      settings.protection.isLocked = true;
      await saveSettings(settings);
      return { success: true };
    }

    case "UPDATE_SETTINGS": {
      if (settings.protection.isLocked && settings.protection.passwordHash) {
        return { success: false, error: "Settings are locked" };
      }
      const updates = message.payload as Partial<AppSettings>;
      if (updates.hiding) {
        settings.hiding = { ...settings.hiding, ...updates.hiding };
      }
      if (updates.enabled !== undefined) {
        settings.enabled = updates.enabled;
      }
      if (updates.protection) {
        settings.protection = { ...settings.protection, ...updates.protection };
      }
      await saveSettings(settings);
      return { success: true };
    }

    case "RESET_TO_DEFAULTS":
      await revertToDefaults();
      return { success: true };

    case "EXTEND_UNLOCK": {
      if (settings.protection.isLocked) {
        return { success: false, error: "Already locked" };
      }
      settings.protection.lastUnlockTime = Date.now();
      await saveSettings(settings);
      await chrome.alarms.clear(ALARM_NAME);
      if (settings.protection.autoRevertEnabled) {
        chrome.alarms.create(ALARM_NAME, {
          delayInMinutes: settings.protection.autoRevertMinutes,
        });
      }
      return { success: true };
    }

    default:
      return { success: false, error: "Unknown message type" };
  }
}
