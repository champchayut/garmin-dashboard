(() => {
  "use strict";

  const STYLE_ID = "ios-improve-performance-layout";
  let resizeTimer = 0;

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      @media (max-width: 767px) and (orientation: portrait) {
        html,
        body {
          width: 100% !important;
          height: auto !important;
          min-height: 100% !important;
          overflow-x: hidden !important;
          overflow-y: auto !important;
          -webkit-overflow-scrolling: touch !important;
        }

        #workspace {
          display: block !important;
          width: 100% !important;
          height: auto !important;
          min-height: 0 !important;
          max-height: none !important;
          overflow: visible !important;
        }

        #workspace:has(#data.page.active) #filterPanel,
        body:has(#data.page.active) #filterPanel {
          display: none !important;
        }

        main,
        #data.page,
        #data.page.active,
        #data .performance-page,
        #data .performance-page.page.active {
          width: 100% !important;
          height: auto !important;
          min-height: 0 !important;
          max-height: none !important;
          overflow: visible !important;
          zoom: 1 !important;
        }

        #data.page.active {
          display: block !important;
        }

        #data #weeklyPlan {
          display: grid !important;
          grid-template-columns: minmax(0, 1fr) !important;
          grid-template-rows: repeat(7, auto) !important;
          grid-auto-flow: row !important;
          grid-auto-columns: minmax(0, 1fr) !important;
          width: 100% !important;
          height: auto !important;
          min-height: 0 !important;
          max-height: none !important;
          gap: 10px !important;
          overflow: visible !important;
        }

        #data #weeklyPlan > .plan-day {
          grid-column: 1 !important;
          width: 100% !important;
          min-width: 0 !important;
          max-width: none !important;
          height: auto !important;
          min-height: 0 !important;
          margin: 0 !important;
          overflow: visible !important;
        }

        #data .weekly-plan-card,
        #data .weekly-plan,
        #data .plan-result,
        #data .plan-output {
          width: 100% !important;
          height: auto !important;
          min-height: 0 !important;
          max-height: none !important;
          overflow: visible !important;
        }

        #mobileFilterToggle,
        .filter-toggle,
        .filter-collapse,
        [data-action="toggle-filter"],
        [data-action="hide-filter"] {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
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

  function syncLayout(scrollTop = false) {
    installStyles();
    syncFilter();
    if (scrollTop) window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    resizeCharts();
  }

  function setup() {
    syncLayout();

    document.addEventListener("click", event => {
      if (!event.target.closest(".tab,[role=tab],.nav-item")) return;
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
