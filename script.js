/* ---------- asset paths ---------- */
const SOCIAL_THREADER_SVG = "assets/social_threader.svg";
const COUNTDOWN_CALENDAR_SVG = "assets/countdown_calendar.svg";
const CITY_FINDER_SVG = "assets/city_finder.svg";
const RSVP_SVG = "assets/rsvp.svg";
const LLM_CROSSWORD_SVG = "assets/llm_crossword.svg";
const OLD_MILLIONAIRE_SVG = "assets/old_millionaire.svg";
const ALLERGY_WHEEL_SVG = "assets/allergy_wheel.svg";
/* ---------- visual tuning ---------- */
const PROJECT_SCALE = 1.5;
const PROJECT_X_SCALE_FACTOR = 0.80;
const PROJECT_Y_SCALE_FACTOR = 0.30;

/* ---------- timing ---------- */
const PROJECT_DRAW_SECONDS = 3;
const FPS = 60;
const PROJECT_TOTAL_FRAMES = PROJECT_DRAW_SECONDS * FPS;

/* ---------- stroke ---------- */
const COLOR = 0x5d4037;
const WIDTH = 1.2;

/* ---------- project animations ---------- */
const projectAnimations = new Map();
const PROJECT_CANVASES = [
    {id: "social-threader-canvas", svg: SOCIAL_THREADER_SVG},
    {id: "countdown-calendar-canvas", svg: COUNTDOWN_CALENDAR_SVG},
    {id: "city-finder-canvas", svg: CITY_FINDER_SVG},
    {id: "rsvp-canvas", svg: RSVP_SVG},
    {id: "llm-crossword-canvas", svg: LLM_CROSSWORD_SVG},
    {id: "old-millionaire-canvas", svg: OLD_MILLIONAIRE_SVG},
    {id: "allergy-wheel-canvas", svg: ALLERGY_WHEEL_SVG},
];

/* ───── SVG parsing ───── */
function parsePath(d, W, H, scale) {
    const pts = [];
    let cp = {x: 0, y: 0}, sp = {x: 0, y: 0};
    const cmds = d.match(/[a-zA-Z][^a-zA-Z]*/g) || [];
    const abs = (v, i, rel) => (rel ? (i % 2 ? cp.y + v : cp.x + v) : v);
    const push = p => pts.push({
        x: (p.x / W - 0.5) * scale,
        y: (0.5 - p.y / H) * scale
    });

    for (const s of cmds) {
        const c = s[0], C = c.toUpperCase(), rel = c !== C;
        // Extract numeric tokens (including negatives and decimals) from the
        // command string. Regex breakdown:
        //  [-+]?            -> optional sign
        //  (?:\d*\.\d+|\d+) -> decimal numbers with optional leading digits or integers
        const v = (s.slice(1).trim().match(/[-+]?(?:\d*\.\d+|\d+)/g) || [])
            .map(parseFloat);
        let i = 0;

        switch (C) {
            case "M":
            case "L":
                for (; i < v.length; i += 2) {
                    cp.x = abs(v[i], 0, rel);
                    cp.y = abs(v[i + 1], 1, rel);
                    if (C === "M" && i === 0) sp = {...cp};
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
                    const p0 = {...cp};
                    const p1 = {x: abs(v[i], 0, rel), y: abs(v[i + 1], 1, rel)};
                    const p2 = {x: abs(v[i + 2], 0, rel), y: abs(v[i + 3], 1, rel)};
                    const p3 = {x: abs(v[i + 4], 0, rel), y: abs(v[i + 5], 1, rel)};
                    for (let k = 1; k <= 12; k++) {
                        const t = k / 12, it = 1 - t;
                        push({
                            x: it * it * it * p0.x + 3 * it * it * t * p1.x + 3 * it * t * t * p2.x + t * t * t * p3.x,
                            y: it * it * it * p0.y + 3 * it * it * t * p1.y + 3 * it * t * t * p2.y + t * t * t * p3.y
                        });
                    }
                    cp = {...p3};
                    i += 6;
                }
                break;
            case "Q":
                while (i + 3 < v.length) {
                    const p0 = {...cp};
                    const p1 = {x: abs(v[i], 0, rel), y: abs(v[i + 1], 1, rel)};
                    const p2 = {x: abs(v[i + 2], 0, rel), y: abs(v[i + 3], 1, rel)};
                    for (let k = 1; k <= 10; k++) {
                        const t = k / 10, it = 1 - t;
                        push({
                            x: it * it * p0.x + 2 * it * t * p1.x + t * t * p2.x,
                            y: it * it * p0.y + 2 * it * t * p1.y + t * t * p2.y
                        });
                    }
                    cp = {...p2};
                    i += 4;
                }
                break;
            case "Z":
                push(sp);
                cp = {...sp};
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
function makeLines(segs, targetScene) {
    const mat = new THREE.LineBasicMaterial({color: COLOR, linewidth: WIDTH});
    return segs.map(seg => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute(
            "position",
            new THREE.BufferAttribute(new Float32Array(seg.length * 3), 3)
        );
        geo.setDrawRange(0, 0);
        const line = new THREE.Line(geo, mat);
        line.userData = {pts: seg, drawn: 0};
        targetScene.add(line);
        return line;
    });
}

function draw(lines, count) {
    let left = count;
    for (const l of lines) {
        const {pts, drawn} = l.userData;
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
function projectWorldHeight(projectCamera) {
    return 2 * projectCamera.position.z * Math.tan(THREE.MathUtils.degToRad(projectCamera.fov / 2));
}

function projectWorldWidth(projectCamera) {
    const h = projectWorldHeight(projectCamera);
    return h * projectCamera.aspect;
}

function positionProjectSegments(segments, projectCamera) {
    const allPoints = segments.flatMap(s => s);
    if (!allPoints.length) return;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    allPoints.forEach(p => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
    });

    const initialWidth = maxX - minX;
    const initialHeight = maxY - minY;
    const initialCenterX = (minX + maxX) / 2;
    const initialCenterY = (minY + maxY) / 2;

    const wWidth = projectWorldWidth(projectCamera);
    const wHeight = projectWorldHeight(projectCamera);

    const targetWidth = wWidth * PROJECT_X_SCALE_FACTOR;
    const targetHeight = wHeight * PROJECT_Y_SCALE_FACTOR;

    let xScaleFactor = 1;
    if (initialWidth > 0.0001) {
        xScaleFactor = targetWidth / initialWidth;
    }

    let yScaleFactor = 1;
    if (initialHeight > 0.0001) {
        yScaleFactor = targetHeight / initialHeight;
    }

    segments.forEach(seg =>
        seg.forEach(p => {
            p.x = (p.x - initialCenterX) * xScaleFactor;
            p.y = (p.y - initialCenterY) * yScaleFactor;
        })
    );
}

/* ───── Project Animation Setup ───── */
async function initProjectAnimation(canvasId, svgPath) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const container = canvas.parentElement;

    const projectScene = new THREE.Scene();
    const projectCamera = new THREE.PerspectiveCamera(
        75,
        container.offsetWidth / container.offsetHeight,
        0.1,
        100
    );
    projectCamera.position.z = 4;

    const projectRenderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    projectRenderer.setPixelRatio(window.devicePixelRatio);
    projectRenderer.setSize(container.offsetWidth, container.offsetHeight);

    const loadedSegments = await loadSVG(svgPath, PROJECT_SCALE);
    if (loadedSegments.length === 0) return;

    const segmentsTemp = JSON.parse(JSON.stringify(loadedSegments));
    positionProjectSegments(loadedSegments, projectCamera);

    const projectLines = makeLines(loadedSegments, projectScene);
    const projectTotalPts = loadedSegments.reduce((s, a) => s + a.length, 0);

    projectAnimations.set(canvasId, {
        scene: projectScene,
        camera: projectCamera,
        renderer: projectRenderer,
        lines: projectLines,
        totalPts: projectTotalPts,
        frameCount: 0,
        drawn: 0,
        isAnimating: false,
        hasAnimated: false, // Add this flag
        segments: loadedSegments,
        segmentsTemp: segmentsTemp
    });

    const resizeHandler = () => {
        projectCamera.aspect = container.offsetWidth / container.offsetHeight;
        projectCamera.updateProjectionMatrix();
        projectRenderer.setSize(container.offsetWidth, container.offsetHeight);

        const animation = projectAnimations.get(canvasId);
        if (animation && animation.segmentsTemp.length > 0) {
            const freshSegments = JSON.parse(JSON.stringify(animation.segmentsTemp));
            positionProjectSegments(freshSegments, projectCamera);
            animation.lines.forEach((line, index) => {
                const seg = freshSegments[index];
                const pos = line.geometry.attributes.position;
                for (let i = 0; i < seg.length; i++) pos.setXYZ(i, seg[i].x, seg[i].y, 0);
                pos.needsUpdate = true;
                line.userData.pts = seg;
                if (animation.frameCount > PROJECT_TOTAL_FRAMES) line.geometry.setDrawRange(0, seg.length);
            });
        }
    };

    window.addEventListener("resize", resizeHandler);
}

function startProjectAnimation(canvasId) {
    const animation = projectAnimations.get(canvasId);
    if (!animation || animation.isAnimating || animation.hasAnimated) return; // Check hasAnimated flag

    animation.isAnimating = true;
    animation.frameCount = 0;
    animation.drawn = 0;

    animation.lines.forEach(line => {
        line.userData.drawn = 0;
        line.geometry.setDrawRange(0, 0);
    });

    const animate = () => {
        if (!animation.isAnimating) return;

        if (animation.frameCount <= PROJECT_TOTAL_FRAMES) {
            const prog = animation.frameCount / PROJECT_TOTAL_FRAMES;
            const ptsToDrawProject = Math.floor(prog * animation.totalPts);

            draw(animation.lines, ptsToDrawProject - animation.drawn);
            animation.drawn = ptsToDrawProject;
            animation.frameCount++;

            requestAnimationFrame(animate);
        } else {
            animation.isAnimating = false;
            animation.hasAnimated = true; // Set flag when animation completes
        }

        animation.renderer.render(animation.scene, animation.camera);
    };

    animate();
}

/* ───── Initialization ───── */
async function initProjectGallery() {
    try {
        await Promise.all(PROJECT_CANVASES.map(({id, svg}) => initProjectAnimation(id, svg)));
    } catch (err) {
        console.error("Failed to prepare project animations:", err);
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const canvasId = entry.target.id;
                setTimeout(() => startProjectAnimation(canvasId), 0);
            }
        });
    }, {threshold: 0.1});

    PROJECT_CANVASES.forEach(({id}) => {
        const canvas = document.getElementById(id);
        if (canvas) observer.observe(canvas);
    });
}

function setupHeroAudioToggle() {
    const video = document.getElementById("hero-video");
    const toggle = document.getElementById("hero-sound-toggle");
    if (!video || !toggle) return;

    const srLabel = toggle.querySelector(".sr-only");

    const updateToggle = () => {
        const soundEnabled = !video.muted;
        toggle.setAttribute("aria-pressed", String(soundEnabled));
        if (srLabel) {
            srLabel.textContent = soundEnabled ? "Mute sound" : "Enable sound";
        }
    };

    const ensurePlayback = () => {
        const playPromise = video.play();
        if (playPromise && typeof playPromise.then === "function") {
            playPromise.catch(() => {});
        }
    };

    toggle.addEventListener("click", () => {
        video.muted = !video.muted;
        if (!video.muted) ensurePlayback();
        updateToggle();
    });

    updateToggle();
}

document.addEventListener("DOMContentLoaded", () => {
    setupHeroAudioToggle();

    if (typeof THREE === "undefined") {
        console.error("Three.js not loaded");
        return;
    }

    initProjectGallery().catch(err => {
        console.error("Failed to initialize project gallery:", err);
    });
});
