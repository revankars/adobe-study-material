import { createInitialState, loadProgress, saveProgress, downloadProgress, validateImportedProgress } from "./storage.js";
import { renderDashboard, populateCertificationCounts } from "./dashboard.js";
import { escapeHtml } from "./study.js";
import { loadJson } from "./data.js";
import { createQuizSession, selectedAnswer, setAnswer, submitCurrentAnswer, buildResult, renderQuiz, renderResult } from "./quiz.js";
import { renderPracticeTestsSelection } from "./practice-tests.js";
import { renderMockTestsSelection } from "./mock-tests.js";
import { renderStudyMaterialSelection } from "./study-selection.js";
import { renderQuickRevisionSelection, renderQuickRevisionSummary } from "./quick-revision.js";

let state = createInitialState();
let certifications = [];
let exam = null;
let chapters = null;
let questions = null;
let currentQuizSession = null;
let currentCertificationId = "ad0-e409";
let currentChapterId = null; // Track which chapter/section is selected
let currentTopicId = null; // Track which topic is being viewed
let quickRevisionByCert = {}; // Summaries from data/<cert>/quick-revision.json
let loadedCertsData = {}; // Cache loaded cert data: { "ad0-e409": {chapters, questions, exam}, ... }
let currentStudyMaterialHtml = null; // Cache loaded study material HTML
let currentStudyViewingCertId = null; // Track which certification's study material is being viewed

function showToast(message, duration = 3000) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("visible");
  setTimeout(() => toast.classList.remove("visible"), duration);
}

function getContentElement() {
  return document.getElementById("app-content");
}

function setSectionName(name) {
  document.getElementById("current-section").textContent = name;
}

async function loadData() {
  try {
    certifications = await loadJson("data/certifications.json");
    console.log("Certifications loaded:", certifications.map(c => c.id));
    
    // Load all certifications' data in parallel
    const loadPromises = certifications
      .filter(cert => cert.contentAvailable)
      .map(cert => {
        console.log("Loading certification:", cert.id);
        return loadCertification(cert.id).catch(err => {
          console.error("Failed to load " + cert.id + ":", err);
        });
      });
    
    await Promise.all(loadPromises);
    console.log("All certifications loaded");
    
    // Set current to ad0-e409 AFTER all loads complete
    console.log("Setting default to ad0-e409");
    await loadCertification("ad0-e409");
    console.log("Default certification loaded, exam:", exam?.name, "chapters:", chapters?.chapters?.length);
  } catch (error) {
    console.error("Error loading data:", error);
    showToast("Could not load study materials. Check the browser console.");
  }
}


async function loadCertification(certId) {
  try {
    console.log("loadCertification called for:", certId);
    const cert = certifications.find((c) => c.id === certId);
    if (!cert) {
      console.error("Certification not found:", certId);
      return;
    }
    if (!cert.contentAvailable) {
      console.log("Content not available for:", certId);
      exam = null;
      chapters = null;
      questions = null;
      return;
    }
    currentCertificationId = certId;
    try {
      quickRevisionByCert[certId] = await loadJson(`data/${certId}/quick-revision.json`);
    } catch (error) {
      console.warn("No quick revision summary for", certId);
    }
    console.log("Fetching data from:", cert.examFile, cert.chaptersFile, cert.questionsFile);
    const [examData, chaptersData, questionsData] = await Promise.all([
      loadJson(cert.examFile),
      loadJson(cert.chaptersFile),
      loadJson(cert.questionsFile),
    ]);
    examData.certificationId = certId; // Store certification ID for dashboard reference
    
    console.log("Loaded exam:", examData.name, "chapters:", chaptersData.chapters?.length, "questions:", questionsData.questions?.length);
    
    // Update globals for immediate use
    exam = examData;
    chapters = chaptersData;
    questions = questionsData;
    
    // Cache the loaded data for this certification (store copies to avoid reference issues)
    loadedCertsData[certId] = { exam: examData, chapters: chaptersData, questions: questionsData };
    
    // Reset to first chapter when loading new certification
    state.lastChapterId = chaptersData.chapters[0]?.id || null;
    console.log("loadCertification complete for:", certId, "first chapter:", state.lastChapterId);
  } catch (error) {
    console.error("Error loading certification " + certId + ":", error);
    exam = null;
    chapters = null;
    questions = null;
  }
}


async function viewDashboard() {
  setSectionName("Dashboard");
  if (!exam || !chapters || !questions) {
    getContentElement().innerHTML = `<div class="empty-state"><strong>Study materials not loaded</strong><p>Check the browser console for errors.</p></div>`;
    return;
  }
  getContentElement().innerHTML = renderDashboard(certifications, chapters, questions, state, exam);
  attachEventListeners();
  await populateCertificationCounts(certifications);
}

function viewStudy() {
  setSectionName("Study material");
  // Show study material selection (card-based view)
  viewStudyMaterialSelection();
}

function viewStudyMaterialSelection() {
  setSectionName("Study material");
  document.body.classList.remove('viewing-study-material');
  const content = renderStudyMaterialSelection(certifications);
  getContentElement().innerHTML = content;
  attachEventListeners();
}

async function viewStudyMaterial(certId) {
  setSectionName("Study material");
  openStudyGuide(certId, null, "study");
}

// Shows a complete study guide in its own frame. An anchor opens that section directly.
// "from" decides where the back button goes: the study subjects or quick revision.
function openStudyGuide(certId, anchor, from) {
  const studyGuideFiles = {
    "ad0-e207": "Complete_Study_Guide_AD0-E207.html",
    "ad0-e408": "Complete_Study_Guide_AD0-E408.html",
    "ad0-e409": "Complete_Study_Guide_AD0-E409.html",
    "ad0-e607": "Complete_Study_Guide_AD0-E607.html",
  };
  const filename = studyGuideFiles[certId];
  if (!filename) {
    getContentElement().innerHTML = `<div class="empty-state"><strong>Study material not available</strong><p>No study guide found for this certification.</p></div>`;
    return;
  }
  const cert = certifications.find((c) => c.id === certId);
  const title = escapeHtml(cert ? cert.name : certId);
  const src = anchor ? `${filename}#${encodeURIComponent(anchor)}` : filename;
  const back = from === "revision"
    ? `<button class="btn-back-to-subjects" data-action="start-revision" data-cert-id="${escapeHtml(certId)}">← Quick revision</button>`
    : `<button class="btn-back-to-subjects" data-action="view-study-selection">← Study subjects</button>`;
  currentStudyViewingCertId = certId;
  document.body.classList.add("viewing-study-material");
  // Each guide is shown in its own frame so its styles and scripts cannot affect the portal.
  getContentElement().innerHTML = `
    <div class="study-frame-wrap">
      <div class="study-frame-bar">
        ${back}
        <span class="study-frame-title">${title} study guide</span>
        <a class="study-frame-open" href="${filename}" target="_blank" rel="noopener">Open in new tab ↗</a>
      </div>
      <iframe class="study-frame" src="${src}" title="${title} study guide"></iframe>
    </div>`;
}

function viewPracticeSelection() {
  setSectionName("Practice tests");
  const content = renderPracticeTestsSelection(certifications);
  getContentElement().innerHTML = content;
  
  // Add event listeners for starting tests
  document.querySelectorAll('.btn-start-test:not(:disabled)').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const certId = e.currentTarget.dataset.certId;
      startPracticeTestForCertification(certId);
    });
  });
}

function startPracticeTestForCertification(certId) {
  // Load the certification data if not already loaded
  if (loadedCertsData[certId]?.questions) {
    const certQuestions = loadedCertsData[certId].questions;
    
    // Handle both structures:
    // 1. Object with 'questions' property: { questions: [...] }
    // 2. Direct array: [...]
    let questionsArray;
    if (Array.isArray(certQuestions)) {
      questionsArray = certQuestions;
    } else if (certQuestions.questions && Array.isArray(certQuestions.questions)) {
      questionsArray = certQuestions.questions;
    }
    
    if (questionsArray && questionsArray.length) {
      currentQuizSession = createQuizSession(questionsArray, { mode: "learning", kind: "practice" });
      renderQuizQuestion();
      return;
    }
  }
  showToast("No practice questions available for this certification yet");
}

function viewPractice() {
  setSectionName("Practice tests");
  viewPracticeSelection();
}

function viewMockSelection() {
  setSectionName("Mock examinations");
  const content = renderMockTestsSelection(certifications);
  getContentElement().innerHTML = content;
  
  // Add event listeners for starting tests
  document.querySelectorAll('.btn-start-mock:not(:disabled)').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const certId = e.currentTarget.dataset.certId;
      startMockTestForCertification(certId);
    });
  });
}

function startMockTestForCertification(certId) {
  // Load the certification data if not already loaded
  if (loadedCertsData[certId]?.questions && loadedCertsData[certId]?.exam) {
    const certQuestions = loadedCertsData[certId].questions;
    const certExam = loadedCertsData[certId].exam;
    
    // Handle both structures:
    // 1. Object with 'questions' property: { questions: [...] }
    // 2. Direct array: [...]
    let questionsArray;
    if (Array.isArray(certQuestions)) {
      questionsArray = certQuestions;
    } else if (certQuestions.questions && Array.isArray(certQuestions.questions)) {
      questionsArray = certQuestions.questions;
    }
    
    if (questionsArray && questionsArray.length) {
      // For mock tests, use the total time limit from exam specifications
      // If not available, calculate as number of questions * 100 seconds / 60 to get minutes
      const durationMinutes = certExam.specifications?.timeLimit || 
                             Math.ceil((questionsArray.length * 100) / 60);
      
      currentQuizSession = createQuizSession(questionsArray, {
        mode: "exam",
        kind: "mock",
        durationMinutes: durationMinutes
      });
      renderQuizQuestion();
      startMockTimer();
      return;
    }
  }
  showToast("No mock exam available for this certification yet");
}

function viewMock() {
  setSectionName("Mock examinations");
  viewMockSelection();
}

function viewQuickRevisionForCertification(certId) {
  const cert = certifications.find((c) => c.id === certId);
  const summary = quickRevisionByCert[certId];
  if (!cert || !summary) {
    showToast("No quick revision available for this certification yet");
    return;
  }
  setSectionName("Quick revision");
  getContentElement().innerHTML = renderQuickRevisionSummary(cert, summary);
}

function viewRevision() {
  setSectionName("Quick revision");
  const content = renderQuickRevisionSelection(certifications, quickRevisionByCert);
  getContentElement().innerHTML = content;
  
  // Add event listeners for starting quick revision
  document.querySelectorAll('.btn-start-revision:not(:disabled)').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const certId = e.currentTarget.dataset.certId;
      viewQuickRevisionForCertification(certId);
    });
  });
}

function renderQuizQuestion() {
  setSectionName(currentQuizSession.kind === "mock" ? "Mock examination" : "Practice tests");
  getContentElement().innerHTML = renderQuiz(currentQuizSession);
  attachEventListeners();
}

function startMockTimer() {
  setTimeout(() => {
    const timerEl = document.getElementById("exam-timer");
    if (!timerEl || !currentQuizSession) return;
    let remaining = currentQuizSession.durationSeconds;
    const tick = () => {
      remaining -= 1;
      const minutes = Math.floor(remaining / 60).toString().padStart(2, "0");
      const seconds = Math.max(0, remaining % 60).toString().padStart(2, "0");
      timerEl.textContent = `${minutes}:${seconds}`;
      if (remaining <= 60) timerEl.classList.add("warning");
      if (remaining > 0) setTimeout(tick, 1000);
      else finishQuiz();
    };
    tick();
  }, 0);
}

function renderQuizResult() {
  setSectionName(currentQuizSession.kind === "mock" ? "Mock examination" : "Practice tests");
  const result = buildResult(currentQuizSession, exam);
  state.results.push(result);
  state.recentActivity.unshift({
    label: result.label,
    detail: `${result.correct} correct of ${result.total}`,
    date: new Date().toLocaleDateString()
  });
  saveProgress(state);
  getContentElement().innerHTML = renderResult(result, exam);
  attachEventListeners();
}

function finishQuiz() {
  currentQuizSession.completed = true;
  renderQuizResult();
}

// Event handling is delegated from the document and set up once at startup.
// Re-rendering a view therefore never adds duplicate listeners.
function attachEventListeners() {}

function handleView(view) {
  document.querySelectorAll("[data-view]").forEach((b) => b.classList.toggle("active", b.getAttribute("data-view") === view));
  document.querySelector(".sidebar")?.classList.remove("open");
  switch (view) {
    case "dashboard": viewDashboard(); break;
    case "study": viewStudy(); break;
    case "practice": viewPractice(); break;
    case "mock": viewMock(); break;
    case "revision": viewRevision(); break;
  }
}

function initEventHandling() {
  document.addEventListener("click", (event) => {
    const viewEl = event.target.closest("[data-view]");
    if (viewEl) {
      event.preventDefault();
      handleView(viewEl.getAttribute("data-view"));
      return;
    }
    const actionEl = event.target.closest("[data-action]");
    if (actionEl) {
      event.preventDefault();
      handleAction({ currentTarget: actionEl });
      return;
    }
    if (event.target.closest('a[href^="#"]')) event.preventDefault();
  });
  document.getElementById("global-search")?.addEventListener("keyup", (event) => {
    if (event.key === "Enter" || event.target.value.length > 0) performSearch(event.target.value);
  });
}

function handleAction(event) {
  const action = event.currentTarget.getAttribute("data-action");
  const chapterId = event.currentTarget.getAttribute("data-chapter-id");
  const optionId = event.currentTarget.getAttribute("data-option-id");
  const questionId = event.currentTarget.getAttribute("data-question-id");

  switch (action) {
    case "menu":
      document.getElementById("sidebar").classList.toggle("open");
      break;

    case "open-study":
      viewStudy();
      document.querySelector('[data-view="study"]').classList.add("active");
      document.querySelectorAll("[data-view]").forEach((btn) => {
        if (btn.getAttribute("data-view") !== "study") btn.classList.remove("active");
      });
      break;

    case "open-chapter":
      if (chapterId) {
        state.lastChapterId = chapterId;
        saveProgress(state);
        // Switch to study tab
        document.querySelectorAll("[data-view]").forEach((btn) => btn.classList.remove("active"));
        document.querySelector('[data-view="study"]').classList.add("active");
        viewStudy();
      }
      break;

    case "bookmark":
      if (chapterId) {
        const bookmarks = state.bookmarkedTopics;
        const index = bookmarks.indexOf(chapterId);
        if (index > -1) bookmarks.splice(index, 1);
        else bookmarks.push(chapterId);
        saveProgress(state);
        event.currentTarget.classList.toggle("selected");
      }
      break;

    case "complete-chapter":
      if (chapterId) {
        if (!state.completedChapters.includes(chapterId)) {
          state.completedChapters.push(chapterId);
          state.recentActivity.unshift({
            label: `Completed chapter`,
            detail: chapterId,
            date: new Date().toLocaleDateString()
          });
        }
        saveProgress(state);
        event.currentTarget.textContent = "Completed ✓";
        event.currentTarget.disabled = true;
      }
      break;

    case "chapter-quiz":
      if (chapterId && questions) {
        const relatedQuestions = questions.questions.filter((q) => q.chapterId === chapterId);
        if (relatedQuestions.length) {
          // Switch to practice tab
          document.querySelectorAll("[data-view]").forEach((btn) => btn.classList.remove("active"));
          document.querySelector('[data-view="practice"]').classList.add("active");
          currentQuizSession = createQuizSession(relatedQuestions, { mode: "learning", kind: "practice" });
          renderQuizQuestion();
        }
      }
      break;

    case "previous-chapter":
    case "next-chapter":
      if (chapters) {
        const idx = chapters.chapters.findIndex((ch) => ch.id === state.lastChapterId);
        const delta = action === "next-chapter" ? 1 : -1;
        const nextId = chapters.chapters[idx + delta]?.id;
        if (nextId) {
          state.lastChapterId = nextId;
          saveProgress(state);
          viewStudy();
        }
      }
      break;

    case "answer":
      if (optionId && currentQuizSession) {
        setAnswer(currentQuizSession, optionId);
        renderQuizQuestion();
      }
      break;

    case "submit-answer":
      if (currentQuizSession) {
        if (submitCurrentAnswer(currentQuizSession)) {
          renderQuizQuestion();
        }
      }
      break;

    case "quiz-previous":
    case "quiz-next":
      if (currentQuizSession) {
        const delta = action === "quiz-next" ? 1 : -1;
        currentQuizSession.index = Math.max(0, Math.min(currentQuizSession.questions.length - 1, currentQuizSession.index + delta));
        renderQuizQuestion();
      }
      break;

    case "flag-question":
      if (currentQuizSession) {
        const qid = currentQuizSession.questions[currentQuizSession.index].id;
        const idx = currentQuizSession.flagged.indexOf(qid);
        if (idx > -1) currentQuizSession.flagged.splice(idx, 1);
        else currentQuizSession.flagged.push(qid);
        renderQuizQuestion();
      }
      break;

    case "finish-quiz":
      if (currentQuizSession) finishQuiz();
      break;

    case "retry-incorrect":
      if (currentQuizSession) {
        const incorrect = currentQuizSession.questions.filter(
          (q) => !selectedAnswer(currentQuizSession, q).length || currentQuizSession.feedback[q.id] === false
        );
        if (incorrect.length) {
          currentQuizSession = createQuizSession(incorrect, currentQuizSession);
          renderQuizQuestion();
        }
      }
      break;

    case "retry-unanswered":
      if (currentQuizSession) {
        const unanswered = currentQuizSession.questions.filter((q) => !selectedAnswer(currentQuizSession, q).length);
        if (unanswered.length) {
          currentQuizSession = createQuizSession(unanswered, currentQuizSession);
          renderQuizQuestion();
        }
      }
      break;

    case "start-practice":
      const practCertId = event.currentTarget.getAttribute("data-cert-id");
      if (practCertId) {
        startPracticeTestForCertification(practCertId);
      } else {
        viewPractice();
      }
      break;

    case "start-mock":
      const mockCertId = event.currentTarget.getAttribute("data-cert-id");
      if (mockCertId) {
        startMockTestForCertification(mockCertId);
      } else {
        viewMock();
      }
      break;

    case "open-study-section": {
      const sectionCertId = event.currentTarget.getAttribute("data-cert-id");
      const anchor = event.currentTarget.getAttribute("data-anchor");
      setSectionName("Quick revision");
      openStudyGuide(sectionCertId, anchor, "revision");
      break;
    }

    case "view-revision-selection":
      viewRevision();
      break;

    case "start-revision":
      const revCertId = event.currentTarget.getAttribute("data-cert-id");
      if (revCertId) {
        viewQuickRevisionForCertification(revCertId);
      } else {
        viewRevision();
      }
      break;

    case "return-dashboard":
      document.querySelectorAll("[data-view]").forEach((btn) => btn.classList.remove("active"));
      document.querySelector('[data-view="dashboard"]').classList.add("active");
      viewDashboard();
      break;

    case "return-to-revision":
      viewRevision();
      break;

    case "export":
      downloadProgress(state);
      showToast("Progress exported successfully");
      break;

    case "import":
      document.getElementById("import-file").click();
      break;

    case "reset":
      if (confirm("Reset all learning progress? This cannot be undone.")) {
        state = createInitialState();
        saveProgress(state);
        viewDashboard();
        showToast("Progress reset");
      }
      break;

    case "load-certification":
      const certId = event.currentTarget.getAttribute("data-cert-id");
      if (certId) {
        loadCertification(certId).then(() => {
          currentTopicId = null; // Reset topic view
          viewStudy();
          document.querySelector('[data-view="study"]').classList.add("active");
          document.querySelectorAll("[data-view]").forEach((btn) => {
            if (btn.getAttribute("data-view") !== "study") btn.classList.remove("active");
          });
          showToast(`Loaded ${certifications.find(c => c.id === certId)?.name}`);
        });
      }
      break;

    case "switch-cert":
      const switchCertId = event.currentTarget.getAttribute("data-cert-id");
      if (switchCertId) {
        currentCertificationId = switchCertId;
        currentChapterId = null;
        currentTopicId = null;
        loadCertification(switchCertId).then(() => {
          viewStudy();
          showToast(`Switched to ${certifications.find(c => c.id === switchCertId)?.name}`);
        });
      }
      break;

    case "switch-chapter":
      const switchChapterId = event.currentTarget.getAttribute("data-chapter-id");
      if (switchChapterId) {
        currentChapterId = switchChapterId;
        currentTopicId = null;
        viewStudy();
      }
      break;

    case "open-topic":
      const topicId = event.currentTarget.getAttribute("data-topic-id");
      if (topicId) {
        currentTopicId = topicId;
        viewStudy();
      }
      break;

    case "back-to-topics":
      currentTopicId = null;
      viewStudy();
      break;

    case "change-chapter":
      if (chapterId) {
        state.lastChapterId = chapterId;
        currentTopicId = null;
        saveProgress(state);
        viewStudy();
      }
      break;

    case "previous-topic":
      const prevTopicIndex = Math.max(0, parseInt(event.currentTarget.getAttribute("data-topic-index")) - 1);
      currentTopicId = `topic-${prevTopicIndex}`;
      viewStudy();
      break;

    case "next-topic":
      const nextTopicIndex = parseInt(event.currentTarget.getAttribute("data-topic-index")) + 1;
      currentTopicId = `topic-${nextTopicIndex}`;
      viewStudy();
      break;

    case "course-unavailable":
      showToast("Study materials for this course are not yet available");
      break;

    case "view-study-selection":
      viewStudyMaterialSelection();
      break;

    case "open-study-material":
      const studyCertId = event.currentTarget.getAttribute("data-cert-id");
      if (studyCertId) {
        viewStudyMaterial(studyCertId);
      }
      break;
  }
}

function performSearch(query) {
  if (!query.trim() || !chapters || !questions) return;
  const q = query.toLowerCase();
  const results = [];
  chapters.chapters.forEach((chapter) => {
    if (chapter.title.toLowerCase().includes(q) || chapter.overview?.toLowerCase().includes(q)) {
      results.push({ type: "chapter", chapter: chapter.title, text: chapter.overview || chapter.title, chapterId: chapter.id });
    }
    // Search topics too
    chapter.topics?.forEach((topic) => {
      if (typeof topic === 'string' && topic.toLowerCase().includes(q)) {
        results.push({ type: "chapter", chapter: chapter.title, text: topic, chapterId: chapter.id });
      } else if (typeof topic === 'object' && (topic.title.toLowerCase().includes(q) || topic.content.toLowerCase().includes(q))) {
        results.push({ type: "chapter", chapter: chapter.title, text: topic.title, chapterId: chapter.id });
      }
    });
  });
  questions.questions.forEach((question) => {
    if (question.question.toLowerCase().includes(q)) {
      results.push({ type: "question", chapter: question.topic, text: question.question, chapterId: question.chapterId, questionId: question.id });
    }
  });
  setSectionName(`Search: "${query}"`);
  getContentElement().innerHTML = `
    <div class="page-heading"><div><p class="eyebrow">Search results</p><h1>Found ${results.length} match${results.length === 1 ? "" : "es"}</h1></div></div>
    ${results.length ? `<div class="search-results">${results.map((result) => `<button class="search-result" data-action="${result.type === "chapter" ? "open-chapter" : "chapter-quiz"}" data-chapter-id="${result.chapterId}" ${result.questionId ? `data-question-id="${result.questionId}"` : ''}><div><strong>${result.chapter}</strong><p>${result.text.substring(0, 100)}…</p></div><small>${result.type}</small></button>`).join("")}</div>` : `<div class="empty-state"><strong>No results found</strong><p>Try different search terms or explore the study material.</p></div>`}`;
  attachEventListeners();
}

document.addEventListener("DOMContentLoaded", async () => {
  initEventHandling();
  try {
    state = loadProgress();
  } catch (error) {
    console.warn("Could not load progress:", error.message);
    state = createInitialState();
  }

  await loadData();

  document.getElementById("import-file").addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        state = validateImportedProgress(imported);
        saveProgress(state);
        viewDashboard();
        showToast("Progress restored successfully");
      } catch (error) {
        showToast("Could not import progress: " + error.message);
      }
    };
    reader.readAsText(file);
  });

  viewDashboard();
});
