async function loadJson(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
  }[c]));
}

async function showVersion() {
  try {
    const data = await loadJson("version.json");
    const el = document.getElementById("version");
    if (el) el.textContent = `v${data.version}`;
    return data.version;
  } catch {
    return null;
  }
}

function renderList(drills) {
  const list = document.getElementById("drillList");
  list.innerHTML = drills.map(d => `
    <a class="listItem" href="drill.html?id=${encodeURIComponent(d.id)}">
      <div class="listTitle">${escapeHtml(d.title)}</div>
      <div class="listMeta">Tap to open</div>
    </a>
  `).join("");
}

async function checkForUpdate(currentVersion) {
  if (!currentVersion) return;

  const stored = localStorage.getItem("appVersion");
  const reloadedFor = sessionStorage.getItem("reloadedForVersion");

  // If version changed, reload once per session to pick up new assets
  if (stored && stored !== currentVersion) {
    if (reloadedFor !== currentVersion) {
      sessionStorage.setItem("reloadedForVersion", currentVersion);
      localStorage.setItem("appVersion", currentVersion); // set before reload to prevent loops
      location.reload();
      return;
    }
  }

  localStorage.setItem("appVersion", currentVersion);
}


async function registerServiceWorker(version) {
  if (!("serviceWorker" in navigator)) return;

  try {
    // Only changes when version.json changes
    await navigator.serviceWorker.register(`sw.js?v=${encodeURIComponent(version || "0")}`);
  } catch {
    // ignore
  }
}


async function main() {
  const version = await showVersion();
  await checkForUpdate(version);

  try {
    const drills = await loadJson("drills.json");
    renderList(drills);
  } catch (e) {
    document.getElementById("drillList").innerHTML =
      `<div class="error">Error: ${escapeHtml(String(e.message || e))}</div>`;
  }
  await registerServiceWorker(version);
}

main();
