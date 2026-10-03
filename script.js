const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
root.classList.add("js");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

$("#year").textContent = new Date().getFullYear();

/* dark-mode switch */
const tgl = $("#theme");
function setTheme(t) {
  root.dataset.theme = t;
  tgl.setAttribute("aria-checked", t === "dark");
  try { localStorage.setItem("theme", t); } catch (e) {}
}
try {
  const saved = localStorage.getItem("theme");
  if (saved) setTheme(saved);
} catch (e) {}
tgl.addEventListener("click", () => setTheme(root.dataset.theme === "dark" ? "light" : "dark"));

/* scroll reveal */
["section > h2", "section > .lead", ".col > *", ".stats > div", ".trio .tc", ".post", ".more-btn", ".cr > *", ".acc details", ".foot .fr > div"].forEach((sel) => {
  $$(sel).forEach((el) => {
    el.classList.add("rv");
    const i = el.parentElement ? [...el.parentElement.children].indexOf(el) : 0;
    el.style.setProperty("--rd", Math.min(i, 5) * 0.07 + "s");
  });
});
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
}, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
$$(".rv").forEach((el) => io.observe(el));

/* count-up stats */
const cio = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    cio.unobserve(e.target);
    if (reduce) return;
    const n = +e.target.dataset.count, suf = e.target.dataset.suffix || "", t0 = performance.now();
    (function step(now) {
      const p = Math.min((now - t0) / 1600, 1);
      e.target.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))) + suf;
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  });
}, { threshold: 0.7 });
$$("[data-count]").forEach((b) => cio.observe(b));

/* scroll-linked effects */
const nav = $("#nav");
const tilts = $$(".pic, .cl");
const cards = $$(".pc");
let ticking = false;
function update() {
  ticking = false;
  const y = scrollY, vh = innerHeight;
  nav.classList.toggle("compact", y > 90);
  flipFrame(y, vh);

  if (!reduce) {
    tilts.forEach((el) => {
      const r = el.getBoundingClientRect();
      const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / (vh * 0.7)));
      const target = el.classList.contains("pic") ? $(".pic-in", el) : $(".cphoto", el);
      target.style.setProperty("--p", p.toFixed(3));
    });

    // stacked cards: shrink cards that are covered by the ones after them
    const stickTop = innerWidth <= 900 ? 80 : 90;
    cards.forEach((c, i) => {
      let covered = 0;
      for (let j = i + 1; j < cards.length; j++) if (cards[j].getBoundingClientRect().top <= stickTop + 24 * (j - i)) covered++;
      c.style.transform = `scale(${1 - covered * 0.035}) translateY(${covered * -6}px)`;
      c.style.filter = covered ? `brightness(${1 - covered * 0.07})` : "";
    });
  }
}
addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
addEventListener("resize", update);
update();

/* hero card -> services card: travels, flips, and lands as the tilted picture */
const fc = $(".fc"), fcIn = $(".fc-in"), fcHi = $(".fc-hi"), fcLayers = $$(".fc-back i");
const heroPhoto = $(".photo"), heroHi = $(".hi"), slot = $("#services .pic"), slotIn = $("#services .pic-in");
const mqFlip = matchMedia("(min-width: 901px)");
const DEFAULT_IMG = "assets/shots/thegiftmarche.jpg";
var A = null, flipOn = false, curLayer = 0;
const docRect = (el) => { let x = 0, y = 0, n = el; while (n) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; } return { x, y, w: el.offsetWidth, h: el.offsetHeight }; };
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => t * t * (3 - 2 * t);

function setServiceImg(src) {
  if (slotIn) slotIn.style.backgroundImage = `url(${src})`;
  const next = 1 - curLayer;
  fcLayers[next].style.backgroundImage = `url(${src})`;
  fcLayers[next].classList.add("on");
  fcLayers[curLayer].classList.remove("on");
  curLayer = next;
}
function layoutFlip() {
  flipOn = mqFlip.matches && !reduce && !!fc && !!slot;
  root.classList.toggle("flip-on", flipOn);
  slot && slot.classList.toggle("flip-slot", flipOn);
  if (!flipOn) { A = null; return; }
  const s = docRect(heroPhoto), e = docRect(slot), hiS = heroHi.offsetWidth || 124;
  A = { s, e, hiS, s1: Math.max(1, e.y + e.h / 2 - innerHeight / 2) };
  update();
}
function flipFrame(y, vh) {
  if (!flipOn || !A) return;
  const { s, e, hiS, s1 } = A;
  const t = Math.max(0, Math.min(1, y / s1)), k = ease(t);
  const w = lerp(s.w, e.w, k), hgt = lerp(s.h, e.h, k);
  const cx = lerp(s.x + s.w / 2, e.x + e.w / 2, k), cy = lerp(s.y + s.h / 2, e.y + e.h / 2, k);
  const p = Math.max(-1, Math.min(1, (e.y + e.h / 2 - y - vh / 2) / (vh * 0.7)));
  fc.style.width = w + "px"; fc.style.height = hgt + "px";
  fc.style.transform = `translate3d(${cx - w / 2}px, ${cy - hgt / 2}px, 0)`;
  fcIn.style.transform = `rotateY(${180 * k - 16 * p * k}deg) rotateZ(${6 * p * k}deg)`;
  // "Hi" bubble rides the corner, turns into a wave, then shrinks to a dot
  const bx = lerp(0, w * 0.975, k), by = lerp(hgt, hgt * 0.985, k);
  const sc = lerp(1, 0.13, ease(Math.max(0, (t - 0.45) / 0.55)));
  fcHi.style.width = fcHi.style.height = hiS + "px";
  fcHi.style.margin = `${-hiS / 2}px 0 0 ${-hiS / 2}px`;
  fcHi.style.transform = `translate(${bx}px, ${by}px) scale(${sc})`;
  $(".t1", fcHi).style.opacity = t < 0.2 ? 1 : 0;
  $(".t2", fcHi).style.opacity = t >= 0.2 && t < 0.7 ? 1 : 0;
  fc.style.visibility = y > s1 + vh * 1.2 ? "hidden" : "visible";
}
if (slot) {
  setServiceImg(DEFAULT_IMG);
  layoutFlip();
  addEventListener("resize", layoutFlip);
  addEventListener("load", layoutFlip);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutFlip);
  mqFlip.addEventListener("change", layoutFlip);
}

/* smooth accordion */
$$("details").forEach((d) => {
  const sum = $("summary", d), body = $("ul", d);
  sum.addEventListener("click", (ev) => {
    ev.preventDefault();
    if (d.dataset.img) setServiceImg(d.open ? DEFAULT_IMG : d.dataset.img);
    if (reduce) { d.open = !d.open; return; }
    if (d.open) {
      const a = body.animate({ height: [body.offsetHeight + "px", "0px"], opacity: [1, 0] }, { duration: 280, easing: "ease" });
      a.onfinish = () => { d.open = false; };
    } else {
      d.open = true;
      body.animate({ height: ["0px", body.offsetHeight + "px"], opacity: [0, 1] }, { duration: 380, easing: "cubic-bezier(.2,.8,.2,1)" });
    }
  });
});

/* contact form: opens the visitor's email app with the message filled in */
$("#form").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const subject = encodeURIComponent(`Portfolio enquiry${f.get("service") ? ": " + f.get("service") : ""}`);
  const body = encodeURIComponent(`Hi Nithin,\n\n${f.get("msg") || ""}\n\nName: ${f.get("name")}\nEmail: ${f.get("email")}`);
  location.href = `mailto:achunithin97@outlook.com?subject=${subject}&body=${body}`;
});
