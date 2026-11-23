// Diagonal "strip flip" theme switch: the page shrinks slightly, 30px diagonal
// strips flip from the old theme to the new one in sequence, then it scales back.
// Uses the View Transitions API; browsers without it just switch instantly.

const STRIP_WIDTH = 30; // perpendicular width of one diagonal strip, in px
const SHRINK_MS = 480;
const SWEEP_MS = 1400;

type Point = [number, number];

// Polygon for the part of the viewport where lo <= x + y <= hi (one diagonal band).
function bandPolygon(lo: number, hi: number, w: number, h: number): Point[] | null {
  const pts: Point[] = [];
  const inBand = (x: number, y: number) => x + y >= lo - 0.5 && x + y <= hi + 0.5;
  for (const [x, y] of [[0, 0], [w, 0], [w, h], [0, h]] as Point[]) if (inBand(x, y)) pts.push([x, y]);
  // Where each band edge (x + y = c) crosses the four viewport edges.
  for (const c of [lo, hi]) {
    if (c >= 0 && c <= w) pts.push([c, 0]);
    if (c - h >= 0 && c - h <= w) pts.push([c - h, h]);
    if (c >= 0 && c <= h) pts.push([0, c]);
    if (c - w >= 0 && c - w <= h) pts.push([w, c - w]);
  }
  const unique = [...new Map(pts.map((p) => [`${Math.round(p[0] * 10)},${Math.round(p[1] * 10)}`, p])).values()];
  if (unique.length < 3) return null;
  const cx = unique.reduce((s, p) => s + p[0], 0) / unique.length;
  const cy = unique.reduce((s, p) => s + p[1], 0) / unique.length;
  return unique.sort((a, b) => Math.atan2(a[1] - cy, a[0] - cx) - Math.atan2(b[1] - cy, b[0] - cx));
}

// clip-path showing the strips that belong to one snapshot after `flipped` strips have flipped.
function stripsClip(count: number, band: number, w: number, h: number, flipped: number, side: "old" | "new") {
  const paths: string[] = [];
  for (let i = 0; i < count; i++) {
    const visible = side === "old" ? i >= flipped : i < flipped;
    if (!visible) continue;
    const poly = bandPolygon(i * band, (i + 1) * band, w, h);
    if (!poly) continue;
    const [first, ...rest] = poly;
    paths.push(`M${first[0]} ${first[1]}` + rest.map(([x, y]) => `L${x} ${y}`).join("") + "Z");
  }
  return { clipPath: paths.length ? `path('${paths.join(" ")}')` : "inset(100%)" };
}

function run(el: HTMLElement, frames: Keyframe[], pseudoElement: string, duration: number, easing = "linear") {
  return el.animate(frames, { duration, easing, pseudoElement, fill: "forwards" }).finished.catch(() => undefined);
}

let running = false;

export async function switchTheme(apply: () => void) {
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!("startViewTransition" in document) || reduceMotion) return apply();
  if (running) return; // ignore clicks mid-animation
  running = true;

  const w = innerWidth;
  const h = innerHeight;
  const band = STRIP_WIDTH * Math.SQRT2; // band width measured along x + y
  const count = Math.max(1, Math.ceil((w + h) / band));
  const scale = 1 - STRIP_WIDTH / Math.min(w, h);
  const root = document.documentElement;
  const OLD = "::view-transition-old(root)";
  const NEW = "::view-transition-new(root)";
  const GROUP = "::view-transition-group(root)";
  const clip = (flipped: number, side: "old" | "new") => stripsClip(count, band, w, h, flipped, side);

  root.classList.add("theme-strip-flipping");
  try {
    const transition = document.startViewTransition(apply);
    await transition.ready;

    // 1. Shrink, still fully showing the old theme.
    await Promise.all([
      run(root, [clip(0, "old"), clip(0, "old")], OLD, SHRINK_MS),
      run(root, [clip(0, "new"), clip(0, "new")], NEW, SHRINK_MS),
      run(root, [{ transform: "scale(1)" }, { transform: `scale(${scale})` }], GROUP, SHRINK_MS, "cubic-bezier(0.4, 0, 0.2, 1)"),
    ]);

    // 2. Flip strips one by one from the top-left corner.
    const steps = Array.from({ length: count + 1 }, (_, i) => i);
    await Promise.all([
      run(root, steps.map((i) => clip(i, "old")), OLD, SWEEP_MS),
      run(root, steps.map((i) => clip(i, "new")), NEW, SWEEP_MS),
      run(root, [{ transform: `scale(${scale})` }, { transform: `scale(${scale})` }], GROUP, SWEEP_MS),
    ]);

    // 3. Scale back up, now fully on the new theme.
    await Promise.all([
      run(root, [clip(count, "old"), clip(count, "old")], OLD, SHRINK_MS),
      run(root, [clip(count, "new"), clip(count, "new")], NEW, SHRINK_MS),
      run(root, [{ transform: `scale(${scale})` }, { transform: "scale(1)" }], GROUP, SHRINK_MS, "cubic-bezier(0.4, 0, 0.2, 1)"),
    ]);
    await transition.finished;
  } finally {
    root.classList.remove("theme-strip-flipping");
    running = false;
  }
}
