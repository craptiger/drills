async function loadDrills() {
  const res = await fetch("drills.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load drills.json");
  return res.json();
}
async function showVersion() {
  try {
    const res = await fetch("version.json", { cache: "no-store" });
    const data = await res.json();
    document.getElementById("version").textContent =
      `v${data.version}`;
  } catch {}
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
  }[c]));
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

async function main() {
  try {
    const drills = await loadDrills();
    renderList(drills);
    await showVersion();
  } catch (e) {
    document.getElementById("drillList").innerHTML =
      `<div class="error">Error: ${escapeHtml(String(e.message || e))}</div>`;
  }

  // Register Service Worker (offline cache)
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
}

main();

