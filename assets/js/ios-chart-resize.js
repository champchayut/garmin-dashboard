(() => {
  "use strict";

  let resizeTimer = 0;

  function resizeAllCharts() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      document.querySelectorAll("canvas").forEach(canvas => {
        const parent = canvas.parentElement;
        if (!parent) return;
        const rect = parent.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          canvas.style.width = "100%";
          canvas.style.height = "100%";
        }
      });

      if (window.Chart && typeof window.Chart.getChart === "function") {
        document.querySelectorAll("canvas").forEach(canvas => {
          const chart = window.Chart.getChart(canvas);
          if (chart) {
            chart.resize();
            chart.update("none");
          }
        });
      }

      window.dispatchEvent(new Event("resize"));
    }, 180);
  }

  window.addEventListener("load", resizeAllCharts, { once: true });
  window.addEventListener("orientationchange", () => {
    window.setTimeout(resizeAllCharts, 250);
    window.setTimeout(resizeAllCharts, 700);
  });

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", resizeAllCharts);
  }

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) resizeAllCharts();
  });

  document.addEventListener("click", event => {
    if (event.target.closest(".tab, [role='tab'], button, .nav-item")) {
      window.setTimeout(resizeAllCharts, 120);
    }
  });
})();
