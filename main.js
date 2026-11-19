{
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  if (fine) document.documentElement.classList.add("cur");

  /* ---------- 1. Generated artwork for each project (preview cards + phone thumbnails) ---------- */
  const rnd = (seed) => {
    let s = seed;
    return () => (s = (s * 16807) % 2147483647) / 2147483647;
  };
  const C = {
    b: "#0b0b0b",
    t: "#ffe500",
    l: "#dcdcd4",
    k: "#0b0b0b",
    w: "#fff",
  };
  const arts = [
    (r) => {
      let o = `<rect width="300" height="220" fill="${C.b}"/>`;
      for (let i = 9; i > 0; i--)
        o += `<circle cx="${150 + i * 6}" cy="${110 - i * 3}" r="${i * 17}" fill="${i % 2 ? C.t : C.b}"/>`;
      return o + `<circle cx="150" cy="110" r="14" fill="${C.w}"/>`;
    },
    (r) => {
      let o = `<rect width="300" height="220" fill="${C.t}"/>`;
      for (let i = 0; i < 15; i++) {
        const h = 30 + r() * 170;
        o += `<rect x="${12 + i * 19}" y="${220 - h}" width="12" height="${h}" rx="6" fill="${i % 4 ? C.k : C.w}"/>`;
      }
      return o;
    },
    (r) => {
      let o = `<rect width="300" height="220" fill="${C.l}"/>`;
      for (let y = 0; y < 8; y++)
        for (let x = 0; x < 11; x++) {
          const v = (Math.sin(x * 0.7 + y * 0.5) + 1) / 2;
          o += `<circle cx="${18 + x * 26.5}" cy="${18 + y * 26.3}" r="${2 + v * 10}" fill="${C.b}"/>`;
        }
      return o;
    },
    (r) => {
      let o = `<rect width="300" height="220" fill="${C.k}"/><circle cx="150" cy="190" r="120" fill="${C.t}"/>`;
      for (let i = 0; i < 7; i++)
        o += `<rect x="0" y="${92 + i * 15}" width="300" height="${3 + i * 1.3}" fill="${C.k}"/>`;
      return o + `<circle cx="236" cy="54" r="16" fill="${C.l}"/>`;
    },
    (r) => {
      let o = `<rect width="300" height="220" fill="${C.w}"/>`;
      for (let y = 0; y < 6; y++)
        for (let x = 0; x < 9; x++)
          if ((x + y) % 2) {
            const d = Math.sin(x * 0.8) * 14,
              X = x * 34 - 3,
              Y = y * 38 + d;
            o += `<polygon points="${X},${Y} ${X + 34},${Y + 8} ${X + 34},${Y + 46} ${X},${Y + 38}" fill="${C.b}"/>`;
          }
      return o + `<circle cx="226" cy="150" r="34" fill="${C.t}"/>`;
    },
  ];
  const svg = (i, seed) =>
    `<svg viewBox="0 0 300 220" preserveAspectRatio="xMidYMid slice">${arts[i](rnd(seed))}</svg>`;

  const list = document.getElementById("list");
  const rows = [...list.querySelectorAll(".row")];
  rows.forEach((r, i) =>
    r.insertAdjacentHTML(
      "beforeend",
      `<span class="thumb">${svg(i, 7 + i * 31)}</span>`,
    ),
  );
  const pv = document.getElementById("pv");
  pv.innerHTML = rows
    .map((r, i) => `<div>${svg(i, 7 + i * 31)}</div>`)
    .join("");

  /* ---------- 2. Track the mouse, and grow the custom cursor over links ---------- */
  let px = innerWidth / 2,
    py = innerHeight / 2,
    sx = px,
    sy = py,
    last = -1e9,
    prevX = px;
  addEventListener(
    "pointermove",
    (e) => {
      px = e.clientX;
      py = e.clientY;
      last = performance.now();
    },
    { passive: true },
  );
  const dot = document.getElementById("dot");
  document.querySelectorAll("a,button,.row").forEach((el) => {
    el.addEventListener("pointerenter", () => dot.classList.add("big"));
    el.addEventListener("pointerleave", () => dot.classList.remove("big"));
  });

  /* ---------- 3. The big name: each letter is an object with position, speed and width ---------- */
  const hero = document.querySelector(".hero");
  const chars = [...document.querySelectorAll(".ch")].map((el) => ({
    el,
    ch: el.textContent,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    w: 72,
    g: 800,
  }));
  let heroOn = true;
  const io = new IntersectionObserver((es) =>
    es.forEach((e) => (heroOn = e.isIntersecting)),
  );
  io.observe(hero);
  const shapes = [...document.querySelectorAll(".shape")];

  if (!reduce) {
    const glyphs = "ABCDEFGHJKMNPRSTUVWXYZ#%&@*";
    chars.forEach((c, i) => {
      let n = 0;
      const stop = 8 + i * 3;
      const id = setInterval(() => {
        c.el.textContent =
          ++n >= stop ? c.ch : glyphs[(Math.random() * glyphs.length) | 0];
        if (n >= stop) clearInterval(id);
      }, 45);
    });
  }

  /* ---------- 4. Scrolling text bands ---------- */
  const tracks = [...document.querySelectorAll(".track")].map((el) => ({
    el,
    x: 0,
    s: parseFloat(el.dataset.s),
  }));
  let lastY = scrollY,
    vel = 0;

  /* ---------- 5. Split the About sentence into words for the highlighter effect ---------- */
  const big = document.getElementById("big");
  big.innerHTML = big.textContent
    .split(" ")
    .map((w) => `<span class="w">${w}</span>`)
    .join(" ");
  const words = [...big.querySelectorAll(".w")];

  /* ---------- 6. Split the contact heading into letters that stretch on hover ---------- */
  const cta = document.getElementById("cta");
  cta.setAttribute("aria-label", cta.textContent);
  cta.innerHTML = cta.textContent
    .split(" ")
    .map(
      (w) =>
        `<span style="white-space:nowrap" aria-hidden="true">${[...w].map((l) => `<span class="l">${l}</span>`).join("")}</span>`,
    )
    .join(" ");

  /* ---------- 7. Floating preview card on the work list ---------- */
  let pvi = -1,
    pvx = px,
    pvy = py,
    pvr = 0;
  list.querySelectorAll(".row").forEach((r) => {
    r.addEventListener("pointerenter", () => {
      pvi = +r.dataset.i;
      pv.classList.add("on");
      [...pv.children].forEach((d, i) => d.classList.toggle("on", i === pvi));
    });
    r.addEventListener("pointerleave", () => pv.classList.remove("on"));
  });

  /* ---------- 8. Spinning badge ---------- */
  const badge = document.getElementById("badge");
  let rot = 0;

  /* ---------- 9. The main loop: runs about 60 times a second ----------
   Letters: the closer the cursor, the wider and bolder a letter gets and the
   further it is pushed away. A spring (vx, vy) makes it wobble back.
   If the mouse is still for 2.5 seconds, an invisible "ghost cursor" takes over. */
  const frame = (t) => {
    const idle = t - last > 2500;
    const hr = hero.getBoundingClientRect();
    const tx = idle ? innerWidth * (0.5 + 0.38 * Math.sin(t * 0.0006)) : px;
    const ty = idle
      ? hr.top + hr.height * (0.42 + 0.22 * Math.sin(t * 0.0013))
      : py;
    sx += (tx - sx) * (idle ? 0.06 : 0.25);
    sy += (ty - sy) * (idle ? 0.06 : 0.25);
    dot.style.transform = `translate(${px}px,${py}px)`;

    const y = scrollY;
    vel += (y - lastY - vel) * 0.15;
    lastY = y;

    if (heroOn) {
      const R = Math.max(200, innerWidth * 0.2);
      for (const c of chars) {
        const b = c.el.getBoundingClientRect();
        const cx = b.left + b.width / 2 - c.x,
          cy = b.top + b.height / 2 - c.y;
        const dx = cx - sx,
          dy = cy - sy,
          d = Math.hypot(dx, dy) || 1;
        let f = Math.max(0, 1 - d / R);
        f = f * f * (3 - 2 * f);
        const ox = (dx / d) * f * R * 0.22,
          oy = (dy / d) * f * R * 0.16;
        c.vx = (c.vx + (ox - c.x) * 0.1) * 0.8;
        c.vy = (c.vy + (oy - c.y) * 0.1) * 0.8;
        c.x += c.vx;
        c.y += c.vy;
        c.w += (72 + 53 * f - c.w) * 0.14;
        c.g += (800 + 100 * f - c.g) * 0.14;
        c.el.style.transform = `translate(${c.x.toFixed(1)}px,${c.y.toFixed(1)}px) rotate(${(c.vx * 0.6).toFixed(2)}deg)`;
        c.el.style.fontVariationSettings = `"wdth" ${c.w.toFixed(1)},"wght" ${c.g.toFixed(0)}`;
      }
      const nx = sx / innerWidth - 0.5,
        ny = (sy - hr.top) / hr.height - 0.5;
      for (const s of shapes) {
        const k = +s.dataset.d;
        s.style.transform = `translate(${nx * k}px,${ny * k + y * k * -0.004}px)`;
      }
    }

    for (const tr of tracks) {
      tr.x -= tr.s * (1.4 + Math.abs(vel) * 0.5);
      const half = tr.el.scrollWidth / 2;
      if (tr.x < -half) tr.x += half;
      if (tr.x > 0) tr.x -= half;
      tr.el.style.transform = `translateX(${tr.x}px) skewX(${Math.max(-14, Math.min(14, -vel * 0.6))}deg)`;
    }

    rot += 0.35 + Math.abs(vel) * 0.4;
    badge.style.transform = `rotate(${rot}deg)`;

    const ab = big.getBoundingClientRect();
    const p = Math.min(
      1,
      Math.max(
        0,
        (innerHeight * 0.85 - ab.top) / (ab.height + innerHeight * 0.35),
      ),
    );
    const lit = Math.round(p * words.length);
    words.forEach((w, i) => w.classList.toggle("on", i < lit));

    if (pv.classList.contains("on")) {
      pvx += (px - pvx) * 0.14;
      pvy += (py - pvy) * 0.14;
      pvr += (Math.max(-12, Math.min(12, (px - prevX) * 0.5)) - pvr) * 0.1;
      pv.style.transform = `translate(${pvx + 24}px,${pvy - 110}px) rotate(${pvr}deg)`;
    } else {
      pvx = px;
      pvy = py;
    }
    prevX = px;

    requestAnimationFrame(frame);
  };
  if (reduce) words.forEach((w) => w.classList.add("on"));
  else requestAnimationFrame(frame);

  /* ---------- 10. Kuopio clock and the copy-email button ---------- */
  const clock = document.getElementById("clock");
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Helsinki",
    hour: "2-digit",
    minute: "2-digit",
  });
  const tick = () => (clock.textContent = "Kuopio " + fmt.format(new Date()));
  tick();
  setInterval(tick, 15000);
  const copy = document.getElementById("copy");
  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText("roberthillary30@gmail.com");
      copy.textContent = "Copied!";
    } catch (e) {
      copy.textContent = "Select the address to copy";
    }
    setTimeout(() => (copy.textContent = "Copy email"), 2000);
  });
}
