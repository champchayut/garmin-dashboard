/* REPLACEMENT FILE: reliable visible-chart resize for iOS portrait */
(() => {
  "use strict";

  let frame = 0;
  let timer = 0;
  const observed = new WeakSet();

  const visibleCanvases = () => Array.from(
    document.querySelectorAll(".page.active canvas")
  ).filter(canvas => {
    const rect = canvas.getBoundingClientRect();
    return canvas.offsetParent !== null && rect.width > 0 && rect.height > 0;
  });

  function resizeCanvas(canvas) {
    const holder = canvas.closest(".chart, .svg-chart") || canvas.parentElement;
    if (!holder) return;
    const rect = holder.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    if (width < 2 || height < 2) return;

    if (window.Chart && typeof window.Chart.getChart === "function") {
      const chart = window.Chart.getChart(canvas);
      if (chart) {
        chart.resize(width, height);
        chart.update("none");
      }
    }
  }

  function resizeVisibleCharts(delay = 60) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => visibleCanvases().forEach(resizeCanvas));
    }, delay);
  }

  function resizeSequence() {
    resizeVisibleCharts(0);
    setTimeout(() => resizeVisibleCharts(0), 120);
    setTimeout(() => resizeVisibleCharts(0), 350);
    setTimeout(() => resizeVisibleCharts(0), 800);
  }

  function observeChartHolders() {
    if (!("ResizeObserver" in window)) return;
    const observer = new ResizeObserver(entries => {
      entries.forEach(entry => {
        const canvas = entry.target.querySelector("canvas");
        if (canvas && entry.contentRect.width > 1 && entry.contentRect.height > 1) {
          resizeVisibleCharts(30);
        }
      });
    });
    document.querySelectorAll(".chart, .svg-chart").forEach(holder => {
      if (!observed.has(holder)) {
        observed.add(holder);
        observer.observe(holder);
      }
    });
  }

  window.addEventListener("load", () => {
    observeChartHolders();
    resizeSequence();
  }, { once: true });
  window.addEventListener("pageshow", resizeSequence);
  window.addEventListener("orientationchange", resizeSequence);
  window.addEventListener("resize", () => resizeVisibleCharts(100), { passive: true });

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", () => resizeVisibleCharts(100), { passive: true });
    window.visualViewport.addEventListener("scroll", () => resizeVisibleCharts(100), { passive: true });
  }

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) resizeSequence();
  });

  document.addEventListener("click", event => {
    if (event.target.closest(".tab, [role='tab'], .nav-item")) {
      setTimeout(() => {
        observeChartHolders();
        resizeSequence();
      }, 50);
    }
  });

  /* Resize after the active page class changes, without touching tab hints. */
  const mutationObserver = new MutationObserver(mutations => {
    if (mutations.some(m => m.type === "attributes" && m.attributeName === "class")) {
      observeChartHolders();
      resizeSequence();
    }
  });
  document.querySelectorAll(".page").forEach(page => {
    mutationObserver.observe(page, { attributes: true, attributeFilter: ["class"] });
  });
})();
