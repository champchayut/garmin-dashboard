(() => {
  "use strict";

  let resizeTimer = 0;

  function isPortraitIOS() {
    const isAppleTouchDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    return isAppleTouchDevice &&
      window.matchMedia("(orientation: portrait) and (max-width: 1024px)").matches;
  }

  function activePageIsImprovePerformance() {
    return document.querySelector(".tab.active")?.dataset.page === "data" ||
      document.getElementById("data")?.classList.contains("active");
  }

  function syncFilter() {
    document.getElementById("mobileFilterToggle")?.remove();

    const panel = document.getElementById("filterPanel");
    if (!panel) return;

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

  function resizeCharts() {
    clearTimeout(resizeTimer);

    resizeTimer = window.setTimeout(() => {
      window.requestAnimationFrame(() => {
        document.querySelectorAll(".page.active canvas").forEach(canvas => {
          const chart = window.Chart?.getChart?.(canvas);
          if (!chart) return;

          chart.resize();
          chart.update("none");
        });
      });
    }, 180);
  }

  function resetContentScroll() {
    const workspace = document.getElementById("workspace");
    if (workspace) {
      workspace.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }

  function syncLayout(resetScroll = false) {
    if (!isPortraitIOS()) return;

    syncFilter();

    if (resetScroll) {
      resetContentScroll();
    }

    resizeCharts();
  }

  function setup() {
    syncLayout();

    document.addEventListener("click", event => {
      if (!event.target.closest(".tab, [role='tab'], .nav-item")) return;
      window.setTimeout(() => syncLayout(true), 60);
    }, { passive: true });

    window.addEventListener("resize", () => syncLayout(), { passive: true });

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
