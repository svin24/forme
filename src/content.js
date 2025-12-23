(() => {
  const FOLLOWING_LABEL = "following";
  const HOME_PATH = "/home";
  const STORAGE_KEY = "enableFollowingDefault";
  let scheduled = false;
  let lastUrl = location.href;
  let autoSwitchEnabled = location.pathname === HOME_PATH;
  let featureEnabled = true;

  const storage =
    (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) ||
    (typeof browser !== "undefined" && browser.storage && browser.storage.local);

  const getStoredValue = () => {
    if (!storage) {
      return Promise.resolve(undefined);
    }
    try {
      const maybePromise = storage.get(STORAGE_KEY);
      if (maybePromise && typeof maybePromise.then === "function") {
        return maybePromise.then((result) => result[STORAGE_KEY]);
      }
    } catch (error) {
      return Promise.resolve(undefined);
    }
    return new Promise((resolve) => {
      storage.get(STORAGE_KEY, (result) => {
        if (typeof chrome !== "undefined" && chrome.runtime?.lastError) {
          resolve(undefined);
          return;
        }
        resolve(result[STORAGE_KEY]);
      });
    });
  };

  const applyStoredValue = (value) => {
    if (typeof value === "boolean") {
      featureEnabled = value;
    } else {
      featureEnabled = true;
    }
  };

  const isFollowingTab = (tab) => {
    const text = tab.textContent;
    if (!text) {
      return false;
    }
    return text.trim().toLowerCase() === FOLLOWING_LABEL;
  };

  const isSelected = (tab) => tab.getAttribute("aria-selected") === "true";

  const findFollowingTab = () => {
    const tabs = document.querySelectorAll('[role="tab"]');
    for (const tab of tabs) {
      if (isFollowingTab(tab)) {
        return tab;
      }
    }
    return null;
  };

  const activateFollowing = () => {
    if (!featureEnabled || !autoSwitchEnabled) {
      return;
    }
    const tab = findFollowingTab();
    if (!tab) {
      return;
    }
    if (isSelected(tab)) {
      autoSwitchEnabled = false;
      return;
    }
    tab.click();
    autoSwitchEnabled = false;
  };

  const scheduleActivate = () => {
    if (scheduled) {
      return;
    }
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        autoSwitchEnabled = location.pathname === HOME_PATH;
      }
      activateFollowing();
    });
  };

  activateFollowing();

  const observer = new MutationObserver(scheduleActivate);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  getStoredValue().then((value) => {
    applyStoredValue(value);
    activateFollowing();
  });

  if (typeof chrome !== "undefined" && chrome.storage?.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area && area !== "local") {
        return;
      }
      if (changes[STORAGE_KEY]) {
        applyStoredValue(changes[STORAGE_KEY].newValue);
      }
    });
  } else if (typeof browser !== "undefined" && browser.storage?.onChanged) {
    browser.storage.onChanged.addListener((changes, area) => {
      if (area && area !== "local") {
        return;
      }
      if (changes[STORAGE_KEY]) {
        applyStoredValue(changes[STORAGE_KEY].newValue);
      }
    });
  }
})();
