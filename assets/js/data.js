// Loads a JSON data file. Over HTTP it fetches the file. When the portal is opened
// straight from disk (file://), browsers block fetch, so the same data is read from
// assets/js/data-bundle.js, which tools/build_bundle.py generates from data/.
export async function loadJson(path) {
  if (window.location.protocol === "file:") {
    const data = window.PORTAL_DATA && window.PORTAL_DATA[path];
    if (data === undefined) throw new Error(`No bundled data for ${path}`);
    return JSON.parse(JSON.stringify(data));
  }
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load ${path}: ${response.status}`);
  return response.json();
}
