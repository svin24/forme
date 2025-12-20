(() => {
  const FOLLOWING_LABEL = "following";
  const HOME_PATH = "/home";
  let scheduled = false;
  let lastUrl = location.href;
  let autoSwitchEnabled = location.pathname === HOME_PATH;

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
    if (!autoSwitchEnabled) {
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
})();
