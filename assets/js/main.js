// Génère la page à partir de data/apps/index.json + data/apps/<id>.json
// Chaque app possède son propre fichier JSON, écrasé uniquement par sa
// propre CI — aucune app ne peut en écraser une autre.
//
// Pour ajouter une nouvelle app : ajouter son id dans data/apps/index.json
// (à la main, une seule fois), puis laisser sa CI publier
// data/apps/<id>.json et les binaires dans /releases/<...>.

async function init() {
  const catalogEl = document.getElementById("catalog");

  let ids;
  try {
    const res = await fetch("./data/index.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    ids = await res.json();
  } catch (err) {
    catalogEl.innerHTML = `<p class="catalog__error">Impossible de charger l'index des apps (data/index.json). ${escapeHtml(String(err))}</p>`;
    return;
  }

  const results = await Promise.all(ids.map(loadApp));
  const apps = results.filter((a) => a !== null);

  renderHero(apps);
  renderCatalog(catalogEl, apps, results.length - apps.length);
}

async function loadApp(id) {
  try {
    const res = await fetch(`./data/apps/${id}.json`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`Échec du chargement de l'app "${id}" :`, err);
    return null;
  }
}

function renderHero(apps) {
  const nameEl = document.getElementById("org-name");
  const githubEl = document.getElementById("org-github");
  const statsEl = document.getElementById("hero-stats");

  // À personnaliser : ces valeurs sont statiques car elles ne dépendent
  // pas d'une app en particulier. Éditer directement index.html si besoin,
  // ou les sortir dans un data/org.json si elles doivent devenir dynamiques.
  document.title = `${nameEl.textContent} — téléchargements`;
  if (!githubEl.getAttribute("href") || githubEl.getAttribute("href") === "#") {
    githubEl.remove();
  }

  const appCount = apps.length;
  const fileCount = apps.reduce((sum, a) => sum + (a.downloads?.length || 0), 0);
  statsEl.textContent = `${appCount} application${appCount > 1 ? "s" : ""} · ${fileCount} binaire${fileCount > 1 ? "s" : ""} disponible${fileCount > 1 ? "s" : ""}`;
}

function renderCatalog(root, apps, failedCount) {
  root.innerHTML = "";

  if (failedCount > 0) {
    const warn = document.createElement("p");
    warn.className = "catalog__error";
    warn.textContent = `${failedCount} app(s) n'ont pas pu être chargées (voir la console).`;
    root.appendChild(warn);
  }

  if (apps.length === 0) {
    const p = document.createElement("p");
    p.className = "catalog__empty";
    p.textContent = "Aucune application publiée pour l'instant.";
    root.appendChild(p);
    return;
  }

  for (const app of apps) {
    root.appendChild(renderAppEntry(app));
  }
}

function renderAppEntry(app) {
  const entry = document.createElement("article");
  entry.className = "app-entry";

  const stampParts = [];
  if (app.version) stampParts.push(`v${app.version}`);
  if (app.releaseDate) stampParts.push(app.releaseDate);
  const stamp = stampParts.join(" · ");

  entry.innerHTML = `
    <div class="app-entry__head">
      <h2 class="app-entry__name">${escapeHtml(app.name || app.id)}</h2>
      ${stamp ? `<span class="app-entry__stamp">${escapeHtml(stamp)}</span>` : ""}
    </div>
    ${app.tagline ? `<p class="app-entry__tagline">${escapeHtml(app.tagline)}</p>` : ""}
    ${app.description ? `<p class="app-entry__description">${escapeHtml(app.description)}</p>` : ""}
    ${app.repo ? `<div class="app-entry__links"><a href="${escapeAttr(app.repo)}" target="_blank" rel="noopener">Code source ↗</a></div>` : ""}
    <div class="downloads"></div>
  `;

  const downloadsEl = entry.querySelector(".downloads");
  const downloads = app.downloads || [];

  if (downloads.length === 0) {
    const p = document.createElement("p");
    p.className = "catalog__empty";
    p.textContent = "Aucun binaire disponible pour cette application.";
    downloadsEl.appendChild(p);
  } else {
    for (const dl of downloads) {
      downloadsEl.appendChild(renderDownloadRow(dl));
    }
  }

  return entry;
}

function renderDownloadRow(dl) {
  const a = document.createElement("a");
  a.className = "download-row";
  a.href = dl.file;
  a.setAttribute("download", "");

  a.innerHTML = `
    <span class="download-row__platform">${escapeHtml(dl.platform || "")}</span>
    <span class="download-row__label">${escapeHtml(dl.label || dl.file)}</span>
    ${dl.size ? `<span class="download-row__meta">${escapeHtml(dl.size)}</span>` : ""}
    <span class="download-row__arrow" aria-hidden="true">↓</span>
  `;
  return a;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(str) {
  return escapeHtml(str).replace(/"/g, "&quot;");
}

init();