(() => {
  "use strict";

  let resizeTimer = 0;

  function keepFiltersVisible() {
    const toggle = document.getElementById("mobileFilterToggle");
    if (toggle) toggle.remove();

    const panel = document.getElementById("filterPanel");
    if (!panel) return;
    panel.classList.remove("mobile-collapsed");
    panel.hidden = false;
    panel.removeAttribute("aria-hidden");
  }

  function resizeActiveCharts() {
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

  function setup() {
    keepFiltersVisible();

    window.addEventListener("resize", resizeActiveCharts, { passive: true });
    window.addEventListener("orientationchange", resizeActiveCharts, { passive: true });
    window.addEventListener("pageshow", keepFiltersVisible, { passive: true });

    document.addEventListener("click", event => {
      if (!event.target.closest(".tab,[role=tab],.nav-item")) return;
      window.setTimeout(() => {
        keepFiltersVisible();
        resizeActiveCharts();
      }, 60);
    }, { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup, { once: true });
  } else {
    setup();
  }
})();
