(() => {
  const STORAGE_KEY = "enableFollowingDefault";
  const toggle = document.getElementById("toggle-following");

  if (!toggle) {
    return;
  }

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

  const setStoredValue = (value) => {
    if (!storage) {
      return;
    }
    const payload = { [STORAGE_KEY]: value };
    try {
      const maybePromise = storage.set(payload);
      if (maybePromise && typeof maybePromise.then === "function") {
        maybePromise.catch(() => {});
      }
    } catch (error) {
      storage.set(payload, () => {});
    }
  };

  getStoredValue().then((value) => {
    toggle.checked = value !== false;
  });

  toggle.addEventListener("change", () => {
    setStoredValue(toggle.checked);
  });
})();
