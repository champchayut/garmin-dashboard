(() => {
  "use strict";

  let resizeTimer = 0;

  function isPortraitIOS() {
    const appleTouch =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    return appleTouch && window.matchMedia("(orientation: portrait) and (max-width: 1024px)").matches;
  }

  function activePageIsImprovePerformance() {
    return document.querySelector(".tab.active")?.dataset.page === "data" ||
      document.getElementById("data")?.classList.contains("active");
  }

  function syncUploadState() {
    const hasData = document.body.classList.contains("has-data");
    const upload = document.getElementById("uploadScreen");
    const workspace = document.getElementById("workspace");
    if (upload) upload.hidden = hasData;
    if (workspace) workspace.hidden = !hasData;
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
    }, 160);
  }

  function syncLayout(resetScroll = false) {
    if (!isPortraitIOS()) return;
    syncUploadState();
    syncFilter();
    if (resetScroll) window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    resizeCharts();
  }

  function setup() {
    syncLayout();
    const observer = new MutationObserver(() => syncLayout());
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    document.addEventListener("click", event => {
      if (!event.target.closest(".tab, [role='tab'], .nav-item")) return;
      window.setTimeout(() => syncLayout(true), 60);
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
