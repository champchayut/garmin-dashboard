(() => {
  "use strict";
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  let timer = 0;
  let hintTimer = 0;

  function activeCanvases() {
    return [...document.querySelectorAll(".page.active canvas")]
      .filter(canvas => canvas.offsetParent !== null);
  }

  function resizeCharts(delay = 100) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      activeCanvases().forEach(canvas => {
        const holder = canvas.closest(".chart, .svg-chart") || canvas.parentElement;
        if (!holder) return;
        const width = Math.max(1, Math.round(holder.clientWidth));
        const height = Math.max(1, Math.round(holder.clientHeight));
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";

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

  function scheduleResize() {
    resizeCharts(50);
    setTimeout(() => resizeCharts(0), 250);
    setTimeout(() => resizeCharts(0), 700);
  }

  function installHints() {
    if (!isIOS) return;
    let popover = document.querySelector(".ios-hint-popover");
    if (!popover) {
      popover = document.createElement("div");
      popover.className = "ios-hint-popover";
      popover.setAttribute("role", "status");
      document.body.appendChild(popover);
    }

    document.querySelectorAll(".tab[title]").forEach(tab => {
      tab.dataset.hint = tab.getAttribute("title") || "";
      tab.removeAttribute("title");
    });

    document.querySelectorAll(".hint-dot[title], .plan-hint[title]").forEach(button => {
      button.dataset.hint = button.getAttribute("title") || "";
      button.removeAttribute("title");
    });

    document.addEventListener("click", event => {
      const hint = event.target.closest(".hint-dot, .plan-hint");
      if (!hint || !hint.dataset.hint) return;
      event.preventDefault();
      event.stopPropagation();
      clearTimeout(hintTimer);
      popover.textContent = hint.dataset.hint;
      popover.classList.add("is-visible");
      hintTimer = setTimeout(() => popover.classList.remove("is-visible"), 3500);
    }, true);
  }

  window.addEventListener("load", () => {
    installHints();
    scheduleResize();
  }, { once: true });

  window.addEventListener("orientationchange", scheduleResize);
  window.addEventListener("pageshow", scheduleResize);
  window.addEventListener("resize", () => resizeCharts(120));
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", () => resizeCharts(120));
  }

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) scheduleResize();
  });

  document.addEventListener("click", event => {
    if (event.target.closest(".tab, [role='tab'], .nav-item")) {
      setTimeout(scheduleResize, 80);
    }
  }, true);

  const observer = new MutationObserver(mutations => {
    if (mutations.some(m => [...m.addedNodes].some(n => n.nodeType === 1))) {
      installHints();
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
