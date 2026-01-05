// Tiny helper: highlight active nav link where possible.
// This is purely cosmetic; it also subtly shows what path the browser thinks you're on.
(() => {
  const here = window.location.pathname.replace(/\/+$/, "");
  const links = document.querySelectorAll(".nav a");

  for (const a of links) {
    try {
      const url = new URL(a.getAttribute("href"), window.location.href);
      const path = url.pathname.replace(/\/+$/, "");
      if (path === here && !a.classList.contains("active")) a.classList.add("active");
    } catch (_) {
      // ignore weird hrefs
    }
  }
})();
