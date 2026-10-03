const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
root.classList.add("js");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

$("#year").textContent = new Date().getFullYear();

/* live clock */
const clock = $("#clock");
const tick = () => (clock.textContent = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
tick(); setInterval(tick, 1000);

/* toolkit marquee rows (letter badges, no brand logos) */
const rows = [
  [["WordPress", "CMS & Themes", "#21759b"], ["WooCommerce", "eCommerce", "#7f54b3"], ["Shopify", "Storefronts", "#5a863e"], ["Elementor", "Page Builder", "#d30c5c"], ["WPBakery", "Page Builder", "#1f8ef1"], ["ACF", "Custom Fields", "#1f6f6f"]],
  [["HTML5", "Markup", "#e44d26"], ["CSS3", "Flexbox & Grid", "#2965f1"], ["JavaScript", "Interactivity", "#c9a800"], ["MySQL", "Database", "#00758f"], ["phpMyAdmin", "DB Admin", "#f89c0e"], ["Responsive", "Mobile-first", "#0099ff"]],
  [["Git", "Version Control", "#f05133"], ["GitHub", "Repositories", "#444"], ["cPanel", "Hosting", "#ff6c2c"], ["FTP", "File Transfer", "#5b6b8a"], ["Core Web Vitals", "Performance", "#14a67a"], ["SEO", "Search", "#6a5cff"]],
  [["Slack", "Team Comms", "#611f69"], ["Trello", "Project Mgmt", "#0079bf"], ["Google Workspace", "Docs & Sheets", "#1a73e8"], ["Suno", "AI Music", "#d946a8"], ["Google Flow", "AI Video", "#e8710a"], ["Prompting", "AI Tools", "#0099ff"]],
];
$("#marqs").innerHTML = rows.map((r) => {
  const cells = r.map(([n, c, col]) => `<div class="cell"><span class="bd" style="--c:${col}">${n[0]}</span><b>${n}</b><small>${c}</small></div>`).join("");
  return `<div class="mrow"><div class="mtrack">${cells}${cells}</div></div>`;
}).join("");

/* reveal on scroll */
[".head", ".list details", ".hc", ".pj a", ".bento > *", ".pcard", ".cform > *", ".info3 > *", ".marqs"].forEach((sel) => {
  $$(sel).forEach((el) => {
    el.classList.add("rv");
    const i = el.parentElement ? [...el.parentElement.children].indexOf(el) : 0;
    el.style.setProperty("--rd", (i % 3) * 0.08 + "s");
  });
});
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
}, { threshold: 0.1, rootMargin: "0px 0px -5% 0px" });
$$(".rv").forEach((el) => io.observe(el));

/* sidebar scrollspy */
const links = $$(".side nav a[href^='#']");
const sio = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
  });
}, { rootMargin: "-35% 0px -60% 0px" });
$$("main section[id]").forEach((s) => sio.observe(s));

/* spotlight hover */
$$(".tiles div, .hc, .pj a, .sk").forEach((el) => {
  el.classList.add("spot");
  el.addEventListener("mousemove", (e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", e.clientX - r.left + "px");
    el.style.setProperty("--my", e.clientY - r.top + "px");
  });
});

/* smooth accordion, one open at a time */
$$("details").forEach((d) => {
  const sum = $("summary", d), body = $(".more", d);
  sum.addEventListener("click", (ev) => {
    ev.preventDefault();
    if (reduce) { d.open = !d.open; return; }
    if (d.open) {
      const a = body.animate({ height: [body.offsetHeight + "px", "0px"], opacity: [1, 0] }, { duration: 300, easing: "ease" });
      a.onfinish = () => { d.open = false; };
    } else {
      $$("details[open]").forEach((o) => { if (o !== d) $("summary", o).click(); });
      d.open = true;
      body.animate({ height: ["0px", body.offsetHeight + "px"], opacity: [0, 1] }, { duration: 400, easing: "cubic-bezier(.2,.8,.2,1)" });
    }
  });
});

/* contact form: opens the visitor's email app with the message filled in */
const form = $("#cform"), note = $("#note");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(form);
  let ok = true;
  ["name", "email", "msg"].forEach((k) => {
    const el = form.elements[k];
    const bad = !String(f.get(k) || "").trim() || (k === "email" && !/^\S+@\S+\.\S+$/.test(f.get("email")));
    el.classList.toggle("bad", bad);
    if (bad) ok = false;
  });
  if (!ok) { note.textContent = "Please fill in your name, a valid email and a message."; note.className = "note err"; return; }
  const subject = encodeURIComponent("Message from " + f.get("name"));
  const body = encodeURIComponent(`${f.get("msg")}\n\nName: ${f.get("name")}\nEmail: ${f.get("email")}${f.get("phone") ? "\nPhone: " + f.get("phone") : ""}`);
  note.textContent = "Opening your email app...";
  note.className = "note";
  location.href = `mailto:achunithin97@outlook.com?subject=${subject}&body=${body}`;
  form.reset();
});
