async function loadDrills() {
  const res = await fetch("drills.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load drills.json");
  return res.json();
}

function getId() {
  const p = new URLSearchParams(location.search);
  return p.get("id");
}

function renderText(text) {
  // Convert newlines into paragraphs safely
  const parts = String(text || "").split(/\n\s*\n/);
  return parts.map(p => `<p>${p.replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
  }[c])).replace(/\n/g, "<br>")}</p>`).join("");
}

async function main() {
  const id = getId();
  if (!id) {
    location.href = "index.html";
    return;
  }

  const drills = await loadDrills();
  const drill = drills.find(d => String(d.id) === String(id));
  if (!drill) {
    document.getElementById("title").textContent = "Not found";
    document.getElementById("text").innerHTML = "<p>Drill not found.</p>";
    return;
  }

  document.title = drill.title;
  document.getElementById("title").textContent = drill.title;

  const img = document.getElementById("gif");
  img.src = drill.gif;
  img.alt = `${drill.title} animation`;

  document.getElementById("text").innerHTML = renderText(drill.text);

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
}

main();
