// Portfolio renderer.
// All content lives in /content/*.yaml and is parsed in the browser with the
// vendored js-yaml, so there is no build step. Edit the YAML, not this file.
import * as yaml from "./vendor/js-yaml.mjs";

/* -------------------------------------------------------------------------
   Config
   ------------------------------------------------------------------------- */

const CONTENT_FILES = ["hero", "skills", "projects", "experience", "education", "contact", "profiles"];
const LOGO_DIR = "./assets/logos/";
const AVATAR_SRC = "./azim-avatar.png";
const DEFAULT_FOCUS = ["MATLAB", "Simulink", "Power Systems", "Renewable Energy", "Embedded Systems", "Circuit Design"];

const NAV = [
  ["about", "About"],
  ["education", "Education"],
  ["coursework", "Coursework"],
  ["research", "Research"],
  ["experience", "Experience"],
  ["projects", "Projects"],
  ["skills", "Skills"],
  ["organization", "Organization"],
  ["contact", "Contact"],
];

// Sections that do not have YAML content yet.
const PLACEHOLDER_TEXT = {
  coursework: "Coursework content will be added here.",
  research: "Research projects, interests, and ongoing work will be added here.",
  organization: "Organizational involvement, leadership roles, and memberships will be added here.",
};

const state = { site: null, profiles: null, slug: "", profile: null, showSelector: false };
const root = document.getElementById("root");
const params = new URLSearchParams(window.location.search);

/* -------------------------------------------------------------------------
   Small helpers
   ------------------------------------------------------------------------- */

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const each = (items, render) => (items ?? []).map(render).join("");
const stripUrl = (url = "") => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
const isWeb = (href = "") => /^https?:/i.test(href);
const linkAttrs = (href) => (isWeb(href) ? ' target="_blank" rel="noopener noreferrer"' : "");
const emphasize = (text = "") => text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const escapeHtml = (text) =>
  String(text).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

/* -------------------------------------------------------------------------
   Icons and brand logos
   ------------------------------------------------------------------------- */

const ICONS = {
  mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
  phone:
    '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  external:
    '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  up: '<polyline points="18 15 12 9 6 15"/>',
  // Fallback glyphs for skills that have no brand logo.
  layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  database:
    '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
  cpu: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/>',
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  github:
    '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>',
  linkedin:
    '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
  matlab: '<path d="M3 19L8 5l4 10 3-7 6 11h-4l-3-6-2 6h-4L6 10l-1 9z"/>',
  chart: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
  box: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
};

const icon = (name, className = "") =>
  `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

// [keyword, logo file]. Keywords match at the start of a word, case-insensitive.
const LOGOS = [
  ["laravel", "laravel-com-logo.png"],
  ["php", "php-net-logo.png"],
  ["codeigniter", "codeigniter-com-logo.png"],
  ["wordpress", "wordpress-com-logo.png"],
  ["apache", "apache-org-logo.png"],
  ["graphql", "graphql-org-logo.png"],
  ["grpc", "grpc-io-logo.png"],
  ["kafka", "kafka-summit-org-logo.png"],
  ["pusher", "pusher-com-logo.png"],
  ["go", "golangweekly-com-logo.png"],
  ["javascript", "typescript-com-logo.png"],
  ["typescript", "typescript-com-logo.png"],
  ["python", "python-org-logo.png"],
  ["node", "nodejs-org-logo.png"],
  ["mysql", "mysql-com-logo.png"],
  ["mongodb", "mongodb-com-logo.png"],
  ["postgres", "postgresql-org-logo.png"],
  ["algolia", "algolia-com-logo.png"],
  ["meilisearch", "meilisearch-com-logo.png"],
  ["elastic", "elastic-co-logo.png"],
  ["aws", "aws-logo.png"],
  ["digitalocean", "digitalocean-com-logo.png"],
  ["linux", "ubuntu-com-logo.png"],
  ["ubuntu", "ubuntu-com-logo.png"],
  ["vercel", "vercel-com-logo.png"],
  ["docker", "docker-com-logo.png"],
  ["kubernetes", "kubernetes-io-logo.png"],
  ["nginx", "nginx-org-logo.png"],
  ["github", "github-blog-logo.png"],
  ["linkedin", "linkedin-com-logo.png"],
  ["packagist", "packagist-com-logo.png"],
  ["instagram", "instagram-com-logo.png"],
  ["stackoverflow", "stackoverflow-com-logo.png"],
  ["play store", "googleplaylivros-com-logo.png"],
  ["play.google", "googleplaylivros-com-logo.png"],
  ["google play", "googleplaylivros-com-logo.png"],
  ["redis", "redis-net-cn-logo.png"],
  ["vue", "vuejs-org-logo.png"],
  ["tailwind", "tailwindcss-com-logo.png"],
  ["shadcn", "shadcn-io-logo.png"],
  ["react native", "reactnative-dev-logo.png"],
  ["react", "react-dev-logo.png"],
  ["next", "nextjs-org-logo.png"],
  ["expo", "expo-dev-logo.png"],
  ["claude", "claude-ai-logo.png"],
  ["anthropic", "anthropic-com-logo.png"],
  ["openai", "openai.jpg"],
  ["deepseek", "deepseek-com-logo.png"],
  ["cursor", "cursor-com-logo.png"],
  ["opencode", "opencode-ai-logo.png"],
  ["google", "google-com-logo.png"],
  ["fastapi", "tiangolo-com-logo.png"],
  ["statamic", "statamic-com-logo.png"],
  ["neon", "neon-com-logo.png"],
  ["supabase", "supabase-com-logo.png"],
  ["netlify", "sweet-pie-c52a63-blog-netlify-app-logo.png"],
  ["ollama", "ollama-com-logo.png"],
  ["langchain", "langchain-com-logo.png"],
];

const GLYPHS = [
  ["embedded", "cpu"],
  ["microcontroller", "cpu"],
  ["circuit", "cpu"],
  ["pcb", "cpu"],
  ["power", "zap"],
  ["energy", "zap"],
  ["signal", "activity"],
  ["simulink", "activity"],
  ["matlab", "matlab"],
  ["control", "layers"],
  ["system", "layers"],
  ["analysis", "chart"],
  ["data", "database"],
  ["hardware", "box"],
];

// Earliest word-start match wins; on a tie the longer keyword wins
// (so "google play" beats "go" and "react native" beats "react").
const bestMatch = (text, table) => {
  const haystack = text.toLowerCase();
  let best = null;
  for (const [key, value] of table) {
    const hit = new RegExp(`(^|[^a-z0-9])${escapeRegExp(key)}`).exec(haystack);
    if (!hit) continue;
    const pos = hit.index + hit[1].length;
    if (!best || pos < best.pos || (pos === best.pos && key.length > best.key.length)) {
      best = { key, value, pos };
    }
  }
  return best ? best.value : null;
};

const logoFor = (text = "") => {
  const file = bestMatch(text, LOGOS);
  return file ? `${LOGO_DIR}${file}` : null;
};

// Generic link labels ("Live site", "Demo") should not pick up a brand logo.
const brandLogo = (label = "", href = "") => {
  if (/live site|website|demo|app/i.test(label)) return null;
  if (href.includes("github.io") && !/github/i.test(label)) return null;
  return logoFor(`${label} ${href}`);
};

/* -------------------------------------------------------------------------
   Reusable fragments
   ------------------------------------------------------------------------- */

const chip = (label) => {
  const logo = logoFor(label);
  const glyph = bestMatch(label, GLYPHS);
  const media = logo
    ? `<img class="chip__logo" src="${logo}" alt="" loading="lazy">`
    : glyph
      ? icon(glyph, "chip__logo chip__glyph")
      : "";
  return `<span class="chip">${media}<span>${label}</span></span>`;
};

const linkWithLogo = (link) => {
  const lbl = (link.label || "").toLowerCase();
  const href = (link.href || "").toLowerCase();
  let media = "";

  if (lbl.includes("github") || href.includes("github")) {
    media = icon("github", "link__glyph");
  } else if (lbl.includes("linkedin") || href.includes("linkedin")) {
    media = icon("linkedin", "link__glyph");
  } else {
    media = icon("external", "link__glyph");
  }

  const printText = link.href.includes("play.google.com/store/apps/details")
    ? link.label || "Play Store"
    : stripUrl(link.href);
  return `<a class="link" href="${link.href}"${linkAttrs(link.href)}>${media}<span class="screen-only">${link.label}</span><span class="print-only">${printText}</span></a>`;
};

const sectionHead = (num, eyebrow, title, printTitle = title, note = "") => `
  <div class="section__head reveal">
    <span class="eyebrow">${num} · ${eyebrow}</span>
    <h2 class="section__title">
      <span class="screen-only">${title}</span>
      <span class="print-only">${printTitle}</span>
    </h2>
    ${typeof note === "string" && note ? `<p class="section__note">${note}</p>` : ""}
  </div>`;

const contactRow = (media, label, value) => `
  <li>
    <span class="contact-list__icon">${media}</span>
    <div class="contact-list__text"><span class="label">${label}</span>${value}</div>
  </li>`;

/* -------------------------------------------------------------------------
   Section templates
   ------------------------------------------------------------------------- */

const printHeader = () => {
  const { hero, contact } = state.site;
  const phone = contact.phone
    ? ` &bull; <span><strong>Mobile:</strong> <a href="tel:${String(contact.phone).replace(/[^\d+]/g, "")}">${contact.phone}</a></span>`
    : "";
  const links = each(
    contact.links,
    (l) => `<span><strong>${l.label}:</strong> <a href="${l.href}">${stripUrl(l.href)}</a></span>`
  ).replace(/<\/span><span>/g, "</span> &bull; <span>");

  return `
    <div class="print-head">
      <h1 class="print-head__name">${hero.name}</h1>
      <p class="print-head__title">${state.profile.printTitle ?? state.profile.name}</p>
      <p class="print-head__row">
        <span><strong>Email:</strong> <a href="mailto:${contact.email}">${contact.email}</a></span> &bull;
        <span><strong>Location:</strong> ${hero.location}</span>${phone}
      </p>
      <p class="print-head__row">${links}</p>
    </div>`;
};

const topbar = () => `
  <header class="topbar">
    <div class="wrap topbar__bar">
      <a href="#top" class="brand">
        <span class="brand__dot"></span>
        <span class="brand__text">
          <span class="brand__name">${state.site.hero.name}</span>
          <span class="brand__role">${state.profile.name}</span>
        </span>
      </a>
      <button class="menu-btn" type="button" aria-label="Toggle menu" aria-expanded="false" aria-controls="siteNav">
        <span class="menu-btn__bars"></span>
      </button>
      <nav class="nav" id="siteNav" aria-label="Sections">
        ${each(NAV, ([id, label]) => `<a href="#${id}">${label}</a>`)}
      </nav>
    </div>
  </header>`;

const roleSwitch = () => {
  if (!state.showSelector) return "";
  const [defaultSlug] = Object.keys(state.profiles);
  const pills = Object.entries(state.profiles)
    .map(([slug, p]) => {
      const href = slug === defaultSlug ? "./?target=1" : `./?profile=${slug}&target=1`;
      return `<a href="${href}" class="role-switch__pill${slug === state.slug ? " is-active" : ""}">${p.name}</a>`;
    })
    .join("");
  return `
    <div class="role-switch">
      <span class="role-switch__label">Target Role</span>
      <div class="role-switch__pills">${pills}</div>
    </div>`;
};

const heroAction = (action) => {
  const lbl = (action.label || "").toLowerCase();
  const href = (action.href || "").toLowerCase();
  let media = "";

  if (lbl.includes("github") || href.includes("github")) {
    media = icon("github", "btn__glyph");
  } else if (lbl.includes("linkedin") || href.includes("linkedin")) {
    media = icon("linkedin", "btn__glyph");
  } else if (href.startsWith("mailto:")) {
    media = icon("mail", "btn__glyph");
  } else {
    media = icon("external", "btn__glyph");
  }

  return `<a href="${action.href}"${linkAttrs(action.href)} class="btn btn--ghost">${media}<span>${action.label}</span></a>`;
};

const heroSection = () => {
  const { hero, contact } = state.site;
  const { profile } = state;
  const status = hero.status ?? (contact.openToWork ? "Open to new opportunities" : "");
  const focus = profile.focusTags ?? DEFAULT_FOCUS;

  return `
    <section class="hero">
      <div class="wrap hero__grid">
        <div class="hero__main">
          ${roleSwitch()}
          <p class="hero__kicker">${profile.name}</p>
          <h1 class="hero__title">${hero.name}</h1>
          <p class="hero__meta">
            <span>${hero.location}</span>
            ${status ? `<i class="hero__sep"></i><span>${status}</span>` : ""}
          </p>
         
          <ul class="hero__points">${each(hero.highlights, (h) => `<li>${h}</li>`)}</ul>
          <div class="hero__actions">${each(hero.actions, heroAction)}</div>
        </div>

        <aside class="hero__aside">
          <div class="portrait">
            <div class="portrait__ring">
              <img class="portrait__img" src="${AVATAR_SRC}" alt="Portrait of ${hero.name}" fetchpriority="high">
            </div>
            <span class="portrait__label">Engineering Focus</span>
            <div class="chips">${each(focus, chip)}</div>
          </div>
        </aside>
      </div>
    </section>`;
};

const aboutSection = () => {
  const { profile } = state;
  return `
    <section id="about" class="section">
      <div class="wrap">
        ${sectionHead("01", "About", profile.summaryHeading)}
        <div class="split">
          <div class="prose">${each(profile.summaryParagraphs, (p) => `<p>${p}</p>`)}</div>
          <div class="aside-list">
            <h3 class="subheading">What I work on</h3>
            <ul class="list">${each(profile.focusAreas, (item) => `<li>${item}</li>`)}</ul>
          </div>
        </div>
      </div>
    </section>`;
};

const educationSection = () => {
  const { education } = state.site;
  return `
    <section id="education" class="section">
      <div class="wrap">
        ${sectionHead("02", "Education", education.heading, "EDUCATION & ACADEMIC QUALIFICATIONS")}
        <div class="stack">
          ${each(
            education.items,
            (item) => `
            <article class="card edu reveal${item.printHide ? " print-hide" : ""}">
              <div class="edu__head">
                <div>
                  <h3 class="card__title">${item.degree}</h3>
                  <p class="meta">${item.institution}</p>
                  ${item.details ? `<p class="edu__details">${item.details}</p>` : ""}
                </div>
                <p class="meta edu__period">${item.period}</p>
              </div>
            </article>`
          )}
        </div>
      </div>
    </section>`;
};

const placeholderSection = (num, id, title, printTitle) => `
  <section id="${id}" class="section">
    <div class="wrap">
      ${sectionHead(num, title, title, printTitle)}
      <div class="card reveal"><p class="prose-line">${PLACEHOLDER_TEXT[id]}</p></div>
    </div>
  </section>`;

const jobCard = (role) => {
  const logo = brandLogo(role.company, role.website);
  const company = role.website
    ? `<a class="link link--muted" href="${role.website}"${linkAttrs(role.website)}>${role.company}<span class="print-only"> (${stripUrl(role.website)})</span></a>`
    : role.company;

  return `
    <article class="job reveal">
      <span class="job__dot"></span>
      <div class="card job__card">
        <div class="job__head">
          <div class="job__who">
            ${logo ? `<img class="job__logo" src="${logo}" alt="">` : ""}
            <div>
              <h3 class="card__title">${role.title}</h3>
              <p class="meta">${company}</p>
            </div>
          </div>
          <div class="job__when meta">
            <span>${role.period}</span>
            <span>${role.location}</span>
          </div>
        </div>
        <p class="prose-line">${role.summary}</p>
        <ul class="list">${each(role.bullets, (b) => `<li>${b}</li>`)}</ul>
        <div class="chips">${each(role.techStack, chip)}</div>
      </div>
    </article>`;
};

const experienceSection = () => {
  const { experience } = state.site;
  return `
    <section id="experience" class="section">
      <div class="wrap">
        ${sectionHead("05", "Experience", experience.heading, "PROFESSIONAL EXPERIENCE", experience.summary)}
        <div class="timeline">${each(experience.roles, jobCard)}</div>
      </div>
    </section>`;
};

const projectCard = (project, printed) => `
  <article class="project project--${project.layout || "half"} reveal${printed ? "" : " print-hide"}">
    ${
      project.image
        ? `<div class="project__media"><img src="${project.image}" alt="${project.imageAlt || project.name}" loading="lazy"></div>`
        : ""
    }
    <div class="project__body">
      <div class="project__head">
        <div>
          <h3 class="project__title">${project.name}</h3>
          <p class="meta">
            ${project.category ? `${project.category} · ` : ""}${project.role}${project.period ? `<span class="project__period"> · ${project.period}</span>` : ""}
          </p>
        </div>
        <div class="project__links">${each(project.links, linkWithLogo)}</div>
      </div>
      <p class="prose-line">${project.description}</p>
      <div class="chips">${each(project.techStack, chip)}</div>
    </div>
  </article>`;

const projectsSection = () => {
  const { projects } = state.site;
  const printed = (state.profile.featuredProjects ?? []).slice(0, 7);
  return `
    <section id="projects" class="section">
      <div class="wrap">
        ${sectionHead("06", "Projects", projects.heading, "PROJECTS")}
        <div class="projects">
          ${each(projects.items, (p) => projectCard(p, printed.includes(p.name)))}
        </div>
      </div>
    </section>`;
};

const skillsSection = () => `
  <section id="skills" class="section">
    <div class="wrap">
      ${sectionHead("07", "Tech Stack", "Skills", "TECHNICAL SKILLS & COMPETENCIES")}
      <div class="skills">
        ${each(
          state.site.skills.categories,
          (cat, i) => `
          <div class="card skill-box reveal">
            <div class="skill-box__head">
              <span class="skill-box__index">${String(i + 1).padStart(2, "0")}</span>
              <h3 class="skill-box__name">${cat.name}</h3>
            </div>
            <ul class="list list--roomy">${each(cat.items, (s) => `<li>${s}</li>`)}</ul>
          </div>`
        )}
      </div>
    </div>
  </section>`;

const contactSection = () => {
  const { contact } = state.site;
  const intro =
    (contact.openToWork ? "I’m currently open to new opportunities. " : "") +
    (contact.message ?? "Have a project, a research idea, or an opening on your team? Send a note and I’ll reply as soon as I can.");

  const linkRows = each(contact.links, (link) => {
    const logo = brandLogo(link.label, link.href);
    const media = logo ? `<img src="${logo}" alt="">` : icon("external");
    return contactRow(
      media,
      link.label,
      `<a class="link" href="${link.href}"${linkAttrs(link.href)}>${stripUrl(link.href)}</a>`
    );
  });

  return `
    <section id="contact" class="section">
      <div class="wrap">
        ${sectionHead("09", "Get in Touch", "Let’s Work Together", "CONTACT & PROFESSIONAL PROFILES")}
        <div class="contact">
          <div class="contact__intro">
            <p class="prose-line">${intro}</p>
            <div class="contact__actions">
              <a href="mailto:${contact.email}" class="btn btn--solid">${icon("mail", "btn__glyph")}<span>${contact.email}</span></a>
            </div>
          </div>
          <ul class="contact-list">
            ${contactRow(icon("mail"), "Email", `<a class="link" href="mailto:${contact.email}">${contact.email}</a>`)}
            ${
              contact.phone
                ? contactRow(
                    icon("phone"),
                    "Mobile",
                    `<a class="link" href="tel:${String(contact.phone).replace(/[^\d+]/g, "")}">${contact.phone}</a>`
                  )
                : ""
            }
            ${contactRow(icon("pin"), "Location", `<span>${contact.location}</span>`)}
            ${linkRows}
          </ul>
        </div>
      </div>
    </section>`;
};

const footer = () => `
  <footer class="footer">
    <div class="wrap footer__inner">
      <span>© ${new Date().getFullYear()} ${state.site.hero.name}</span>
      <span>${state.profile.name}</span>
    </div>
  </footer>`;

const pageTemplate = () => `
  <canvas id="bgCanvas" aria-hidden="true"></canvas>
  <div class="progress" id="scrollProgress"></div>
  <button id="toTop" class="to-top" type="button" aria-label="Back to top">
    <svg class="to-top__ring" width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
      <circle class="to-top__track" cx="22" cy="22" r="18" fill="none" stroke-width="2.5"/>
      <circle class="to-top__fill" cx="22" cy="22" r="18" fill="none" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
    ${icon("up", "to-top__arrow")}
  </button>
  <div class="page">
    ${printHeader()}
    ${topbar()}
    <main id="top">
      ${heroSection()}
      ${aboutSection()}
      ${educationSection()}
      ${placeholderSection("03", "coursework", "Coursework", "COURSEWORK")}
      ${placeholderSection("04", "research", "Research", "RESEARCH")}
      ${experienceSection()}
      ${projectsSection()}
      ${skillsSection()}
      ${placeholderSection("08", "organization", "Organizations", "ORGANIZATIONS")}
      ${contactSection()}
    </main>
    ${footer()}
  </div>`;

/* -------------------------------------------------------------------------
   Behaviour
   ------------------------------------------------------------------------- */

const setupMenu = () => {
  const bar = $(".topbar");
  const button = $(".menu-btn");
  const setOpen = (open) => {
    bar.classList.toggle("is-open", open);
    button.setAttribute("aria-expanded", String(open));
  };

  button.addEventListener("click", () => setOpen(!bar.classList.contains("is-open")));
  $$(".nav a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => e.key === "Escape" && setOpen(false));
  window.matchMedia("(min-width: 1001px)").addEventListener("change", (e) => e.matches && setOpen(false));
};

const setupScrollUi = () => {
  const bar = $("#scrollProgress");
  const toTop = $("#toTop");
  const ring = $(".to-top__fill");
  const circumference = 2 * Math.PI * 18;
  ring.style.strokeDasharray = `${circumference} ${circumference}`;

  const update = () => {
    const el = document.documentElement;
    const max = el.scrollHeight - el.clientHeight;
    const ratio = max > 0 ? Math.min(1, el.scrollTop / max) : 0;
    bar.style.transform = `scaleX(${ratio})`;
    ring.style.strokeDashoffset = String(circumference * (1 - ratio));
    toTop.classList.toggle("is-visible", el.scrollTop > 300);
  };

  let queued = false;
  window.addEventListener(
    "scroll",
    () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        update();
        queued = false;
      });
    },
    { passive: true }
  );

  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  update();
};

const setupActiveNav = () => {
  const links = new Map($$(".nav a").map((a) => [a.getAttribute("href").slice(1), a]));
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        links.forEach((a) => a.classList.remove("is-active"));
        links.get(entry.target.id)?.classList.add("is-active");
      }
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  $$("main section[id]").forEach((section) => observer.observe(section));
};

const setupReveal = () => {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
  );
  $$(".reveal").forEach((el) => observer.observe(el));
};

// Clicking an email link still opens the mail app, and also copies the address.
const setupCopyEmail = () => {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  toast.innerHTML = `${icon("check", "toast__icon")}<span></span>`;
  document.body.appendChild(toast);

  let timer;
  const show = (message) => {
    $("span", toast).textContent = message;
    toast.classList.add("is-shown");
    clearTimeout(timer);
    timer = setTimeout(() => toast.classList.remove("is-shown"), 2200);
  };

  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="mailto:"]');
    if (!link || !navigator.clipboard) return;
    const email = link.getAttribute("href").replace("mailto:", "");
    navigator.clipboard.writeText(email).then(() => show(`Copied ${email}`)).catch(() => {});
  });
};

/* Ambient background: faint drifting logos and code snippets on a canvas. */
const BG_LOGOS = [
  "python-org-logo.png",
  "github-blog-logo.png",
  "linkedin-com-logo.png",
  "google-com-logo.png",
  "react-dev-logo.png",
  "nodejs-org-logo.png",
  "docker-com-logo.png",
  "typescript-com-logo.png",
  "vercel-com-logo.png",
  "cursor-com-logo.png",
  "claude-ai-logo.png",
];

const BG_SNIPPETS = [
  "V = I * R;",
  "P = V * I * cos(phi);",
  "X_L = 2*pi*f*L;",
  "tau = R * C;",
  "y = filter(b, a, x);",
  "Y = fft(x, N);",
  "plot(t, y);",
  "sys = tf(num, den);",
  "bode(G);",
  "u = Kp*e + Ki*int_e;",
  "np.convolve(x, h)",
  "scipy.signal.butter(4, fc)",
  "analogRead(A0);",
  "digitalWrite(LED, HIGH);",
  "ADC_Read(CH0);",
  "PWM_SetDuty(45);",
  "always @(posedge clk)",
  "assign out = a & b;",
  "#define F_CPU 16000000UL",
  "TCCR1B |= (1 << CS10);",
];

const BG_COLORS = ["#f08a5d", "#e2b714", "#ff9f43", "#a0a6be", "#ffffff"];

const startBackground = () => {
  const canvas = $("#bgCanvas");
  const ctx = canvas && canvas.getContext("2d");
  if (!ctx || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const smallScreen = window.matchMedia("(max-width: 700px)").matches;
  const canHover = window.matchMedia("(hover: hover)").matches;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const COUNT = smallScreen ? 16 : 40;
  const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Courier New", monospace';

  const rand = (min, max) => min + Math.random() * (max - min);
  const pick = (list) => list[Math.floor(Math.random() * list.length)];

  const logos = [];
  BG_LOGOS.forEach((file) => {
    const img = new Image();
    img.onload = () => logos.push(img);
    img.src = `${LOGO_DIR}${file}`;
  });

  let width = 0;
  let height = 0;
  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();

  // Phones fire "resize" whenever the URL bar hides; only react to real width changes.
  window.addEventListener("resize", () => {
    if (window.innerWidth !== width) resize();
  });

  const pointer = { x: -1000, y: -1000 };
  if (canHover) {
    window.addEventListener("pointermove", (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    });
    document.addEventListener("mouseleave", () => {
      pointer.x = pointer.y = -1000;
    });
  }

  const spawn = (initial = false) => {
    const angle = rand(0, Math.PI * 2);
    const speed = rand(0.15, 0.5);
    const life = rand(450, 1000);
    const asLogo = logos.length > 0 && Math.random() < 0.5;
    const size = rand(26, 52);
    return {
      kind: asLogo ? "logo" : "code",
      img: asLogo ? pick(logos) : null,
      text: asLogo ? "" : pick(BG_SNIPPETS),
      color: pick(BG_COLORS),
      size,
      fontSize: Math.round(rand(13, 17)),
      x: rand(0, width),
      y: initial ? rand(0, height) : Math.random() < 0.5 ? -size : height + size,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rot: asLogo ? rand(0, Math.PI * 2) : rand(-0.04, 0.04),
      spin: asLogo ? rand(-0.0025, 0.0025) : rand(-0.0005, 0.0005),
      opacity: asLogo ? rand(0.08, 0.18) : rand(0.08, 0.16),
      age: initial ? Math.floor(rand(0, life)) : 0,
      life,
    };
  };

  const particles = Array.from({ length: COUNT }, () => spawn(true));

  const frame = () => {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p, i) => {
      p.age += 1;

      // Push away from the pointer and brighten slightly.
      const dx = p.x - pointer.x;
      const dy = p.y - pointer.y;
      const dist = Math.hypot(dx, dy) || 1;
      let boost = 1;
      if (dist < 160) {
        const force = (160 - dist) / 160;
        p.x += (dx / dist) * force * 1.8;
        p.y += (dy / dist) * force * 1.8;
        boost += force * 1.8;
      }

      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.spin;

      const edge = p.life * 0.2;
      const fade = Math.min(1, p.age / edge, (p.life - p.age) / edge);
      const alpha = Math.max(0, Math.min(0.4, p.opacity * fade * boost));

      if (alpha > 0) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        if (p.kind === "logo") {
          ctx.drawImage(p.img, -p.size / 2, -p.size / 2, p.size, p.size);
        } else {
          ctx.font = `400 ${p.fontSize}px ${MONO}`;
          ctx.fillStyle = p.color;
          ctx.fillText(p.text, 0, 0);
        }
        ctx.restore();
      }

      const gone = p.age >= p.life || p.x < -180 || p.x > width + 180 || p.y < -120 || p.y > height + 120;
      if (gone) particles[i] = spawn();
    });

    requestAnimationFrame(frame);
  };

  requestAnimationFrame(frame);
};

/* -------------------------------------------------------------------------
   Boot
   ------------------------------------------------------------------------- */

const loadContent = async () => {
  const entries = await Promise.all(
    CONTENT_FILES.map(async (name) => {
      const res = await fetch(`content/${name}.yaml`);
      if (!res.ok) throw new Error(`content/${name}.yaml (HTTP ${res.status})`);
      return [name, yaml.load(await res.text())];
    })
  );
  const { profiles, ...site } = Object.fromEntries(entries);
  state.site = site;
  state.profiles = profiles;
};

const chooseProfile = () => {
  const slugs = Object.keys(state.profiles);
  const requested = params.get("profile");
  state.slug = slugs.includes(requested) ? requested : slugs[0];
  state.profile = state.profiles[state.slug];
  state.showSelector = params.get("target") === "1";
};

const showLoadError = (err) => {
  root.innerHTML = `
    <div class="load-error">
      <p>Couldn’t load the site content. This page needs a web server (GitHub Pages, or <code>npx http-server</code> locally).</p>
      <p class="load-error__detail">${escapeHtml(err && err.message ? err.message : err)}</p>
    </div>`;
};

const start = async () => {
  if (!root) return;

  try {
    await loadContent();
    chooseProfile();
  } catch (err) {
    showLoadError(err);
    return;
  }

  root.innerHTML = pageTemplate();

  setupMenu();
  setupScrollUi();
  setupActiveNav();
  setupReveal();
  setupCopyEmail();
  startBackground();
};

start();
