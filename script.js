// Mark JS as available so reveal animations only apply when scripts run.
document.documentElement.classList.add("js");

const header = document.querySelector(".header");
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");
const themeToggle = document.getElementById("theme-toggle");
const progressBar = document.getElementById("scroll-progress");
const backToTop = document.getElementById("back-to-top");
const MOBILE_BREAKPOINT = 760;

/* =========================
   MOBILE MENU
========================= */

function setMenu(open) {
  if (!menuToggle || !navLinks) return;
  navLinks.classList.toggle("active", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute(
    "aria-label",
    open ? "Close navigation menu" : "Open navigation menu"
  );
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    setMenu(!navLinks.classList.contains("active"));
  });

  // Close after choosing a link.
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  // Close with Escape.
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navLinks.classList.contains("active")) {
      setMenu(false);
      menuToggle.focus();
    }
  });

  // Close when clicking outside the header.
  document.addEventListener("click", (event) => {
    if (
      navLinks.classList.contains("active") &&
      !header.contains(event.target)
    ) {
      setMenu(false);
    }
  });

  // Reset when returning to desktop width.
  window.addEventListener("resize", () => {
    if (window.innerWidth > MOBILE_BREAKPOINT) setMenu(false);
  });
}

/* =========================
   THEME (DARK / LIGHT)
========================= */

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);

  const isDark = theme === "dark";
  const icon = themeToggle && themeToggle.querySelector(".theme-icon");
  if (icon) icon.textContent = isDark ? "☀" : "☾";
  if (themeToggle) {
    themeToggle.setAttribute(
      "aria-label",
      isDark ? "Switch to light theme" : "Switch to dark theme"
    );
  }

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", isDark ? "#080d19" : "#f5f7fc");
}

let savedTheme = null;
try {
  savedTheme = localStorage.getItem("theme");
} catch (e) {}

if (!savedTheme) {
  savedTheme = window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}
applyTheme(savedTheme);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const next =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "light"
        : "dark";
    applyTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch (e) {}
  });
}

/* =========================
   SCROLL: PROGRESS, HEADER, BACK-TO-TOP
========================= */

let ticking = false;

function onScroll() {
  const scrollTop = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? scrollTop / max : 0;

  if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
  if (header) header.classList.toggle("scrolled", scrollTop > 10);
  if (backToTop) backToTop.classList.toggle("visible", scrollTop > 600);

  ticking = false;
}

window.addEventListener(
  "scroll",
  () => {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  },
  { passive: true }
);
onScroll();

if (backToTop) {
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* =========================
   ACTIVE NAV LINK (SCROLL SPY)
========================= */

const sections = document.querySelectorAll("main section[id]");
const navAnchors = document.querySelectorAll(".nav-links a");

if ("IntersectionObserver" in window && sections.length) {
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navAnchors.forEach((link) => {
          const isCurrent = link.getAttribute("href") === `#${entry.target.id}`;
          link.classList.toggle("active", isCurrent);
          if (isCurrent) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );

  sections.forEach((section) => spy.observe(section));
}

/* =========================
   SCROLL REVEAL
========================= */

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("in-view"));
}

/* =========================
   FOOTER YEAR
========================= */

const yearElement = document.getElementById("year");
if (yearElement) yearElement.textContent = new Date().getFullYear();
