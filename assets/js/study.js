export function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function renderSection(section) {
  const paragraphs = (section.paragraphs || []).map((text) => `<p>${escapeHtml(text)}</p>`).join("");
  const bullets = section.bullets?.length
    ? `<ul>${section.bullets.map((text) => `<li>${escapeHtml(text)}</li>`).join("")}</ul>`
    : "";
  const table = section.table?.length
    ? `<div class="table-scroll"><table class="content-table"><thead><tr>${section.table[0].map((cell) => `<th>${escapeHtml(cell)}</th>`).join("")}</tr></thead><tbody>${section.table.slice(1).map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`
    : "";
  return `<section><h3>${escapeHtml(section.title)}</h3>${paragraphs}${bullets}${table}</section>`;
}

export function renderStudy(chaptersData, questionsData, state, certName = "") {
  const chapters = chaptersData.chapters;
  const chapter = chapters.find((item) => item.id === state.lastChapterId) || chapters[0];
  const index = chapters.findIndex((item) => item.id === chapter.id);
  const completed = state.completedChapters.includes(chapter.id);
  const bookmarked = state.bookmarkedTopics.includes(chapter.id);
  const chapterQuestions = questionsData.questions.filter((question) => question.chapterId === chapter.id);
  
  const verification = chapter.verification?.length
    ? `<div class="callout"><strong>Verify before relying on this</strong>${chapter.verification.map(escapeHtml).join("<br>")}</div>`
    : "";

  const sectionsHtml = chapter.sections?.length
    ? chapter.sections.map(renderSection).join("")
    : "";

  const topicsHtml = chapter.topics?.length
    ? `<section><h3>Study Topics</h3><div class="topics-list">${chapter.topics.map((topic) => {
        // Handle both old format (string) and new format (object with title and content)
        if (typeof topic === 'string') {
          return `<div class="topic-item"><h4>${escapeHtml(topic)}</h4></div>`;
        } else {
          return `<div class="topic-item"><h4>${escapeHtml(topic.title)}</h4>${topic.content ? `<p>${escapeHtml(topic.content)}</p>` : ''}</div>`;
        }
      }).join("")}</div></section>`
    : "";

  const keyConcepts = chapter.keyConcepts?.length
    ? `<section><h3>Key concepts</h3><ul>${chapter.keyConcepts.map((text) => `<li>${escapeHtml(text)}</li>`).join("")}</ul></section>`
    : "";

  const example = chapter.example
    ? `<section><h3>Practical example</h3><p>${escapeHtml(chapter.example)}</p></section>`
    : "";

  const examNotes = chapter.examNotes?.length
    ? `<section><h3>Important exam notes</h3><ul>${chapter.examNotes.map((text) => `<li>${escapeHtml(text)}</li>`).join("")}</ul></section>`
    : "";

  const summary = chapter.summary
    ? `<section><h3>Chapter summary</h3><p>${escapeHtml(chapter.summary)}</p></section>`
    : "";

  const certCode = certName || chaptersData.certificationId?.toUpperCase() || "CERT";
  const completionPercentage = Math.round((state.completedChapters.length / chapters.length) * 100);
  
  return `
    <div class="page-heading">
      <div>
        <p class="eyebrow">${certCode}</p>
        <h1>📚 Study Material</h1>
        <p><strong>${chapter.title}</strong> • Chapter ${index + 1} of ${chapters.length} ${completed ? '✓ Completed' : ''}</p>
      </div>
      <div class="heading-actions">
        <span class="badge">${chapters.length} chapters</span>
        <span class="badge">Chapter ${index + 1}</span>
        ${verification ? '<span class="badge verify">Verify details</span>' : ""}
      </div>
    </div>
    <div class="study-layout">
      <aside class="toc" aria-label="Chapter table of contents">
        <h3>All chapters</h3>
        ${chapters.map((item) => `<button class="${item.id === chapter.id ? "active" : ""} ${state.completedChapters.includes(item.id) ? "completed" : ""}" data-action="open-chapter" data-chapter-id="${escapeHtml(item.id)}" title="${state.completedChapters.includes(item.id) ? '✓ Completed' : 'Not started'}">${escapeHtml(item.title)}${state.completedChapters.includes(item.id) ? ' ✓' : ''}</button>`).join("")}
      </aside>
      <article class="chapter-card">
        <div class="chapter-heading">
          <div>
            <p class="eyebrow">Chapter ${index + 1} · ${chapter.weight}% exam weight</p>
            <h2>${escapeHtml(chapter.title)}</h2>
            <p class="domain-label">${escapeHtml(chapter.domain)}</p>
          </div>
          <div class="chapter-actions">
            <button class="icon-button ${bookmarked ? "selected" : ""}" data-action="bookmark" data-chapter-id="${escapeHtml(chapter.id)}" aria-label="${bookmarked ? "Remove bookmark" : "Bookmark chapter"}" title="${bookmarked ? "Remove bookmark" : "Bookmark chapter"}">★</button>
            <button class="button ${completed ? "" : "primary"}" data-action="complete-chapter" data-chapter-id="${escapeHtml(chapter.id)}">${completed ? "✓ Completed" : "Mark complete"}</button>
          </div>
        </div>
        <div class="chapter-content">
          <section><h3>Overview</h3><p>${escapeHtml(chapter.overview)}</p></section>
          ${sectionsHtml}
          ${topicsHtml}
          ${keyConcepts}
          ${example}
          ${examNotes}
          ${verification}
          ${summary}
          <section><h3>Practice questions</h3><p><strong>${chapterQuestions.length}</strong> practice question${chapterQuestions.length === 1 ? "" : "s"} available for this chapter.</p><button class="button primary" data-action="chapter-quiz" data-chapter-id="${escapeHtml(chapter.id)}">📝 Practice this chapter</button></section>
        </div>
        <div class="chapter-footer">
          <button class="button" data-action="previous-chapter" ${index === 0 ? "disabled" : ""}>← Previous chapter</button>
          <span class="chapter-counter">${index + 1} / ${chapters.length}</span>
          <button class="button" data-action="next-chapter" ${index === chapters.length - 1 ? "disabled" : ""}>Next chapter →</button>
        </div>
      </article>
    </div>`;
}
