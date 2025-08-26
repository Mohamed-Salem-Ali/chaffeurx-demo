// Mobile nav toggle
const hamburger = document.getElementById("hamburger");
const nav = document.getElementById("nav");
if (hamburger) hamburger.addEventListener("click", () => nav.classList.toggle("open"));

// Testimonials carousel (home only)
let currentSlide = 0;
const slides = document.querySelectorAll("#testimonial-carousel .slide");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
function showSlide(i){ slides.forEach((s,idx)=>s.classList.toggle("active", idx===i)); }
if (prevBtn && nextBtn) {
  prevBtn.addEventListener("click", ()=>{ currentSlide=(currentSlide-1+slides.length)%slides.length; showSlide(currentSlide); });
  nextBtn.addEventListener("click", ()=>{ currentSlide=(currentSlide+1)%slides.length; showSlide(currentSlide); });
  setInterval(()=>{ currentSlide=(currentSlide+1)%slides.length; showSlide(currentSlide); }, 5000);
}

// Inject theme toggle into header (works on all pages without editing HTML)
(function injectThemeToggle(){
  const header = document.querySelector(".header");
  if (!header) return;
  const btn = document.createElement("button");
  btn.className = "theme-toggle";
  btn.type = "button";
  btn.title = "Toggle theme";
  btn.ariaLabel = "Toggle theme";
  btn.textContent = "🌓";
  btn.addEventListener("click", () => {
    const next = (localStorage.getItem("theme") || "system") === "dark" ? "light" : "dark";
    localStorage.setItem("theme", next);
    applyTheme(next);
  });
  header.appendChild(btn);
})();

// Theme logic
function applyTheme(pref = null) {
  const root = document.documentElement;
  const p = pref || localStorage.getItem("theme") || "system";
  if (p === "system") {
    const dark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "dark" : "light";
  } else {
    root.dataset.theme = p;
  }
}
window.__applyTheme = applyTheme;
applyTheme();
