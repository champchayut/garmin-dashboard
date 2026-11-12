(() => {
  "use strict";

  let resizeTimer = 0;

  function isPortraitIOS() {
    const appleTouch =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    return appleTouch &&
      window.matchMedia("(orientation: portrait) and (max-width: 1024px)").matches;
  }

  function activePageIsImprovePerformance() {
    return document.querySelector(".tab.active")?.dataset.page === "data" ||
      document.getElementById("data")?.classList.contains("active");
  }

  function syncFilter() {
    const panel = document.getElementById("filterPanel");
    if (!panel) return;

    document.getElementById("mobileFilterToggle")?.remove();

    const hide = activePageIsImprovePerformance();
    panel.classList.remove("mobile-collapsed");
    panel.classList.toggle("no-filter", hide);
    panel.hidden = hide;

    if (hide) {
      panel.setAttribute("aria-hidden", "true");
      panel.style.setProperty("display", "none", "important");
    } else {
      panel.removeAttribute("aria-hidden");
      panel.style.removeProperty("display");
    }
  }

  function redrawActiveCharts() {
    clearTimeout(resizeTimer);

    resizeTimer = window.setTimeout(() => {
      window.requestAnimationFrame(() => {
        window.dispatchEvent(new Event("resize"));
      });
    }, 120);
  }

  function resetPageScroll() {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }

  function syncLayout(resetScroll = false) {
    if (!isPortraitIOS()) return;

    syncFilter();
    if (resetScroll) resetPageScroll();
    redrawActiveCharts();
  }

  function setup() {
    syncLayout();

    document.addEventListener("click", event => {
      if (!event.target.closest(".tab, [role='tab'], .nav-item")) return;
      window.setTimeout(() => syncLayout(true), 80);
    }, { passive: true });

    window.addEventListener("orientationchange", () => {
      window.setTimeout(() => syncLayout(), 250);
    }, { passive: true });

    window.addEventListener("pageshow", () => syncLayout(), { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup, { once: true });
  } else {
    setup();
  }
})();
