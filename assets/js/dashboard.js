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


export function renderRevision(chapters, exam) {
  // Build quick revision cards
  // Prefer quickRevision array if it exists (like in AD0-E408), otherwise build from topics
  let quickRevisionCards = [];
  
  if (chapters.quickRevision && Array.isArray(chapters.quickRevision)) {
    // Use the pre-built quickRevision array
    quickRevisionCards = chapters.quickRevision;
  } else {
    // Fall back to building from chapter topics
    quickRevisionCards = chapters.chapters.flatMap((chapter) => {
      // If chapter has topics array (AD0-E408, AD0-E409), use those
      if (chapter.topics && Array.isArray(chapter.topics)) {
        return chapter.topics.map((topic) => ({
          title: typeof topic === 'string' ? topic : topic.title,
          text: typeof topic === 'object' && topic.content ? topic.content : ''
        }));
      }
      
      // If chapter has fullContent string (AD0-E207), extract main sections
      if (chapter.fullContent && typeof chapter.fullContent === 'string') {
        // Extract lines that start with bullet + number pattern: "• 1. ", "• 2. ", "• 3. ", etc.
        const lines = chapter.fullContent.split('\n');
        const cards = [];
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          // Look for pattern like "• 1. Title" or "• 2. Title (percentage)"
          const match = line.match(/^•\s+(\d+)\.\s+(.+?)(?:\s*\([^)]*\))?$/);
          if (match) {
            const sectionNum = match[1];
            const sectionTitle = match[2].trim();
            
            // Collect next few lines as content (until next section or end)
            let content = '';
            for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
              const nextLine = lines[j];
              // Stop if we hit another main section or subsection
              if (nextLine.match(/^•\s+(\d+)\.|^•\s+(\d+\.\d+)/)) break;
              if (nextLine.trim()) content += ' ' + nextLine.trim();
            }
            
            cards.push({
              title: sectionTitle.substring(0, 60),
              text: content.substring(0, 200)
            });
            
            // Limit to 10 cards
            if (cards.length >= 10) break;
          }
        }
        
        if (cards.length > 0) return cards;
      }
      
      // If chapter has content string (AD0-E207 fallback), split into sections
      if (chapter.content && typeof chapter.content === 'string') {
        // Split by common section markers (numbers/bullets/headers)
        const sections = chapter.content
          .split(/\n(?=[\d•\-\*]\s|[A-Z][A-Z\s]{2,}:)/g)
          .filter(s => s.trim().length > 0)
          .slice(0, 10) // Limit to 10 cards per chapter
          .map((section) => {
            const lines = section.trim().split('\n');
            const title = lines[0].substring(0, 60).trim();
            const text = lines.slice(1).join(' ').trim().substring(0, 200);
            return { title, text };
          });
        return sections.length > 0 ? sections : [
          { title: chapter.title || 'Chapter', text: chapter.content.substring(0, 200) }
        ];
      }
      
      // Fallback: create card from chapter title and overview
      return [{
        title: chapter.title || 'Unknown',
        text: chapter.overview || ''
      }];
    });
  }

  // Build domain priorities using exam data
  let domainsList = '';
  if (exam && exam.domains && Array.isArray(exam.domains)) {
    domainsList = exam.domains.map((domain) => {
      const weight = domain.weight || 0;
      const domainName = domain.name || domain.id || 'Unknown';
      return `<div class="domain-row"><span>${escapeHtml(domainName)}</span><div class="progress-track"><span style="width:${weight}%"></span></div><strong>${weight}%</strong></div>`;
    }).join("");
  } else {
    // Fallback: build from chapter topics (old behavior)
    domainsList = chapters.chapters.map((chapter) => {
      // Normalize weight: convert string with % to number, handle null
      let weight = chapter.weight;
      if (typeof weight === 'string') {
        weight = parseInt(weight, 10) || 0;
      } else if (weight === null || weight === undefined) {
        weight = 0;
      }
      
      const domain = chapter.domain || chapter.title || 'Unknown';
      return `<div class="domain-row"><span>${escapeHtml(domain)}</span><div class="progress-track"><span style="width:${weight}%"></span></div><strong>${weight}%</strong></div>`;
    }).join("");
  }

  return `
    <div class="page-heading"><div><p class="eyebrow">Fast review</p><h1>Quick revision</h1><p>Concise comparisons and troubleshooting reminders extracted from the study guide.</p></div><button class="text-button" data-action="return-to-revision"><span>← Back</span></button></div>
    <div class="revision-grid">${quickRevisionCards.map((item) => `<article class="revision-card"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text.substring(0, 200))}${item.text.length > 200 ? '…' : ''}</p></article>`).join("")}</div>
    <div class="section-title"><h2>Domain priorities</h2><span>Guide weighting only · verify the current blueprint</span></div>
    <div class="panel">${domainsList}</div>
    <div class="callout"><strong>Source caveat</strong>The supplied guide explicitly identifies version-sensitive and unverified items. Follow each chapter's verification note and consult current Adobe documentation before relying on those details.</div>`;
}
