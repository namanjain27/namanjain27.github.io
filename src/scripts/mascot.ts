// Page mascot: a mini cartoon that sits on top of text lines, boxes and the
// window edges, hops to a visible spot when you scroll, and can be dragged,
// thrown and clicked. Everything runs in viewport (position: fixed) coordinates
// and is recomputed every frame, so it follows content as the page scrolls.

type Mode = "perch" | "walk" | "jump" | "fall" | "drag";
type Mood = "" | "happy" | "wink" | "surprised" | "dizzy" | "sleep";

// A horizontal ledge the mascot can stand on, in viewport coordinates.
type Surface = { el: Element | null; top: number; left: number; right: number };

const W = 44; // rendered width (px), matches .mascot in Mascot.astro
const H = 55; // rendered height
const GRAVITY = 2400; // px/s²
const WALK_SPEED = 45; // px/s
const JUMP_MS = 560;
const SLEEP_AFTER_MS = 25000;
const DIZZY_SPEED = 1100; // landing/throw speed that makes him dizzy

// Things worth standing on: text lines, the photo, list rows, opted-in elements.
const PERCH_SELECTOR =
  "main figure, main h2, main p, main li > div > :first-child, [data-mascot-perch]";

export function startMascot() {
  const root = document.getElementById("mascot");
  if (!root) return;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- state -------------------------------------------------------------
  let mode: Mode = "fall";
  let x = 0; // feet centre; set on the first frame, once the viewport has a real size
  let y = -H; // feet (bottom) position
  let vx = 0;
  let vy = 0;
  let perchEl: Element | null = null; // null + perch mode = standing on window bottom
  let perchOffset = 0; // x relative to the ledge's left edge
  let walkTarget = 0; // target offset while walking
  let jump: { x0: number; y0: number; el: Element | null; offset: number; start: number } | null = null;
  let lastInteraction = performance.now();
  let nextIdleAt = performance.now() + 4000;
  let moodTimer = 0;

  // ---- DOM helpers -------------------------------------------------------
  const setMode = (m: Mode) => {
    mode = m;
    root.dataset.mode = m;
  };
  const setMood = (m: Mood, ms = 0) => {
    root.dataset.mood = m;
    clearTimeout(moodTimer);
    if (ms) moodTimer = window.setTimeout(() => (root.dataset.mood = ""), ms);
  };
  const face = (dir: number) => {
    if (dir) root.dataset.facing = dir < 0 ? "left" : "right";
  };
  const flash = (attr: string, ms: number) => {
    root.removeAttribute(`data-${attr}`);
    void root.offsetWidth; // restart the CSS animation
    root.setAttribute(`data-${attr}`, "");
    setTimeout(() => root.removeAttribute(`data-${attr}`), ms);
  };
  const touch = () => {
    lastInteraction = performance.now();
    if (root.dataset.mood === "sleep") setMood("");
  };

  // ---- surfaces ----------------------------------------------------------
  // For text, stand on the first rendered line rather than the whole block,
  // so he sits right on the words even when a paragraph is narrower than its box.
  function ledgeOf(el: Element): Surface | null {
    if (el.closest(".expand-panel:not([data-open])")) return null; // collapsed text
    let rect: DOMRect | null = null;
    const isText = el.matches("p, h1, h2, h3, h4, a, span, button");
    if (isText) {
      const range = document.createRange();
      range.selectNodeContents(el);
      const lines = Array.from(range.getClientRects()).filter((r) => r.width > 0);
      if (lines.length) {
        const top = lines[0].top;
        const sameLine = lines.filter((r) => Math.abs(r.top - top) < 3);
        const left = Math.min(...sameLine.map((r) => r.left));
        const right = Math.max(...sameLine.map((r) => r.right));
        rect = new DOMRect(left, top, right - left, lines[0].height);
      }
    }
    rect ??= el.getBoundingClientRect();
    if (rect.width < 24 || rect.height === 0) return null;
    // Text line boxes include a little space above the letters; sink 2px so feet touch them.
    return { el, top: rect.top + (isText ? 2 : 0), left: rect.left, right: rect.right };
  }

  const floor = (): Surface => ({ el: null, top: innerHeight, left: 0, right: innerWidth });

  function surfaces(): Surface[] {
    const list: Surface[] = [];
    for (const el of document.querySelectorAll(PERCH_SELECTOR)) {
      const s = ledgeOf(el);
      if (s) list.push(s);
    }
    return list;
  }

  // A ledge is a good spot if he'd be fully on screen standing on it.
  const comfortable = (s: Surface) =>
    s.top >= H + 8 && s.top <= innerHeight - 8 && s.right > W && s.left < innerWidth - W;

  // Feet x on a ledge, kept inside its edges and the window.
  const clampOn = (s: Surface, fx: number) => {
    const lo = Math.max(s.left + W * 0.35, W / 2);
    const hi = Math.min(s.right - W * 0.35, innerWidth - W / 2);
    return lo > hi ? (s.left + s.right) / 2 : Math.min(hi, Math.max(lo, fx));
  };

  function currentLedge(): Surface | null {
    if (!perchEl) return floor();
    return perchEl.isConnected ? ledgeOf(perchEl) : null;
  }

  function nearestComfortable(exclude?: Element | null): Surface | null {
    let best: Surface | null = null;
    let bestD = Infinity;
    for (const s of surfaces()) {
      if (s.el === exclude || !comfortable(s)) continue;
      const tx = clampOn(s, x);
      const d = Math.hypot(tx - x, (s.top - y) * 1.4);
      if (d < bestD) {
        bestD = d;
        best = s;
      }
    }
    return best;
  }

  // ---- movement starters -------------------------------------------------
  function perchOn(s: Surface, fx: number) {
    perchEl = s.el;
    perchOffset = clampOn(s, fx) - s.left;
    setMode("perch");
  }

  function jumpTo(s: Surface, fx: number) {
    const tx = clampOn(s, fx);
    if (reduceMotion) {
      x = tx;
      y = s.top;
      return perchOn(s, tx);
    }
    face(tx - x);
    jump = { x0: x, y0: y, el: s.el, offset: tx - s.left, start: performance.now() };
    setMode("jump");
  }

  function startFall(nvx = 0, nvy = 0) {
    perchEl = null;
    vx = nvx;
    vy = nvy;
    setMode("fall");
  }

  function land(s: Surface, speed: number) {
    perchOn(s, x);
    y = s.top;
    vx = vy = 0;
    if (speed > DIZZY_SPEED) setMood("dizzy", 1800);
    else if (root.dataset.mood !== "dizzy") setMood("");
    flash("land", 260);
  }

  // ---- per-frame update --------------------------------------------------
  let last = performance.now();
  let placed = false;
  function frame(now: number) {
    if (!placed) {
      if (innerWidth < W * 2) return void requestAnimationFrame(frame); // not laid out yet
      // Drop in above the right side of the intro text.
      x = Math.min(innerWidth - W, Math.max(W, innerWidth * 0.62));
      placed = true;
    }
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    if (mode === "perch" || mode === "walk") {
      const s = currentLedge();
      if (!s || (perchEl && !comfortable(s))) {
        // Our ledge scrolled away (or vanished): hop somewhere visible.
        const next = nearestComfortable(perchEl);
        if (next) jumpTo(next, x);
        else startFall();
      } else {
        if (mode === "walk") {
          const dir = Math.sign(walkTarget - perchOffset);
          perchOffset += dir * WALK_SPEED * dt;
          if (Math.abs(walkTarget - perchOffset) < 1.5) setMode("perch");
        }
        x = clampOn(s, s.left + perchOffset);
        perchOffset = x - s.left;
        y = s.top;
      }
    } else if (mode === "jump" && jump) {
      const t = Math.min(1, (now - jump.start) / JUMP_MS);
      const target = jump.el ? (jump.el.isConnected ? ledgeOf(jump.el) : null) : floor();
      if (!target) {
        jump = null;
        startFall();
      } else {
        // Ease toward the (possibly moving) landing spot with a parabolic arc.
        const tx = target.left + jump.offset;
        const arc = Math.max(40, Math.abs(target.top - jump.y0) * 0.4);
        x = jump.x0 + (tx - jump.x0) * t;
        y = jump.y0 + (target.top - jump.y0) * t - arc * 4 * t * (1 - t);
        if (t >= 1) {
          const j = jump;
          jump = null;
          perchOn(target, target.left + j.offset);
          y = target.top;
          flash("land", 260);
        }
      }
    } else if (mode === "fall") {
      const prevY = y;
      vy += GRAVITY * dt;
      x += vx * dt;
      y += vy * dt;
      vx *= 1 - 0.6 * dt; // a little air drag
      face(vx);

      // Window sides: bounce off them (he never sticks to or walks on the sides).
      const half = W / 2;
      if (x < half || x > innerWidth - half) {
        x = x < half ? half : innerWidth - half;
        vx = -vx * 0.45;
      }
      if (y - H < 0 && vy < 0) {
        y = H; // ceiling
        vy = 0;
      }

      if (mode === "fall" && vy > 0) {
        // Land on the first ledge the feet crossed this frame.
        for (const s of surfaces()) {
          if (prevY <= s.top + 1 && y >= s.top && x >= s.left + 4 && x <= s.right - 4 && s.top > 0) {
            land(s, vy);
            break;
          }
        }
        if (mode === "fall" && y >= innerHeight) {
          y = innerHeight;
          land(floor(), vy);
        }
      }
    }

    // Idle life: wander, look around, wave, or doze off.
    if (mode === "perch" && !reduceMotion && now > nextIdleAt) {
      nextIdleAt = now + 3500 + Math.random() * 4500;
      const asleep = root.dataset.mood === "sleep";
      if (now - lastInteraction > SLEEP_AFTER_MS) {
        if (!asleep) setMood("sleep");
      } else if (!asleep) {
        const s = currentLedge();
        const r = Math.random();
        if (s && r < 0.5) {
          walkTarget = clampOn(s, s.left + Math.random() * (s.right - s.left)) - s.left;
          face(walkTarget - perchOffset);
          if (Math.abs(walkTarget - perchOffset) > 8) setMode("walk");
        } else if (r < 0.7) {
          face(Math.random() < 0.5 ? -1 : 1);
        } else if (r < 0.82) {
          flash("wave", 1100);
        } else {
          const next = nearestComfortable(perchEl);
          if (next && Math.abs(next.top - y) < 220) jumpTo(next, next.left + Math.random() * (next.right - next.left));
        }
      }
    }

    render();
    requestAnimationFrame(frame);
  }

  function render() {
    root.style.transform = `translate3d(${x - W / 2}px, ${y - H}px, 0)`;
  }

  // ---- dragging, throwing and clicking ----------------------------------
  let press: { id: number; sx: number; sy: number; gx: number; gy: number; dragging: boolean } | null = null;
  let samples: { t: number; x: number; y: number }[] = [];

  root.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    try {
      root.setPointerCapture(e.pointerId); // keep receiving moves even off the mascot
    } catch {}
    touch();
    // Grab offset keeps the point you clicked under the cursor.
    press = { id: e.pointerId, sx: e.clientX, sy: e.clientY, gx: x - e.clientX, gy: y - e.clientY, dragging: false };
    samples = [{ t: performance.now(), x: e.clientX, y: e.clientY }];
    document.documentElement.classList.add("mascot-grabbing");
  });

  window.addEventListener("pointermove", (e) => {
    if (!press || e.pointerId !== press.id) return;
    if (!press.dragging && Math.hypot(e.clientX - press.sx, e.clientY - press.sy) > 4) {
      press.dragging = true;
      jump = null;
      perchEl = null;
      setMode("drag");
      setMood("surprised");
    }
    if (!press.dragging) return;
    const nx = e.clientX + press.gx;
    face(nx - x);
    x = nx;
    y = e.clientY + press.gy;
    samples.push({ t: performance.now(), x: e.clientX, y: e.clientY });
    if (samples.length > 6) samples.shift();
  });

  const release = (e: PointerEvent) => {
    if (!press || e.pointerId !== press.id) return;
    const wasDrag = press.dragging;
    press = null;
    document.documentElement.classList.remove("mascot-grabbing");
    if (!wasDrag) return react();
    // Throw velocity from the last ~100ms of movement.
    const now = performance.now();
    const recent = samples.filter((s) => now - s.t < 100);
    let tvx = 0;
    let tvy = 0;
    if (recent.length >= 2) {
      const a = recent[0];
      const b = recent[recent.length - 1];
      const dt = Math.max(16, b.t - a.t) / 1000;
      tvx = Math.max(-2500, Math.min(2500, (b.x - a.x) / dt));
      tvy = Math.max(-2500, Math.min(2500, (b.y - a.y) / dt));
    }
    if (Math.hypot(tvx, tvy) > DIZZY_SPEED) setMood("dizzy", 1800);
    else setMood("");
    startFall(tvx, tvy);
  };
  // Listen on window so a fast drag that outruns the mascot still tracks.
  window.addEventListener("pointerup", release);
  window.addEventListener("pointercancel", release);

  // Click reactions: a happy hop, a wink, a wave, or a surprised jolt.
  function react() {
    const r = Math.random();
    if (root.dataset.mood === "sleep") {
      setMood("surprised", 900);
      if (mode === "perch") startFall(0, -320);
    } else if (r < 0.35) {
      setMood("happy", 1200);
      if (mode === "perch" || mode === "walk") startFall(0, -480);
    } else if (r < 0.6) {
      setMood("wink", 1100);
    } else if (r < 0.8) {
      setMood("happy", 1200);
      flash("wave", 1100);
    } else {
      setMood("surprised", 800);
      if (mode === "perch" || mode === "walk") startFall(0, -260);
    }
  }

  // ---- eyes follow the cursor, plus blinking -------------------------------
  window.addEventListener(
    "pointermove",
    (e) => {
      const dx = e.clientX - x;
      const dy = e.clientY - (y - H * 0.65); // roughly eye height
      const d = Math.hypot(dx, dy) || 1;
      const flip = root.dataset.facing === "left" ? -1 : 1; // undo the mirror
      root.style.setProperty("--px", `${((dx / d) * 1.1 * flip).toFixed(2)}px`);
      root.style.setProperty("--py", `${((dy / d) * 1.1).toFixed(2)}px`);
      if (d < 90) touch(); // hovering nearby wakes him up
    },
    { passive: true },
  );
  const blink = () => {
    if (!root.dataset.mood) flash("blink", 140);
    setTimeout(blink, 2500 + Math.random() * 4000);
  };
  setTimeout(blink, 2000);

  addEventListener("scroll", touch, { passive: true });

  // Dev-only hook for poking at the mascot from the console.
  if (import.meta.env.DEV) {
    (window as any).__mascot = { surfaces, state: () => ({ mode, x, y, vx, vy, perchEl }) };
  }

  // Drop in from the top on load.
  root.setAttribute("data-ready", "");
  startFall(0, 0);
  requestAnimationFrame(frame);
}
