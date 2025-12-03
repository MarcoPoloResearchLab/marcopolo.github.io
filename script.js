// @ts-check

/**
 * @typedef {"Research" | "Tools" | "Platform" | "Products"} ProjectCategory
 * @typedef {"Production" | "Beta" | "WIP"} ProjectStatus
 *
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {ProjectStatus} status
 * @property {ProjectCategory} category
 * @property {string | null} url
 * @property {boolean} [public]
 * @property {string | null | undefined} [icon]
 * @property {ProjectSubscribeConfig | null | undefined} [subscribe]
 */

/**
 * @typedef {Object} ProjectSubscribeConfig
 * @property {string} script
 * @property {number | undefined} [height]
 * @property {string | undefined} [title]
 * @property {string | undefined} [copy]
 */

const SECTION_ORDER = /** @type {ProjectCategory[]} */ ([
    "Research",
    "Tools",
    "Platform",
    "Products"
]);

const STATUS_PRIORITY = Object.freeze({
    Production: 0,
    Beta: 1,
    WIP: 2
});

const STATUS_CLASS = Object.freeze({
    Production: "status-badge-production",
    Beta: "status-badge-beta",
    WIP: "status-badge-wip"
});

/** @type {ProjectStatus[]} */
const FLIPPABLE_STATUSES = ["Beta", "WIP"];

/**
 * Fetches the JSON catalog for the landing page.
 * @returns {Promise<Project[]>}
 */
async function loadProjectCatalog() {
    const response = await fetch("data/projects.json", {cache: "no-store"});
    if (!response.ok) {
        throw new Error(`projects.json: ${response.status}`);
    }

    /** @type {{projects?: Project[]}} */
    const payload = await response.json();
    if (!Array.isArray(payload.projects)) {
        throw new Error("projects.json missing projects array");
    }
    return payload.projects;
}

/**
 * Creates semantic markup for a project card.
 * @param {Project} project
 * @returns {HTMLElement}
 */
function buildProjectCard(project) {
    const card = document.createElement("article");
    card.className = "project-card";
    card.dataset.status = project.status.toLowerCase();

    const inner = document.createElement("div");
    inner.className = "project-card-inner";

    const subscribeConfig = project.subscribe && project.subscribe.script ? project.subscribe : null;
    const hasSubscribeWidget = Boolean(subscribeConfig);
    const isFlippable = hasSubscribeWidget || FLIPPABLE_STATUSES.includes(project.status);
    if (isFlippable) {
        card.classList.add("project-card-flippable");
        card.setAttribute("role", "button");
        card.tabIndex = 0;
        card.setAttribute("aria-pressed", "false");
    }

    const visual = document.createElement("div");
    visual.className = "project-card-visual";

    if (project.icon) {
        const img = document.createElement("img");
        img.src = project.icon;
        img.alt = `${project.name} favicon`;
        img.loading = "lazy";
        visual.append(img);
    } else {
        visual.textContent = deriveMonogram(project.name);
    }

    const title = document.createElement("h3");
    title.textContent = project.name;

    const titleGroup = document.createElement("div");
    titleGroup.className = "project-card-title";
    titleGroup.append(visual, title);

    const header = document.createElement("div");
    header.className = "project-card-header";
    header.append(titleGroup, buildStatusBadge(project.status));

    const body = document.createElement("div");
    body.className = "card-body";

    const description = document.createElement("p");
    description.textContent = project.description;
    body.append(description);

    if (project.url && project.status !== "WIP") {
        const link = document.createElement("a");
        link.href = project.url;
        link.className = "card-action";
        link.target = "_blank";
        link.rel = "noreferrer noopener";
        link.textContent = project.status === "Production" ? "Launch product" : "Explore beta";
        body.append(link);
    }

    const front = document.createElement("div");
    front.className = "project-card-face project-card-front";
    front.append(header, body);

    inner.append(front);

    if (isFlippable) {
        const back = document.createElement("div");
        back.className = "project-card-face project-card-back";

        const backHeader = document.createElement("div");
        backHeader.className = "project-card-header";

        const backTitle = document.createElement("h3");
        backTitle.textContent = project.name;

        const backStatus = buildStatusBadge(project.status);

        backHeader.append(backTitle, backStatus);

        const backBody = document.createElement("div");
        backBody.className = "card-body";

        const backCopy = document.createElement("p");
        backCopy.textContent =
            project.status === "WIP"
                ? "Flip this card to preview where the LoopAware-powered subscription form for this project will appear."
                : "Flip this card to preview the back surface where a LoopAware subscription form will live for beta updates.";

        backBody.append(backCopy);

        let subscribeOverlay = null;
        if (hasSubscribeWidget && subscribeConfig) {
            const subscribeWidget = document.createElement("div");
            subscribeWidget.className = "subscribe-widget";
            subscribeWidget.dataset.subscribeTarget = project.id;

            const subscribeHeading = document.createElement("p");
            subscribeHeading.className = "subscribe-widget-title";
            subscribeHeading.textContent =
                subscribeConfig.title || `Get ${project.name} updates`;

            const subscribeBlurb = document.createElement("p");
            subscribeBlurb.className = "subscribe-widget-copy";
            subscribeBlurb.textContent =
                subscribeConfig.copy ||
                "Leave your email to hear when this project ships new features and announcements.";

            const subscribeFrame = document.createElement("iframe");
            subscribeFrame.className = "subscribe-widget-frame";
            subscribeFrame.loading = "lazy";
            subscribeFrame.title = `${project.name} subscribe form`;
            subscribeFrame.setAttribute("aria-label", `Subscribe for ${project.name} updates`);
            subscribeFrame.setAttribute("tabindex", "-1");
            const frameHeight = Math.min(subscribeConfig.height || 280, 280);
            subscribeFrame.style.minHeight = `${frameHeight}px`;
            subscribeFrame.style.height = `${frameHeight}px`;

            subscribeFrame.srcdoc = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <style>
      body { margin: 0; background: transparent; }
    </style>
  </head>
  <body>
    <script defer src="${subscribeConfig.script}"></script>
  </body>
</html>`;

            subscribeWidget.append(subscribeHeading, subscribeBlurb, subscribeFrame);
            subscribeOverlay = document.createElement("div");
            subscribeOverlay.className = "project-card-subscribe-overlay";
            subscribeOverlay.append(subscribeWidget);
        }
        back.append(backHeader, backBody);
        if (subscribeOverlay) {
            back.append(subscribeOverlay);
        }
        inner.append(back);

        /**
         * @param {MouseEvent | KeyboardEvent} event
         */
        const toggleFlip = event => {
            const target = /** @type {HTMLElement} */ (event.target);
            if (target.closest("a")) {
                return;
            }

            const nowFlipped = card.classList.toggle("is-flipped");
            card.setAttribute("aria-pressed", nowFlipped ? "true" : "false");
        };

        card.addEventListener("click", toggleFlip);
        card.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
                const target = /** @type {HTMLElement} */ (event.target);
                if (target.closest("a")) {
                    return;
                }

                event.preventDefault();
                toggleFlip(event);
            }
        });
    }

    card.append(inner);
    return card;
}

/**
 * Builds a badge element scoped to the project status.
 * @param {ProjectStatus} status
 * @returns {HTMLElement}
 */
function buildStatusBadge(status) {
    const badge = document.createElement("span");
    badge.className = "status-badge";
    const modifier = STATUS_CLASS[status];
    if (modifier) badge.classList.add(modifier);
    badge.textContent = status;
    return badge;
}

/**
 * Renders project cards inside each section band.
 * @param {Project[]} projects
 */
function renderProjectBands(projects) {
    SECTION_ORDER.forEach(category => {
        const band = document.querySelector(`[data-band-category="${category}"]`);
        if (!band) return;
        const grid = band.querySelector("[data-band-cards]");
        if (!grid) return;

        grid.innerHTML = "";
        const scopedProjects = projects
            .filter(project => project.category === category)
            .sort((a, b) => {
                const byStatus = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
                if (byStatus !== 0) return byStatus;
                return a.name.localeCompare(b.name);
            });

        scopedProjects.forEach(project => {
            grid.append(buildProjectCard(project));
        });

        layoutBandRows(/** @type {HTMLElement} */ (grid));
    });
}

/**
 * Generates an uppercase monogram for the static icon block.
 * @param {string} name
 * @returns {string}
 */
function deriveMonogram(name) {
    const initials = name
        .split(/\s+/)
        .filter(Boolean)
        .map(part => part[0])
        .slice(0, 2)
        .join("");
    return initials.toUpperCase() || name.slice(0, 2).toUpperCase();
}

async function hydrateProjectCatalog() {
    try {
        const projects = await loadProjectCatalog();
        renderProjectBands(projects);
    } catch (error) {
        console.error("Failed to render project catalog:", error);
    }
}

const CARD_WIDTH_PX = 520;
const CARD_GAP_PX = 28;
const MOBILE_BREAKPOINT = 600;
const BAND_ROW_PADDING_PX = 24;

/**
 * Arrange project cards into rows with fixed-width cards:
 * - full rows alternate between left and right alignment
 * - the final row (even if partial) follows the same alternation pattern
 * @param {HTMLElement} grid
 */
function layoutBandRows(grid) {
    const allCards = /** @type {HTMLElement[]} */ (Array.from(
        grid.querySelectorAll(".project-card"),
    ));
    if (!allCards.length) return;

    if (window.innerWidth <= MOBILE_BREAKPOINT) {
        grid.innerHTML = "";
        allCards.forEach(card => grid.append(card));
        return;
    }

    grid.innerHTML = "";

    const containerWidth = grid.getBoundingClientRect().width || window.innerWidth;
    const step = CARD_WIDTH_PX + CARD_GAP_PX;
    const usableWidth = Math.max(0, containerWidth - BAND_ROW_PADDING_PX * 2);
    const computedPerRow = Math.floor((usableWidth + CARD_GAP_PX) / step);
    const maxPerRow = Math.max(1, Math.min(2, computedPerRow));
    const total = allCards.length;

    if (total <= maxPerRow) {
        const singleRow = document.createElement("div");
        singleRow.className = "band-row band-row-left";
        allCards.forEach(card => singleRow.append(card));
        grid.append(singleRow);
        return;
    }

    let index = 0;
    let rowIndex = 0;
    while (index < total) {
        const rowCards = allCards.slice(index, index + maxPerRow);
        const row = document.createElement("div");
        row.className = "band-row";

        const alignLeft = rowIndex % 2 === 0;

        row.classList.add(alignLeft ? "band-row-left" : "band-row-right");

        rowCards.forEach(card => row.append(card));
        grid.append(row);

        index += maxPerRow;
        rowIndex += 1;
    }
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
    hydrateProjectCatalog().catch(error => {
        console.error("Initialization error:", error);
    });

    window.addEventListener("resize", () => {
        const grids = document.querySelectorAll("[data-band-cards]");
        grids.forEach(grid => layoutBandRows(/** @type {HTMLElement} */ (grid)));
    });
});
