/**
 * Quick Revision: a short summary of each study part, taken from the complete study guides.
 * Each point links to its full section in the guide.
 */
import { escapeHtml } from "./study.js";

export function renderQuickRevisionSelection(certifications, summaries) {
  const cards = certifications
    .filter((cert) => cert.contentAvailable)
    .map((cert) => {
      const summary = summaries[cert.id];
      const parts = summary ? summary.parts.length : 0;
      const points = summary ? summary.parts.reduce((total, part) => total + part.points.length, 0) : 0;
      return `
        <div class="revision-block">
          <div class="revision-block-header">
            <div class="revision-icon">${escapeHtml(cert.icon || "📚")}</div>
            <div class="revision-info">
              <h3>${escapeHtml(cert.code)} - ${escapeHtml(cert.name)}</h3>
              <p class="revision-code">${escapeHtml(cert.code)}</p>
            </div>
          </div>
          <div class="revision-block-body">
            <p class="revision-description">${summary ? "One line for each section of the study guide, with a link to the full text." : "Summary not available yet."}</p>
            <div class="revision-stats">
              <div class="stat"><span class="stat-label">Parts</span><span class="stat-value">${parts}</span></div>
              <div class="stat"><span class="stat-label">Points</span><span class="stat-value">${points}</span></div>
            </div>
          </div>
          <div class="revision-block-footer">
            <button class="btn-start-revision" data-action="start-revision" data-cert-id="${escapeHtml(cert.id)}" ${summary ? "" : "disabled"}>
              ${summary ? "Open quick revision" : "Coming soon"}
            </button>
          </div>
        </div>`;
    })
    .join("");

  return `
    <div class="quick-revision-container">
      <div class="revision-header">
        <h1>Quick Revision</h1>
        <p class="revision-subtitle">A short summary of each study part. Open a point to read its full section.</p>
      </div>
      <div class="quick-revision-grid">${cards}</div>
    </div>`;
}

export function renderQuickRevisionSummary(cert, summary) {
  const parts = summary.parts
    .map(
      (part) => `
        <section class="qr-part">
          <h2>${escapeHtml(part.title)}</h2>
          <ul class="qr-points">
            ${part.points
              .map(
                (point) => `
              <li>
                <button class="qr-point" data-action="open-study-section" data-cert-id="${escapeHtml(cert.id)}" data-anchor="${escapeHtml(point.anchor)}">
                  <span class="qr-text">${escapeHtml(point.text)}</span>
                  <span class="qr-open">Open section →</span>
                </button>
              </li>`
              )
              .join("")}
          </ul>
        </section>`
    )
    .join("");

  return `
    <div class="quick-revision-container qr-summary">
      <div class="revision-header">
        <button class="btn-back-to-subjects" data-action="view-revision-selection">← All quick revisions</button>
        <h1>${escapeHtml(cert.code)} quick revision</h1>
        <p class="revision-subtitle">${escapeHtml(cert.name)}. Open a point to read its full section in the study guide.</p>
      </div>
      ${parts}
    </div>`;
}
