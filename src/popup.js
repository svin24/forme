(() => {
  const toggles = [
    {
      key: "enableFollowingDefault",
      id: "toggle-following",
      defaultValue: true,
    },
    {
      key: "hideWhatsHappening",
      id: "toggle-whats-happening",
      defaultValue: false,
    },
    {
      key: "hideNotificationBadge",
      id: "toggle-hide-notification-badge",
      defaultValue: false,
    },
  ];

  const storage =
    (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) ||
    (typeof browser !== "undefined" && browser.storage && browser.storage.local);

  if (!storage) {
    return;
  }

  const getStoredValue = () => {
    try {
      const maybePromise = storage.get(toggles.map((item) => item.key));
      if (maybePromise && typeof maybePromise.then === "function") {
        return maybePromise.then((result) => result);
      }
    } catch (error) {
      return Promise.resolve({});
    }
    return new Promise((resolve) => {
      storage.get(toggles.map((item) => item.key), (result) => {
        if (typeof chrome !== "undefined" && chrome.runtime?.lastError) {
          resolve({});
          return;
        }
        resolve(result);
      });
    });
  };

  const setStoredValue = (key, value) => {
    const payload = { [key]: value };
    try {
      const maybePromise = storage.set(payload);
      if (maybePromise && typeof maybePromise.then === "function") {
        maybePromise.catch(() => {});
      }
    } catch (error) {
      storage.set(payload, () => {});
    }
  };

  getStoredValue().then((values) => {
    toggles.forEach((item) => {
      const toggle = document.getElementById(item.id);
      if (!toggle) {
        return;
      }
      const storedValue = values[item.key];
      toggle.checked =
        typeof storedValue === "boolean" ? storedValue : item.defaultValue;
    });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.classList.add("ready");
      });
    });
  });

  toggles.forEach((item) => {
    const toggle = document.getElementById(item.id);
    if (!toggle) {
      return;
    }
    toggle.addEventListener("change", () => {
      setStoredValue(item.key, toggle.checked);
    });
  });
})();
