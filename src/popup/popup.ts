import type { AppSettings, HidingSettings, Message } from "../shared/types.ts";

const $ = <T extends HTMLElement>(id: string): T =>
  document.getElementById(id) as T;

let settings: AppSettings;

const QUICK_TOGGLES: (keyof HidingSettings)[] = [
  "hideFeed",
  "hideShorts",
  "hideSidebar",
  "hideComments",
  "disableAutoplay",
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
  const enabledCheckbox = $<HTMLInputElement>("enabled");
  enabledCheckbox.checked = settings.enabled;

  const lockStatus = $<HTMLDivElement>("lock-status");
  const passwordSection = $<HTMLDivElement>("password-section");
  const quickToggles = $<HTMLDivElement>("quick-toggles");

  if (settings.protection.passwordHash) {
    if (settings.protection.isLocked) {
      lockStatus.textContent = "Settings locked";
      lockStatus.className = "locked";
      passwordSection.classList.remove("hidden");
      quickToggles.classList.add("disabled");
    } else {
      const remaining = getRemainingTime();
      lockStatus.textContent = remaining
        ? `Unlocked (${remaining} remaining)`
        : "Unlocked";
      lockStatus.className = "unlocked";
      passwordSection.classList.add("hidden");
      quickToggles.classList.remove("disabled");
    }
  } else {
    lockStatus.textContent = "No password set";
    lockStatus.className = "";
    passwordSection.classList.add("hidden");
    quickToggles.classList.remove("disabled");
  }

  for (const key of QUICK_TOGGLES) {
    const checkbox = $<HTMLInputElement>(key);
    if (checkbox) {
      checkbox.checked = settings.hiding[key] as boolean;
    }
  }
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
    return `${hours}h ${mins}m`;
  }
  return `${minutes}m`;
}

async function handleToggle(key: keyof HidingSettings, checked: boolean) {
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

async function handleEnabled(checked: boolean) {
  const response = await sendMessage({
    type: "UPDATE_SETTINGS",
    payload: { enabled: checked },
  });

  if (response.success) {
    settings.enabled = checked;
  }
}

async function handleUnlock() {
  const passwordInput = $<HTMLInputElement>("password");
  const password = passwordInput.value;

  if (!password) return;

  const response = await sendMessage({
    type: "VERIFY_PASSWORD",
    payload: password,
  });

  if (response.success) {
    passwordInput.value = "";
    await loadSettings();
  } else {
    passwordInput.value = "";
    passwordInput.placeholder = "Incorrect password";
    setTimeout(() => {
      passwordInput.placeholder = "Enter password";
    }, 2000);
  }
}

function init() {
  loadSettings();

  $<HTMLInputElement>("enabled").addEventListener("change", (e) => {
    handleEnabled((e.target as HTMLInputElement).checked);
  });

  for (const key of QUICK_TOGGLES) {
    $<HTMLInputElement>(key).addEventListener("change", (e) => {
      handleToggle(key, (e.target as HTMLInputElement).checked);
    });
  }

  $<HTMLButtonElement>("unlock-btn").addEventListener("click", handleUnlock);

  $<HTMLInputElement>("password").addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleUnlock();
  });

  $<HTMLAnchorElement>("options-link").addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });

  setInterval(() => {
    if (!settings.protection.isLocked) {
      updateUI();
    }
  }, 60000);
}

init();
