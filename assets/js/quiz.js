import { escapeHtml } from "./study.js";

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

export function createQuizSession(questions, { mode = "learning", kind = "practice", durationMinutes = null } = {}) {
  if (!questions.length) throw new Error("There are no questions available for this session.");
  return {
    questions: shuffle(questions).map((question) => ({ ...question, options: shuffle(question.options) })),
    mode,
    kind,
    index: 0,
    answers: {},
    feedback: {},
    flagged: [],
    startedAt: Date.now(),
    durationSeconds: durationMinutes ? durationMinutes * 60 : null,
    completed: false
  };
}

export function selectedAnswer(session, question) {
  return session.answers[question.id] || [];
}

export function setAnswer(session, optionId) {
  const question = session.questions[session.index];
  const selected = new Set(selectedAnswer(session, question));
  if (question.type === "multi") {
    selected.has(optionId) ? selected.delete(optionId) : selected.add(optionId);
  } else {
    selected.clear();
    selected.add(optionId);
  }
  session.answers[question.id] = [...selected];
}

export function submitCurrentAnswer(session) {
  const question = session.questions[session.index];
  if (!selectedAnswer(session, question).length) return false;
  const selected = new Set(selectedAnswer(session, question));
  const correct = new Set(question.correctAnswers);
  session.feedback[question.id] = selected.size === correct.size && [...selected].every((id) => correct.has(id));
  return true;
}

function isCorrect(question, selected) {
  const picked = new Set(selected);
  const correct = new Set(question.correctAnswers);
  return picked.size === correct.size && [...picked].every((id) => correct.has(id));
}

export function buildResult(session, exam) {
  const answers = session.questions.map((question) => {
    const selected = selectedAnswer(session, question);
    return {
      questionId: question.id,
      question: question.question,
      domainId: question.domainId,
      topic: question.topic,
      selected,
      correctAnswers: question.correctAnswers,
      isCorrect: selected.length > 0 && isCorrect(question, selected),
      explanation: question.explanation,
      options: question.options,
      incorrectExplanations: question.incorrectExplanations
    };
  });
  const correct = answers.filter((answer) => answer.isCorrect).length;
  const unanswered = answers.filter((answer) => !answer.selected.length).length;
  const total = answers.length;
  const domainScores = exam.domains.map((domain) => {
    const items = answers.filter((answer) => answer.domainId === domain.id);
    return {
      domainId: domain.id,
      name: domain.name,
      correct: items.filter((answer) => answer.isCorrect).length,
      total: items.length,
      percentage: items.length ? Math.round((items.filter((answer) => answer.isCorrect).length / items.length) * 100) : 0
    };
  }).filter((domain) => domain.total);
  const elapsedSeconds = Math.max(0, Math.round((Date.now() - session.startedAt) / 1000));
  const percentage = total ? Math.round((correct / total) * 100) : 0;
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label: session.kind === "mock" ? "Sample mock examination" : "Practice test",
    mode: session.mode === "exam" ? "Exam mode" : "Learning mode",
    kind: session.kind,
    total,
    correct,
    incorrect: total - correct - unanswered,
    unanswered,
    percentage,
    threshold: exam.passingThreshold,
    passed: percentage >= exam.passingThreshold * 100,
    elapsedSeconds,
    completedAt: new Date().toISOString(),
    domainScores,
    answers
  };
}

function timeText(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = Math.max(0, seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

function renderFeedback(question, correct) {
  const incorrect = question.options.filter((option) => !question.correctAnswers.includes(option.id));
  return `<div class="quiz-feedback ${correct ? "correct" : "incorrect"}">
    <strong>${correct ? "Correct" : "Not quite"}${question.verification ? " · Verify this item" : ""}</strong>
    ${escapeHtml(question.explanation)}
    ${incorrect.map((option) => {
      const letter = option.id.replace(/^opt-/, '').toUpperCase();
      return question.incorrectExplanations?.[option.id] ? `<p><b>${escapeHtml(letter)}.</b> ${escapeHtml(question.incorrectExplanations[option.id])}</p>` : "";
    }).join("")}
    ${question.verification ? `<p><b>Source note:</b> ${escapeHtml(question.verification)}</p>` : ""}
    <p><b>Study reference:</b> ${escapeHtml(question.chapterId)}</p>
  </div>`;
}

export function renderQuiz(session) {
  const question = session.questions[session.index];
  const selected = new Set(selectedAnswer(session, question));
  const wasAnswered = Object.prototype.hasOwnProperty.call(session.feedback, question.id);
  const correct = session.feedback[question.id];
  const doneCount = Object.keys(session.answers).filter((id) => session.answers[id]?.length).length;
  const examMode = session.mode === "exam";
  return `
    <div class="quiz-layout">
      <div class="page-heading">
        <div><p class="eyebrow">${session.kind === "mock" ? "Sample mock examination" : "Practice test"} · ${examMode ? "Exam mode" : "Learning mode"}</p><h1>${session.kind === "mock" ? "Timed practice" : "Question practice"}</h1>
          <p>${session.questions.length} questions · ${examMode ? "Answers and explanations appear after submission." : "Check explanations as you go."}</p>
        </div>
        ${session.durationSeconds ? `<div class="exam-timer" id="exam-timer" data-duration="${session.durationSeconds}" aria-live="polite">--:--</div>` : ""}
      </div>
      <div class="quiz-topline"><span>Question ${session.index + 1} of ${session.questions.length}</span><span>${doneCount} answered · ${session.flagged.length} flagged</span></div>
      <div class="progress-track"><span style="width:${Math.round(((session.index + 1) / session.questions.length) * 100)}%"></span></div>
      <article class="question-card quiz-card">
        <p class="question-domain">${escapeHtml(question.topic)} · ${question.type === "multi" ? "Select all that apply" : "Single answer"}</p>
        <h2>${escapeHtml(question.question)}</h2>
        <div class="option-list">${[...question.options].sort((a, b) => a.id.localeCompare(b.id)).map((option) => {
          let status = selected.has(option.id) ? "selected" : "";
          if (wasAnswered && !examMode) {
            if (question.correctAnswers.includes(option.id)) status += " correct";
            else if (selected.has(option.id)) status += " incorrect";
          }
          const letter = option.id.replace(/^opt-/, '').toUpperCase();
          return `<button class="answer-option ${status}" data-action="answer" data-option-id="${escapeHtml(option.id)}" ${wasAnswered && !examMode ? "disabled" : ""}><span class="option-letter">${escapeHtml(letter)}</span><span>${escapeHtml(option.text)}</span></button>`;
        }).join("")}</div>
        ${wasAnswered && !examMode ? renderFeedback(question, correct) : ""}
        ${examMode && session.flagged.includes(question.id) ? `<div class="callout info">Flagged for review before submission.</div>` : ""}
      </article>
      <div class="quiz-controls">
        <div class="quiz-controls-left">
          <button class="button" data-action="quiz-previous" ${session.index === 0 ? "disabled" : ""}>← Previous</button>
          <button class="button" data-action="flag-question">${session.flagged.includes(question.id) ? "⚑ Flagged" : "⚐ Flag for review"}</button>
        </div>
        <div class="quiz-controls-right">
          ${!examMode && !wasAnswered ? `<button class="button" data-action="submit-answer" ${selected.size ? "" : "disabled"}>Submit answer</button>` : ""}
          ${session.index < session.questions.length - 1 ? `<button class="button primary" data-action="quiz-next">${wasAnswered || examMode ? "Next question" : "Skip for now"} →</button>` : ""}
          <button class="button ${examMode ? "primary" : ""}" data-action="finish-quiz">Submit test</button>
        </div>
      </div>
      ${session.kind === "mock" ? `<p class="muted center" style="margin-top:14px;font-size:10px">This is a ${session.questions.length}-question sample mock using the supplied guide's approximate two-minutes-per-question pacing. It is not a full-length exam simulation.</p>` : ""}
    </div>`;
}

export function renderResult(result, exam) {
  const minutes = Math.floor(result.elapsedSeconds / 60);
  const seconds = result.elapsedSeconds % 60;
  return `
    <div class="quiz-layout">
      <div class="page-heading"><div><p class="eyebrow">Session complete</p><h1>Your results</h1><p>${escapeHtml(result.label)} · ${escapeHtml(result.mode)}</p></div><button class="button" data-action="return-dashboard">Dashboard</button></div>
      <section class="panel center">
        <div class="result-score"><strong>${result.percentage}%</strong><span>score</span></div>
        <h2>${result.passed ? "Practice threshold met" : "Keep building your confidence"}</h2>
        <p class="subheading">Configured practice threshold: ${Math.round(exam.passingThreshold * 100)}% <span class="badge verify">Source guide marks this threshold for verification</span></p>
        <div class="results-summary">
          <div class="result-mini"><strong>${result.total}</strong><span>Total questions</span></div>
          <div class="result-mini"><strong>${result.correct}</strong><span>Correct</span></div>
          <div class="result-mini"><strong>${result.incorrect}</strong><span>Incorrect</span></div>
          <div class="result-mini"><strong>${result.unanswered}</strong><span>Unanswered</span></div>
        </div>
        <p class="muted" style="font-size:11px">Time taken: ${minutes}m ${seconds.toString().padStart(2, "0")}s</p>
      </section>
      <div class="section-title"><h2>Domain-wise performance</h2><span>Based on this session</span></div>
      <section class="panel">${result.domainScores.map((domain) => `<div class="domain-row"><span>${escapeHtml(domain.name)}</span><div class="progress-track"><span style="width:${domain.percentage}%"></span></div><strong>${domain.correct}/${domain.total}</strong></div>`).join("")}</section>
      <div class="section-title"><h2>Review answers</h2><span>${result.answers.length} questions</span></div>
      <div class="activity-list">${result.answers.map((answer, index) => {
        const chosen = new Set(answer.selected);
        const correct = new Set(answer.correctAnswers);
        const selectedLetters = answer.selected.map(id => id.replace(/^opt-/, '').toUpperCase()).join(", ");
        const correctLetters = answer.correctAnswers.map(id => id.replace(/^opt-/, '').toUpperCase()).join(", ");
        return `<details class="review-item"><summary>${index + 1}. ${escapeHtml(answer.question)} <span class="badge ${answer.isCorrect ? "ready" : answer.selected.length ? "verify" : ""}">${answer.isCorrect ? "Correct" : answer.selected.length ? "Incorrect" : "Unanswered"}</span></summary>
          <p><b>Your answer:</b> ${answer.selected.length ? escapeHtml(selectedLetters) : "No answer selected"}</p>
          <p><b>Correct answer:</b> ${escapeHtml(correctLetters)}</p>
          <p>${escapeHtml(answer.explanation)}</p>
          ${answer.options.filter((option) => !correct.has(option.id)).map((option) => {
            const letter = option.id.replace(/^opt-/, '').toUpperCase();
            return answer.incorrectExplanations?.[option.id] ? `<p><b>${escapeHtml(letter)}. ${escapeHtml(option.text)}</b> — ${escapeHtml(answer.incorrectExplanations[option.id])}</p>` : "";
          }).join("")}
          <p class="muted">Study chapter: ${escapeHtml(answer.topic)}</p>
        </details>`;
      }).join("")}</div>
      <div class="quiz-controls"><div class="quiz-controls-left"><button class="button" data-action="retry-incorrect" ${result.incorrect ? "" : "disabled"}>Retry incorrect</button><button class="button" data-action="retry-unanswered" ${result.unanswered ? "" : "disabled"}>Retry unanswered</button></div><div class="quiz-controls-right"><button class="button primary" data-action="start-practice">Retry all questions</button></div></div>
    </div>`;
}
