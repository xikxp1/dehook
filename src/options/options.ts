import type { AppSettings, HidingSettings, Message } from "../shared/types.ts";

const $ = <T extends HTMLElement>(id: string): T =>
  document.getElementById(id) as T;

let settings: AppSettings;

const HIDING_KEYS: (keyof HidingSettings)[] = [
  "hideFeed",
  "redirectToSubscriptions",
  "hideSidebar",
  "hideRecommended",
  "hideChat",
  "hidePlaylists",
  "hideFundraiser",
  "hideEndScreen",
  "hideEndCards",
  "hideShorts",
  "hideComments",
  "hideProfilePhotos",
  "hideMixes",
  "hideMerch",
  "hideVideoInfo",
  "hideButtonsBar",
  "hideChannel",
  "hideDescription",
  "hideHeader",
  "hideNotifications",
  "hideInaptSearch",
  "hideTrending",
  "hideMoreYouTube",
  "hideSubscriptions",
  "disableAutoplay",
  "disableAnnotations",
];

async function sendMessage(message: Message) {
  return chrome.runtime.sendMessage(message);
}

async function loadSettings() {
  const response = await sendMessage({ type: "GET_SETTINGS" });
  if (response.success) {
    settings = response.data as AppSettings;
    updateUI();
  }
}

function updateUI() {
  const status = $<HTMLDivElement>("status");
  const passwordStatus = $<HTMLDivElement>("password-status");
  const passwordForm = $<HTMLDivElement>("password-form");
  const unlockForm = $<HTMLDivElement>("unlock-form");
  const hidingSection = $<HTMLElement>("hiding-section");
  const timerSection = $<HTMLElement>("timer-section");
  const currentPasswordInput = $<HTMLInputElement>("current-password");

  if (settings.protection.passwordHash) {
    if (settings.protection.isLocked) {
      status.textContent = "Locked";
      status.className = "locked";
      passwordStatus.textContent = "Enter password to modify settings";
      passwordForm.classList.add("hidden");
      unlockForm.classList.remove("hidden");
      hidingSection.classList.add("disabled");
      timerSection.classList.add("disabled");
    } else {
      const remaining = getRemainingTime();
      status.textContent = remaining ? `Unlocked (${remaining})` : "Unlocked";
      status.className = "unlocked";
      passwordStatus.textContent =
        "Change password or leave blank to keep current";
      passwordForm.classList.remove("hidden");
      unlockForm.classList.add("hidden");
      hidingSection.classList.remove("disabled");
      timerSection.classList.remove("disabled");
      currentPasswordInput.placeholder = "Current password (required)";
    }
  } else {
    status.textContent = "";
    passwordStatus.textContent = "Set a password to protect settings";
    passwordForm.classList.remove("hidden");
    unlockForm.classList.add("hidden");
    hidingSection.classList.remove("disabled");
    timerSection.classList.remove("disabled");
    currentPasswordInput.classList.add("hidden");
  }

  // Update hiding toggles
  for (const key of HIDING_KEYS) {
    const checkbox = document.getElementById(key) as HTMLInputElement | null;
    if (checkbox) {
      checkbox.checked = settings.hiding[key] as boolean;
    }
  }

  // Update timer settings
  $<HTMLInputElement>("autoRevertEnabled").checked =
    settings.protection.autoRevertEnabled;
  $<HTMLSelectElement>("autoRevertMinutes").value =
    settings.protection.autoRevertMinutes.toString();
}

function getRemainingTime(): string | null {
  if (
    !settings.protection.autoRevertEnabled ||
    !settings.protection.lastUnlockTime
  ) {
    return null;
  }

  const elapsed = Date.now() - settings.protection.lastUnlockTime;
  const remaining = settings.protection.autoRevertMinutes * 60 * 1000 - elapsed;

  if (remaining <= 0) return null;

  const minutes = Math.ceil(remaining / 60000);
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m remaining`;
  }
  return `${minutes}m remaining`;
}

async function handleHidingToggle(key: keyof HidingSettings, checked: boolean) {
  if (settings.protection.isLocked && settings.protection.passwordHash) {
    return;
  }

  const response = await sendMessage({
    type: "UPDATE_SETTINGS",
    payload: { hiding: { [key]: checked } },
  });

  if (response.success) {
    settings.hiding[key] = checked as never;
  }
}

async function handleTimerToggle(checked: boolean) {
  const response = await sendMessage({
    type: "UPDATE_SETTINGS",
    payload: { protection: { autoRevertEnabled: checked } },
  });

  if (response.success) {
    settings.protection.autoRevertEnabled = checked;
  }
}

async function handleTimerDuration(minutes: number) {
  const response = await sendMessage({
    type: "UPDATE_SETTINGS",
    payload: { protection: { autoRevertMinutes: minutes } },
  });

  if (response.success) {
    settings.protection.autoRevertMinutes = minutes;
  }
}

async function handleSetPassword() {
  const currentPassword = $<HTMLInputElement>("current-password").value;
  const newPassword = $<HTMLInputElement>("new-password").value;
  const confirmPassword = $<HTMLInputElement>("confirm-password").value;

  if (!newPassword) {
    showMessage("password-form", "Please enter a new password", "error");
    return;
  }

  if (newPassword !== confirmPassword) {
    showMessage("password-form", "Passwords do not match", "error");
    return;
  }

  if (settings.protection.passwordHash) {
    // Verify current password first
    const verifyResponse = await sendMessage({
      type: "VERIFY_PASSWORD",
      payload: currentPassword,
    });

    if (!verifyResponse.success) {
      showMessage("password-form", "Current password is incorrect", "error");
      return;
    }
  }

  const response = await sendMessage({
    type: "SET_PASSWORD",
    payload: newPassword,
  });

  if (response.success) {
    showMessage("password-form", "Password set successfully", "success");
    clearPasswordInputs();
    await loadSettings();
  } else {
    showMessage("password-form", "Failed to set password", "error");
  }
}

async function handleUnlock() {
  const password = $<HTMLInputElement>("unlock-password").value;

  if (!password) {
    showMessage("unlock-form", "Please enter your password", "error");
    return;
  }

  const response = await sendMessage({
    type: "VERIFY_PASSWORD",
    payload: password,
  });

  if (response.success) {
    $<HTMLInputElement>("unlock-password").value = "";
    await loadSettings();
  } else {
    showMessage("unlock-form", "Incorrect password", "error");
  }
}

async function handleReset() {
  if (confirm("Reset all settings to restrictive defaults?")) {
    await sendMessage({ type: "RESET_TO_DEFAULTS" });
    await loadSettings();
  }
}

function showMessage(
  formId: string,
  message: string,
  type: "error" | "success",
) {
  const form = $<HTMLDivElement>(formId);
  const existing = form.querySelector(".error, .success");
  if (existing) existing.remove();

  const div = document.createElement("div");
  div.className = type;
  div.textContent = message;
  form.appendChild(div);

  setTimeout(() => div.remove(), 3000);
}

function clearPasswordInputs() {
  $<HTMLInputElement>("current-password").value = "";
  $<HTMLInputElement>("new-password").value = "";
  $<HTMLInputElement>("confirm-password").value = "";
}

function init() {
  loadSettings();

  // Hiding toggles
  for (const key of HIDING_KEYS) {
    const checkbox = document.getElementById(key) as HTMLInputElement | null;
    if (checkbox) {
      checkbox.addEventListener("change", (e) => {
        handleHidingToggle(key, (e.target as HTMLInputElement).checked);
      });
    }
  }

  // Timer settings
  $<HTMLInputElement>("autoRevertEnabled").addEventListener("change", (e) => {
    handleTimerToggle((e.target as HTMLInputElement).checked);
  });

  $<HTMLSelectElement>("autoRevertMinutes").addEventListener("change", (e) => {
    handleTimerDuration(
      Number.parseInt((e.target as HTMLSelectElement).value, 10),
    );
  });

  // Password
  $<HTMLButtonElement>("set-password-btn").addEventListener(
    "click",
    handleSetPassword,
  );
  $<HTMLButtonElement>("unlock-btn").addEventListener("click", handleUnlock);

  $<HTMLInputElement>("unlock-password").addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleUnlock();
  });

  // Reset
  $<HTMLButtonElement>("reset-btn").addEventListener("click", handleReset);

  // Refresh timer display
  setInterval(() => {
    if (!settings.protection.isLocked) {
      updateUI();
    }
  }, 60000);
}

init();
