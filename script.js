/* ========== script.js ========== */
/* Portrait and title drawing with corrected positioning */

/* ---------- asset paths ---------- */
const PORTRAIT_SVG = "assets/marko_polo_portrait_vectorized.svg";
const TITLE_SVG = "assets/title.svg";

/* ---------- visual tuning ---------- */
const PORTRAIT_SCALE = 2.0;
const TITLE_SCALE = 1.8; 
const TITLE_BOTTOM_MARGIN = 0.2; 

/* ---------- timing ---------- */
const DRAW_SECONDS = 3;
const FPS = 60;
const TOTAL_FRAMES = DRAW_SECONDS * FPS;

/* ---------- stroke ---------- */
const COLOR = 0x5d4037;
const WIDTH = 1.2;

/* ---------- three.js globals ---------- */
let scene, camera, renderer;
const portraitLines = [], titleLines = [];
let portraitTotalPts = 0, titleTotalPts = 0;
let portraitDrawn = 0, titleDrawn = 0;
let frameCount = 0;
let portraitSegsTemp = []; 
let titleSegsTemp = []; 

/* ───── SVG parsing ───── */
function parsePath(d, W, H, scale) {
  const pts = [];
  let cp = { x: 0, y: 0 }, sp = { x: 0, y: 0 };
  const cmds = d.match(/[a-zA-Z][^a-zA-Z]*/g) || [];
  const abs = (v, i, rel) => (rel ? (i % 2 ? cp.y + v : cp.x + v) : v);
  const push = p => pts.push({ 
    x: (p.x / W - 0.5) * scale, 
    y: (0.5 - p.y / H) * scale 
  });
  
  for (const s of cmds) {
    const c = s[0], C = c.toUpperCase(), rel = c !== C;
    const v = s.slice(1).trim().split(/[ ,]+/).filter(Boolean).map(Number);
    let i = 0;
    
    switch (C) {
      case "M": case "L":
        for (; i < v.length; i += 2) {
          cp.x = abs(v[i], 0, rel);
          cp.y = abs(v[i + 1], 1, rel);
          if (C === "M" && i === 0) sp = { ...cp };
          push(cp);
        }
        break;
      case "H":
        v.forEach(e => {
          cp.x = rel ? cp.x + e : e;
          push(cp);
        });
        break;
      case "V":
        v.forEach(e => {
          cp.y = rel ? cp.y + e : e;
          push(cp);
        });
        break;
      case "C":
        while (i + 5 < v.length) {
          const p0 = { ...cp };
          const p1 = { x: abs(v[i], 0, rel), y: abs(v[i + 1], 1, rel) };
          const p2 = { x: abs(v[i + 2], 0, rel), y: abs(v[i + 3], 1, rel) };
          const p3 = { x: abs(v[i + 4], 0, rel), y: abs(v[i + 5], 1, rel) };
          for (let k = 1; k <= 12; k++) {
            const t = k / 12, it = 1 - t;
            push({
              x: it*it*it*p0.x + 3*it*it*t*p1.x + 3*it*t*t*p2.x + t*t*t*p3.x,
              y: it*it*it*p0.y + 3*it*it*t*p1.y + 3*it*t*t*p2.y + t*t*t*p3.y
            });
          }
          cp = { ...p3 };
          i += 6;
        }
        break;
      case "Q":
        while (i + 3 < v.length) {
          const p0 = { ...cp };
          const p1 = { x: abs(v[i], 0, rel), y: abs(v[i + 1], 1, rel) };
          const p2 = { x: abs(v[i + 2], 0, rel), y: abs(v[i + 3], 1, rel) };
          for (let k = 1; k <= 10; k++) {
            const t = k / 10, it = 1 - t;
            push({
              x: it*it*p0.x + 2*it*t*p1.x + t*t*p2.x,
              y: it*it*p0.y + 2*it*t*p1.y + t*t*p2.y
            });
          }
          cp = { ...p2 };
          i += 4;
        }
        break;
      case "Z":
        push(sp);
        cp = { ...sp };
        break;
    }
  }
  return pts;
}

async function loadSVG(url, scale) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url}: ${res.status}`);
    
    const svg = new DOMParser()
      .parseFromString(await res.text(), "image/svg+xml")
      .documentElement;
      
    const vb = (svg.getAttribute("viewBox") || "0 0 300 300")
      .split(/[ ,]+/).map(Number);
      
    const W = parseFloat(svg.getAttribute("width")) || vb[2];
    const H = parseFloat(svg.getAttribute("height")) || vb[3];
    
    return [...svg.querySelectorAll("path")]
      .map(p => parsePath(p.getAttribute("d") || "", W, H, scale))
      .filter(s => s.length > 1);
  } catch (err) {
    console.error(`Error loading SVG from ${url}:`, err);
    return [];
  }
}

/* ───── THREE.js helpers ───── */
function makeLines(segs) {
  const mat = new THREE.LineBasicMaterial({ color: COLOR, linewidth: WIDTH });
  return segs.map(seg => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(seg.length * 3), 3)
    );
    geo.setDrawRange(0, 0);
    const line = new THREE.Line(geo, mat);
    line.userData = { pts: seg, drawn: 0 };
    scene.add(line);
    return line;
  });
}

function draw(lines, count) {
  let left = count;
  for (const l of lines) {
    const { pts, drawn } = l.userData;
    if (drawn >= pts.length) continue;
    
    const n = Math.min(left, pts.length - drawn);
    const pos = l.geometry.attributes.position;
    
    for (let i = 0; i < n; i++) {
      const p = pts[drawn + i];
      pos.setXYZ(drawn + i, p.x, p.y, 0);
    }
    
    l.userData.drawn += n;
    pos.needsUpdate = true;
    l.geometry.setDrawRange(0, l.userData.drawn);
    
    left -= n;
    if (!left) break;
  }
}

/* ───── Layout helpers ───── */
function worldHeight() {
  return 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
}

function worldWidth() {
  const h = worldHeight();
  return h * camera.aspect;
}

function positionPortrait(portraitSegs) {
    const pts = portraitSegs.flatMap(s => s);
    if (!pts.length) return;
  
    /* current top-most Y of the portrait (after PORTRAIT_SCALE, centred at 0,0) */
    let topY = -Infinity;
    pts.forEach(p => { if (p.y > topY) topY = p.y; });
  
    /* target: top of portrait is 1/3 of the canvas height below the canvas top */
    const h  = worldHeight();                 // visible world height
    const targetTopY =  h / 2 - h / 3;        // = h / 6 from world centre
  
    /* uniform vertical shift so that portraitTop === targetTopY */
    const dy = targetTopY - topY;
  
    portraitSegs.forEach(seg =>
      seg.forEach(p => { p.y += dy; })
    );
  }

function positionTitle(titleSegmentsToPosition) {
  const allTitlePoints = titleSegmentsToPosition.flatMap(s => s);
  if (allTitlePoints.length === 0) return;

  let tMinX_orig = Infinity, tMaxX_orig = -Infinity, tMinY_orig = Infinity;
  allTitlePoints.forEach(p => {
    if (p.x < tMinX_orig) tMinX_orig = p.x;
    if (p.x > tMaxX_orig) tMaxX_orig = p.x;
    if (p.y < tMinY_orig) tMinY_orig = p.y; 
  });

  const tInitialWidth = tMaxX_orig - tMinX_orig;
  const tInitialCenterX = (tMinX_orig + tMaxX_orig) / 2;

  const wWidth = worldWidth();
  const targetTitleWidth = wWidth * 0.90; 
  
  let stretchFactor = 1;
  if (tInitialWidth > 0.0001) {
      stretchFactor = targetTitleWidth / tInitialWidth;
  }

  titleSegmentsToPosition.forEach(seg =>
    seg.forEach(p => {
      p.x = (p.x - tInitialCenterX) * stretchFactor;
    })
  );
  
  const wHeight = worldHeight();
  const canvasBottomEdgeY = -wHeight / 2; 
  const verticalShift = (canvasBottomEdgeY + TITLE_BOTTOM_MARGIN) - tMinY_orig;

  titleSegmentsToPosition.forEach(seg =>
    seg.forEach(p => {
      p.y += verticalShift; 
    })
  );
}


/* ───── Animation loop ───── */
function animate() {
  requestAnimationFrame(animate);
  
  if (frameCount <= TOTAL_FRAMES) {
    const prog = frameCount / TOTAL_FRAMES;
    
    const ptsToDrawPortrait = Math.floor(prog * portraitTotalPts);
    const ptsToDrawTitle = Math.floor(prog * titleTotalPts);

    draw(portraitLines, ptsToDrawPortrait - portraitDrawn);
    draw(titleLines, ptsToDrawTitle - titleDrawn);
    
    portraitDrawn = ptsToDrawPortrait;
    titleDrawn = ptsToDrawTitle;
    frameCount++;
  }
  
  renderer.render(scene, camera);
}

/* ───── Initialization ───── */
async function init() {
  scene = new THREE.Scene();
  
  const box = document.getElementById("marko-polo-canvas-container");
  
  camera = new THREE.PerspectiveCamera(
    75, 
    box.offsetWidth / box.offsetHeight, 
    0.1, 
    100 
  );
  camera.position.z = 4; 
  
  renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("marko-polo-canvas"),
    alpha: true,
    antialias: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(box.offsetWidth, box.offsetHeight);
  
  window.addEventListener("resize", () => {
    camera.aspect = box.offsetWidth / box.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(box.offsetWidth, box.offsetHeight);
    
    if (portraitLines.length > 0 && portraitSegsTemp.length > 0) {
        const freshPortraitSegs = JSON.parse(JSON.stringify(portraitSegsTemp));
        positionPortrait(freshPortraitSegs);
        portraitLines.forEach((line, index) => {
            const seg = freshPortraitSegs[index];
            const pos = line.geometry.attributes.position;
            for (let i = 0; i < seg.length; i++) pos.setXYZ(i, seg[i].x, seg[i].y, 0);
            pos.needsUpdate = true;
            line.userData.pts = seg;
            if (frameCount > TOTAL_FRAMES) line.geometry.setDrawRange(0, seg.length);
        });
    }

    if (titleLines.length > 0 && titleSegsTemp.length > 0) {
        const freshTitleSegs = JSON.parse(JSON.stringify(titleSegsTemp));
        positionTitle(freshTitleSegs); 
        titleLines.forEach((line, index) => {
            const seg = freshTitleSegs[index];
            const pos = line.geometry.attributes.position;
            for (let i = 0; i < seg.length; i++) pos.setXYZ(i, seg[i].x, seg[i].y, 0);
            pos.needsUpdate = true;
            line.userData.pts = seg; 
            if (frameCount > TOTAL_FRAMES) line.geometry.setDrawRange(0, seg.length);
        });
    }
  }, false);
  
  try {
    const [loadedPortraitSegs, loadedTitleSegs] = await Promise.all([
      loadSVG(PORTRAIT_SVG, PORTRAIT_SCALE),
      loadSVG(TITLE_SVG, TITLE_SCALE)
    ]);
    
    portraitSegsTemp = JSON.parse(JSON.stringify(loadedPortraitSegs)); 
    titleSegsTemp = JSON.parse(JSON.stringify(loadedTitleSegs)); 

    if (loadedPortraitSegs.length === 0 || loadedTitleSegs.length === 0) {
      console.error("Failed to load SVG paths. Check console for details.");
      return;
    }
    
    positionPortrait(loadedPortraitSegs); 
    positionTitle(loadedTitleSegs); 
    
    portraitLines.push(...makeLines(loadedPortraitSegs));
    titleLines.push(...makeLines(loadedTitleSegs)); 
    
    portraitTotalPts = loadedPortraitSegs.reduce((s, a) => s + a.length, 0);
    titleTotalPts = loadedTitleSegs.reduce((s, a) => s + a.length, 0);
    
    animate();
  } catch (err) {
    console.error("Error initializing:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (typeof THREE === "undefined") {
    console.error("Three.js not loaded");
    return;
  }
  init().catch(err => {
    console.error("Failed to initialize:", err);
  });
});