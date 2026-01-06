// =====================
// Portfolio JS (Theme + Filters + Modal + Cursor Animations)
// FIXED: Buddy eyes will NOT disappear on click
// =====================

// Theme init
(function initTheme(){
  const saved = localStorage.getItem("theme");
  if (saved) document.body.setAttribute("data-theme", saved);
})();

function toggleTheme(){
  const current = document.body.getAttribute("data-theme") || "dark";
  const next = current === "dark" ? "light" : "dark";
  document.body.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  toast(`Theme: ${next}`);
}

// Active nav highlight
(function setActiveLink(){
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("[data-nav]").forEach(a => {
    const href = a.getAttribute("href");
    if (href === path) a.classList.add("active");
  });
})();

// Toast helper
function toast(msg){
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 1800);
}

// Keyboard navigation (Alt + 1..6)
(function keyboardNav(){
  const map = {
    "1": "index.html",
    "2": "about.html",
    "3": "academics.html",
    "4": "projects.html",
    "5": "gallery.html",
    "6": "contact.html",
  };

  document.addEventListener("keydown", (e) => {
    if (!e.altKey) return;
    if (map[e.key]) location.href = map[e.key];
  });
})();

// =====================
// Cursor Glow (follows mouse smoothly)
// =====================
(function cursorGlow(){
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  const glow = document.createElement("div");
  glow.className = "cursor-glow";
  document.body.appendChild(glow);

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let x = targetX, y = targetY;

  const lerp = (a, b, t) => a + (b - a) * t;

  window.addEventListener("mousemove", (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
  }, { passive: true });

  function animate(){
    x = lerp(x, targetX, 0.14);
    y = lerp(y, targetY, 0.14);
    glow.style.left = x + "px";
    glow.style.top = y + "px";
    requestAnimationFrame(animate);
  }
  animate();
})();

// =====================
// Buddy Eyes (looks at mouse)
// FIXED: Click makes it bounce (NOT disappear)
// Optional: Right-click can hide it
// =====================
(function buddyEyes(){
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  // If you previously hid it before, clear it automatically
  // so you don't get confused.
  if (localStorage.getItem("buddyOff") === "1") {
    localStorage.removeItem("buddyOff");
  }

  const buddy = document.createElement("div");
  buddy.className = "buddy";
  buddy.setAttribute("aria-label", "Buddy eyes");
  buddy.title = "Buddy eyes";

  buddy.innerHTML = `
    <div class="hint">I’m watching your cursor 👀 (left click = bounce)</div>
    <div class="eye"><div class="pupil" data-pupil="1"></div></div>
    <div class="eye"><div class="pupil" data-pupil="2"></div></div>
  `;
  document.body.appendChild(buddy);

  const pupils = buddy.querySelectorAll(".pupil");
  const eyes = buddy.querySelectorAll(".eye");

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  function movePupil(eyeEl, pupilEl){
    const rect = eyeEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dx = mouseX - cx;
    const dy = mouseY - cy;

    const max = 6; // max pupil movement px
    const angle = Math.atan2(dy, dx);
    const dist = Math.min(max, Math.hypot(dx, dy) / 25);

    const px = Math.cos(angle) * dist;
    const py = Math.sin(angle) * dist;

    pupilEl.style.transform = `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`;
  }

  function loop(){
    movePupil(eyes[0], pupils[0]);
    movePupil(eyes[1], pupils[1]);
    requestAnimationFrame(loop);
  }
  loop();

  // Left click = bounce + toast
  buddy.addEventListener("click", () => {
    buddy.classList.remove("pop");
    void buddy.offsetWidth; // restart animation
    buddy.classList.add("pop");
    toast("👀 Hey!");
  });

  // OPTIONAL: Right click hides it (if you want)
  buddy.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    localStorage.setItem("buddyOff", "1");
    buddy.remove();
    toast("Buddy hidden (right click).");
  });
})();

// =====================
// Projects filter/search
// =====================
function setupProjects(){
  const wrap = document.getElementById("projectsWrap");
  if (!wrap) return;

  const chips = document.querySelectorAll("[data-chip]");
  const search = document.getElementById("search");
  let active = "all";

  function apply(){
    const q = (search?.value || "").trim().toLowerCase();
    wrap.querySelectorAll(".project").forEach(card => {
      const tags = (card.getAttribute("data-tags") || "").toLowerCase();
      const text = card.innerText.toLowerCase();
      const matchChip = active === "all" ? true : tags.includes(active);
      const matchSearch = q ? (text.includes(q) || tags.includes(q)) : true;
      card.style.display = (matchChip && matchSearch) ? "grid" : "none";
    });
  }

  chips.forEach(ch => {
    ch.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("active"));
      ch.classList.add("active");
      active = ch.getAttribute("data-chip");
      apply();
    });
  });

  search?.addEventListener("input", apply);
  apply();
}
setupProjects();

// =====================
// Gallery modal
// =====================
function setupGallery(){
  const modal = document.getElementById("modal");
  if (!modal) return;

  const title = document.getElementById("modalTitle");
  const content = document.getElementById("modalContent");
  const closeBtn = document.getElementById("modalClose");

  function close(){
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
  }

  closeBtn?.addEventListener("click", close);
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

  document.querySelectorAll("[data-open]").forEach(item => {
    item.addEventListener("click", () => {
      const t = item.getAttribute("data-title") || "Preview";
      const type = item.getAttribute("data-type");
      const src = item.getAttribute("data-src");

      title.textContent = t;

      if (type === "image"){
        content.innerHTML =
          `<img alt="${t}" src="${src}" style="border-radius:16px;border:1px solid rgba(255,120,90,.18);width:100%;">`;
      } else if (type === "video"){
        content.innerHTML = `
          <video controls style="width:100%;border-radius:16px;border:1px solid rgba(255,120,90,.18);">
            <source src="${src}" type="video/mp4">
            Your browser does not support video.
          </video>`;
      } else {
        content.innerHTML = `<div class="help">No preview type.</div>`;
      }

      modal.classList.add("show");
      modal.setAttribute("aria-hidden", "false");
    });
  });
}
setupGallery();

// =====================
// Contact form validation
// =====================
function setupContact(){
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const msg = form.message.value.trim();

    if (!name || !email || !msg){
      toast("Please fill all fields.");
      return;
    }
    if (!email.includes("@")){
      toast("Enter a valid email.");
      return;
    }

    try {
      // Send form data to FormSubmit in background
      const formData = new FormData(form);
      await fetch("https://formsubmit.co/slom3010bajaba@gmail.com", {
        method: "POST",
        body: formData
      });

      // Show success message
      const successMsg = document.getElementById("successMessage");
      const formContainer = document.getElementById("formContainer");
      if (successMsg && formContainer) {
        formContainer.style.display = "none";
        successMsg.style.display = "block";
      }
      
      form.reset();
    } catch (error) {
      toast("Error sending message. Please try again.");
      console.error(error);
    }
  });

  const copyBtn = document.getElementById("copyEmail");
  copyBtn?.addEventListener("click", async () => {
    const email = copyBtn.getAttribute("data-email") || "";
    try{
      await navigator.clipboard.writeText(email);
      toast("Email copied!");
    }catch{
      toast("Copy failed.");
    }
  });
}
setupContact();
