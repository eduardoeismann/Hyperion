const INITIAL_DELAY_MS = 250;
const LOGO_IN_MS = 3000;
const TAGLINE_DELAY_MS = 700;
const TAGLINE_IN_MS = 2000;

const SPLASH_VISIBLE_AT_MS = Math.max(
  INITIAL_DELAY_MS + LOGO_IN_MS,
  INITIAL_DELAY_MS + TAGLINE_DELAY_MS + TAGLINE_IN_MS
);

const HOLD_MS = 300;
const EXIT_MS = 900;

const splash = document.getElementById("splash");
const app = document.getElementById("app");

const links = Array.from(document.querySelectorAll(".menu a[data-target]"));
const panels = Array.from(document.querySelectorAll("[data-panel]"));

function setActive(targetId) {
  panels.forEach(p => p.classList.toggle("is-active", p.id === targetId));

  links.forEach(a => {
    const isCurrent = a.dataset.target === targetId;
    if (isCurrent) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });

  history.replaceState(null, "", "#" + targetId);
}

links.forEach(a => {
  a.addEventListener("click", (e) => {
    e.preventDefault();
    setActive(a.dataset.target);
  });
});

function initRoute() {
  const hash = (location.hash || "#home").replace("#", "");
  const exists = panels.some(p => p.id === hash);
  setActive(exists ? hash : "home");
}

window.addEventListener("load", () => {
  setTimeout(() => document.body.classList.add("is-ready"), INITIAL_DELAY_MS);

  // delay
  const totalUntilExitStart = SPLASH_VISIBLE_AT_MS + HOLD_MS;

  setTimeout(() => {
    document.body.classList.add("is-exiting");
  }, totalUntilExitStart);

  setTimeout(() => {
    // rm splash
    splash.style.display = "none";
    document.body.classList.add("app-ready");
    initRoute();
  }, totalUntilExitStart + EXIT_MS);
});

window.addEventListener("keydown", (e) => {
  const current = links.findIndex(a => a.getAttribute("aria-current") === "page");
  if (current === -1) return;

  if (e.key === "ArrowRight") {
    const next = Math.min(current + 1, links.length - 1);
    setActive(links[next].dataset.target);
  }
  if (e.key === "ArrowLeft") {
    const prev = Math.max(current - 1, 0);
    setActive(links[prev].dataset.target);
  }
});

(function enableSwipeNavMobileOnly() {
  const mq = window.matchMedia("(max-width: 640px)");
  const isCoarse = () =>
    (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) ||
    (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);

  const stageEl = document.querySelector(".stage") || document.body;

  let startX = 0;
  let startY = 0;
  let startT = 0;

  const MIN_DIST_X = 60;
  const MAX_DIST_Y = 80;
  const MAX_TIME = 650;
  const AXIS_RATIO = 1.2;

  const currentIndex = () => links.findIndex(a => a.getAttribute("aria-current") === "page");

  const goNext = () => {
    const i = currentIndex();
    if (i === -1) return;
    const next = Math.min(i + 1, links.length - 1);
    if (next !== i) setActive(links[next].dataset.target);
  };

  const goPrev = () => {
    const i = currentIndex();
    if (i === -1) return;
    const prev = Math.max(i - 1, 0);
    if (prev !== i) setActive(links[prev].dataset.target);
  };

  const shouldEnable = () => mq.matches && isCoarse();

  const onTouchStart = (e) => {
    if (!shouldEnable()) return;
    if (!e.touches || e.touches.length !== 1) return;

    const t = e.target;
    if (t && t.closest && t.closest("a, button, input, textarea, select, label")) return;

    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    startT = performance.now();
  };

  const onTouchEnd = (e) => {
    if (!shouldEnable()) return;
    if (!startT) return;

    const dt = performance.now() - startT;
    startT = 0;
    if (!e.changedTouches || e.changedTouches.length !== 1) return;
    if (dt > MAX_TIME) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    const dx = endX - startX;
    const dy = endY - startY;

    const adx = Math.abs(dx);
    const ady = Math.abs(dy);

    if (adx < MIN_DIST_X) return;
    if (ady > MAX_DIST_Y) return;
    if (adx < ady * AXIS_RATIO) return;

    if (dx < 0) {
      goNext();
    } else {
      goPrev();
    }

  };

  stageEl.addEventListener("touchstart", onTouchStart, { passive: true });
  stageEl.addEventListener("touchend", onTouchEnd, { passive: true });
})();
