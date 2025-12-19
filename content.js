(() => {
  const FOLLOWING_LABEL = "following";
  let scheduled = false;

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
    const tab = findFollowingTab();
    if (!tab) {
      return;
    }
    if (isSelected(tab)) {
      return;
    }
    tab.click();
  };

  const scheduleActivate = () => {
    if (scheduled) {
      return;
    }
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      activateFollowing();
    });
  };

  activateFollowing();

  const observer = new MutationObserver(scheduleActivate);
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
