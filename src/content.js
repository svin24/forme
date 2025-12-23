(() => {
  const FOLLOWING_LABEL = "following";
  const HOME_PATH = "/home";
  const STORAGE_KEYS = {
    followingDefault: "enableFollowingDefault",
    hideWhatsHappening: "hideWhatsHappening",
  };
  let scheduled = false;
  let lastUrl = location.href;
  let autoSwitchEnabled = location.pathname === HOME_PATH;
  let followingDefaultEnabled = true;
  let hideWhatsHappeningEnabled = false;

  const storage =
    (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) ||
    (typeof browser !== "undefined" && browser.storage && browser.storage.local);

  const getStoredValue = () => {
    if (!storage) {
      return Promise.resolve({});
    }
    try {
      const maybePromise = storage.get([
        STORAGE_KEYS.followingDefault,
        STORAGE_KEYS.hideWhatsHappening,
      ]);
      if (maybePromise && typeof maybePromise.then === "function") {
        return maybePromise.then((result) => result);
      }
    } catch (error) {
      return Promise.resolve({});
    }
    return new Promise((resolve) => {
      storage.get(
        [STORAGE_KEYS.followingDefault, STORAGE_KEYS.hideWhatsHappening],
        (result) => {
        if (typeof chrome !== "undefined" && chrome.runtime?.lastError) {
          resolve({});
          return;
        }
        resolve(result);
      });
    });
  };

  const applyStoredValue = (values) => {
    if (typeof values[STORAGE_KEYS.followingDefault] === "boolean") {
      followingDefaultEnabled = values[STORAGE_KEYS.followingDefault];
    } else {
      followingDefaultEnabled = true;
    }
    if (typeof values[STORAGE_KEYS.hideWhatsHappening] === "boolean") {
      hideWhatsHappeningEnabled = values[STORAGE_KEYS.hideWhatsHappening];
    } else {
      hideWhatsHappeningEnabled = false;
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
    if (!followingDefaultEnabled || !autoSwitchEnabled) {
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
      hideWhatsHappeningCard();
    });
  };

  const normalizeText = (text) =>
    text.toLowerCase().replace(/\u2019/g, "'");

  const hideWhatsHappeningCard = () => {
    const hiddenElements = document.querySelectorAll("[data-forme-hidden]");
    if (!hideWhatsHappeningEnabled) {
      hiddenElements.forEach((element) => {
        element.style.removeProperty("display");
        element.removeAttribute("data-forme-hidden");
      });
      return;
    }
    const candidates = document.querySelectorAll("span, div, h2, h1");
    for (const node of candidates) {
      const text = node.textContent;
      if (!text) {
        continue;
      }
      const normalized = normalizeText(text.trim());
      if (normalized === "what's happening") {
        const container =
          node.closest('section[role="region"]') ||
          node.closest("section") ||
          node.closest("div");
        if (container && !container.hasAttribute("data-forme-hidden")) {
          container.style.display = "none";
          container.setAttribute("data-forme-hidden", "true");
        }
        break;
      }
    }
  };

  activateFollowing();
  hideWhatsHappeningCard();

  const observer = new MutationObserver(scheduleActivate);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  getStoredValue().then((values) => {
    applyStoredValue(values);
    activateFollowing();
    hideWhatsHappeningCard();
  });

  if (typeof chrome !== "undefined" && chrome.storage?.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area && area !== "local") {
        return;
      }
      if (changes[STORAGE_KEYS.followingDefault] || changes[STORAGE_KEYS.hideWhatsHappening]) {
        applyStoredValue({
          [STORAGE_KEYS.followingDefault]:
            changes[STORAGE_KEYS.followingDefault]?.newValue ??
            followingDefaultEnabled,
          [STORAGE_KEYS.hideWhatsHappening]:
            changes[STORAGE_KEYS.hideWhatsHappening]?.newValue ??
            hideWhatsHappeningEnabled,
        });
      }
    });
  } else if (typeof browser !== "undefined" && browser.storage?.onChanged) {
    browser.storage.onChanged.addListener((changes, area) => {
      if (area && area !== "local") {
        return;
      }
      if (changes[STORAGE_KEYS.followingDefault] || changes[STORAGE_KEYS.hideWhatsHappening]) {
        applyStoredValue({
          [STORAGE_KEYS.followingDefault]:
            changes[STORAGE_KEYS.followingDefault]?.newValue ??
            followingDefaultEnabled,
          [STORAGE_KEYS.hideWhatsHappening]:
            changes[STORAGE_KEYS.hideWhatsHappening]?.newValue ??
            hideWhatsHappeningEnabled,
        });
      }
    });
  }
})();
