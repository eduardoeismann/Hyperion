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
