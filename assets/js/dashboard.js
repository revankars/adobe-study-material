import { escapeHtml } from "./study.js";
import { loadJson } from "./data.js";

export function renderDashboard(certifications, chapters, questions, state, exam) {
  const availableChapters = chapters?.chapters.length || 0;
  const attempted = state.results.reduce((total, result) => total + result.total, 0);
  const average = state.results.length
    ? Math.round(state.results.reduce((total, result) => total + result.percentage, 0) / state.results.length)
    : 0;
  const completed = state.completedChapters.length;
  
  // Find current certification being studied
  const currentCert = certifications.find(c => c.id === exam?.certificationId);
  const certName = currentCert ? `${currentCert.code} - ${currentCert.name}` : 'Current Certification';
  
  return `
    <section class="dashboard-hero">
      <div><p class="eyebrow">Your learning workspace</p><h1>Learn with focus.<br>Prepare with confidence.</h1><p>Study guides, practice tests, timed mock examinations and quick revision for four Adobe certifications.</p><button class="button primary" data-view="study">Continue studying <span aria-hidden="true">→</span></button></div>
    </section>
    <div class="disclaimer-section" style="background: #f5f5f5; border-left: 4px solid #0078d4; padding: 20px; margin: 30px 0; border-radius: 4px;">
      <h3 style="margin: 0 0 10px 0; color: #333; font-size: 14px; font-weight: 600;">📋 Educational Disclaimer</h3>
      <p style="margin: 0; color: #666; font-size: 13px; line-height: 1.6;">This study material is based on personal learning and preparation for Adobe certification examinations. It is an independent study resource and is not official Adobe training or examination content. Practice questions are independently created for learning and self-assessment and do not represent actual Adobe exam questions. I strongly recommend referring to the latest official Adobe exam guides and Adobe Experience League documentation as your primary study references. This project is not affiliated with or endorsed by Adobe Inc.</p>
    </div>
    <div class="section-title"><h2>Your certification tracks</h2><span>${certifications.length} learning paths</span></div>
    <div class="course-grid" id="course-grid">${certifications.map((cert) => {
      const current = cert.id === exam?.certificationId;
      return `<article class="course-card" data-cert-id="${cert.id}">
        <div class="course-top"><span class="course-initial" title="Certification icon">${cert.icon || 'A'}</span><span class="badge ${cert.contentAvailable ? "ready" : ""}">${cert.contentAvailable ? "Study ready" : "Awaiting materials"}</span></div>
        <h3>${escapeHtml(cert.name)}</h3><p class="exam-code">${escapeHtml(cert.code)}</p><p class="course-description">${escapeHtml(cert.description)}</p>
        <div class="course-meta"><span><strong class="cert-chapters">${current ? availableChapters : "—"}</strong> <span class="unit-chapters">${availableChapters === 1 ? "chapter" : "chapters"}</span></span><span><strong class="cert-questions">${current ? questions?.questions.length || 0 : "—"}</strong> questions</span></div>
        <button class="button primary" data-action="${current ? "open-study" : (cert.contentAvailable ? "load-certification" : "course-unavailable")}" data-cert-id="${cert.id}">${current ? "Study Material" : (cert.contentAvailable ? "Study Material" : "Content not added yet")}</button>
        ${cert.officialLinks ? `<div class="official-links" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
          <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: 600; color: #0078d4; text-transform: uppercase;">Official Resources</p>
          <ul style="margin: 0; padding: 0; list-style: none;">
            ${cert.officialLinks.examDetails ? `<li style="margin: 5px 0;"><a href="${escapeHtml(cert.officialLinks.examDetails)}" target="_blank" rel="noopener noreferrer" style="color: #0078d4; text-decoration: none; font-size: 12px; hover: underline;">📄 Exam Details & Objectives</a></li>` : ''}
            ${cert.officialLinks.examPrepGuide ? `<li style="margin: 5px 0;"><a href="${escapeHtml(cert.officialLinks.examPrepGuide)}" target="_blank" rel="noopener noreferrer" style="color: #0078d4; text-decoration: none; font-size: 12px;">📚 Exam Prep Guide</a></li>` : ''}
            ${cert.officialLinks.overview ? `<li style="margin: 5px 0;"><a href="${escapeHtml(cert.officialLinks.overview)}" target="_blank" rel="noopener noreferrer" style="color: #0078d4; text-decoration: none; font-size: 12px;">🎓 Certification Overview</a></li>` : ''}
            ${cert.officialLinks.certificationPortal ? `<li style="margin: 5px 0;"><a href="${escapeHtml(cert.officialLinks.certificationPortal)}" target="_blank" rel="noopener noreferrer" style="color: #0078d4; text-decoration: none; font-size: 12px;">🌐 Certification Portal</a></li>` : ''}
            ${cert.officialLinks.practiceTest ? `<li style="margin: 5px 0;"><a href="${escapeHtml(cert.officialLinks.practiceTest)}" target="_blank" rel="noopener noreferrer" style="color: #0078d4; text-decoration: none; font-size: 12px;">✏️ Practice Test</a></li>` : ''}
          </ul>
        </div>` : ''}
      </article>`;
    }).join("")}</div>
    <div class="two-column">
      <section><div class="section-title"><h2>Exam domain weighting</h2><span>${certName} · verify current objectives</span></div><div class="panel">${exam?.domains?.map((domain) => `<div class="domain-row"><span>${escapeHtml(domain.name)}</span><div class="progress-track"><span style="width:${domain.weight}%"></span></div><strong>${domain.weight}%</strong></div>`).join("") || ""}</div></section>
    </div>`;
}

export async function populateCertificationCounts(certifications) {
  const grid = document.getElementById("course-grid");
  if (!grid) return;

  const cards = grid.querySelectorAll("[data-cert-id]");
  
  for (const card of cards) {
    const certId = card.getAttribute("data-cert-id");
    const cert = certifications.find(c => c.id === certId);
    
    if (!cert?.contentAvailable) {
      continue;
    }
    
    try {
      const [chaptersData, questionsData] = await Promise.all([
        loadJson(cert.chaptersFile),
        loadJson(cert.questionsFile),
      ]);
      
      if (!chaptersData || !questionsData) {
        continue;
      }
      
      const chaptersEl = card.querySelector(".cert-chapters");
      const questionsEl = card.querySelector(".cert-questions");
      
      if (chaptersEl && chaptersData.chapters) {
        chaptersEl.textContent = chaptersData.chapters.length;
        const unit = chaptersEl.parentElement?.querySelector(".unit-chapters");
        if (unit) unit.textContent = chaptersData.chapters.length === 1 ? "chapter" : "chapters";
      }
      if (questionsEl && questionsData.questions) questionsEl.textContent = questionsData.questions.length;
    } catch (error) {
      // Silently continue if data loading fails
    }
  }
}


