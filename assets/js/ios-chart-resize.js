/* REPLACEMENT FILE: preserve all tab hints and resize visible charts only. */
(() => {
  "use strict";

  let resizeTimer = 0;

  function getVisibleCharts() {
    return Array.from(document.querySelectorAll(".page.active canvas"))
      .filter(canvas => canvas.offsetParent !== null);
  }

  function resizeVisibleCharts(delay = 80) {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      getVisibleCharts().forEach(canvas => {
        const holder = canvas.closest(".chart, .svg-chart") || canvas.parentElement;
        if (!holder) return;

        const width = Math.max(1, Math.round(holder.getBoundingClientRect().width));
        const height = Math.max(1, Math.round(holder.getBoundingClientRect().height));

        if (window.Chart && typeof window.Chart.getChart === "function") {
          const chart = window.Chart.getChart(canvas);
          if (chart) {
            chart.resize(width, height);
            chart.update("none");
          }
        }
      });
    }, delay);
  }

  function resizeSequence() {
    resizeVisibleCharts(0);
    window.setTimeout(() => resizeVisibleCharts(0), 180);
    window.setTimeout(() => resizeVisibleCharts(0), 500);
  }

  window.addEventListener("load", resizeSequence, { once: true });
  window.addEventListener("pageshow", resizeSequence);
  window.addEventListener("orientationchange", resizeSequence);
  window.addEventListener("resize", () => resizeVisibleCharts(120));

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", () => resizeVisibleCharts(120));
  }

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) resizeSequence();
  });

  document.addEventListener("click", event => {
    if (event.target.closest(".tab, [role='tab'], .nav-item")) {
      window.setTimeout(resizeSequence, 60);
    }
  });

  /* Intentionally do not remove or rewrite title attributes.
     Existing tab hints remain exactly as defined in index.html/app.js. */
})();
