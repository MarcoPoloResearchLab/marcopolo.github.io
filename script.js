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

    const visual = document.createElement("div");
    visual.className = "project-card-visual";
    visual.textContent = deriveMonogram(project.name);

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

    card.append(header, body);
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
});
