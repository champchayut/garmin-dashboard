(() => {
  "use strict";

  const STYLE_ID = "ios-portrait-scroll-fix";
  let resizeTimer = 0;

  function installPortraitStyles() {
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

        body.has-data,
        body:not(.no-data) {
          overflow-y: auto !important;
        }

        #workspace {
          display: block !important;
          width: 100% !important;
          height: auto !important;
          min-height: 0 !important;
          max-height: none !important;
          overflow: visible !important;
        }

        #filterPanel {
          position: relative !important;
          inset: auto !important;
          display: block !important;
          width: 100% !important;
          height: auto !important;
          min-height: 0 !important;
          max-height: none !important;
          overflow: visible !important;
          transform: none !important;
        }

        #filterPanel.no-filter,
        #filterPanel[hidden] {
          display: none !important;
        }

        #mobileFilterToggle,
        .filter-toggle,
        .filter-collapse,
        [data-action="toggle-filter"],
        [data-action="hide-filter"] {
          display: none !important;
        }

        main {
          display: block !important;
          width: 100% !important;
          height: auto !important;
          min-height: 0 !important;
          max-height: none !important;
          overflow: visible !important;
          padding-bottom: max(28px, env(safe-area-inset-bottom)) !important;
        }

        main > .page,
        main > .page.active,
        .performance-page,
        .performance-page.page.active {
          width: 100% !important;
          height: auto !important;
          min-height: 0 !important;
          max-height: none !important;
          overflow: visible !important;
          zoom: 1 !important;
        }

        .page.active .card,
        .weekly-plan-card,
        .weekly-plan {
          max-height: none !important;
          overflow: visible !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function isImprovePerformance() {
    return document.querySelector(".tab.active")?.dataset.page === "data";
  }

  function syncFilterPanel() {
    document.getElementById("mobileFilterToggle")?.remove();

    const panel = document.getElementById("filterPanel");
    if (!panel) return;

    const hide = isImprovePerformance();
    panel.classList.remove("mobile-collapsed");
    panel.classList.toggle("no-filter", hide);
    panel.hidden = hide;

    if (hide) panel.setAttribute("aria-hidden", "true");
    else panel.removeAttribute("aria-hidden");
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
    }, 180);
  }

  function syncLayout({ scrollTop = false } = {}) {
    installPortraitStyles();
    syncFilterPanel();
    if (scrollTop) window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    resizeActiveCharts();
  }

  function setup() {
    installPortraitStyles();
    syncLayout();

    document.addEventListener("click", event => {
      if (!event.target.closest(".tab,[role=tab],.nav-item")) return;
      window.setTimeout(() => syncLayout({ scrollTop: true }), 60);
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
