async function loadJson(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

function getId() {
  const p = new URLSearchParams(location.search);
  return p.get("id");
}

function renderText(text) {
  const parts = String(text || "").split(/\n\s*\n/);
  return parts.map(p => {
    const safe = p.replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
    }[c])).replace(/\n/g, "<br>");
    return `<p>${safe}</p>`;
  }).join("");
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

async function registerServiceWorker(version) {
  if (!("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register(`sw.js?v=${encodeURIComponent(version || "0")}`);
  } catch {
    // ignore
  }
}

async function main() {
  const version = await showVersion();

  const id = getId();
  if (!id) {
    location.href = "index.html";
    return;
  }

  const drills = await loadJson("drills.json");
  const drill = drills.find(d => String(d.id) === String(id));

  if (!drill) {
    document.getElementById("title").textContent = "Not found";
    document.getElementById("text").innerHTML = "<p>Drill not found.</p>";
    await registerServiceWorker(version);
    return;
  }

  document.title = drill.title;
  document.getElementById("title").textContent = drill.title;

  const img = document.getElementById("gif");
  img.src = drill.gif;
  img.alt = `${drill.title} animation`;

  document.getElementById("text").innerHTML = renderText(drill.text);

  await registerServiceWorker(version);
}

main();
