# Standing instructions: adding a new certification subject to the Adobe Study Portal

Use these instructions whenever I provide a new subject (a study guide HTML, or study notes) and/or practice questions (HTML, PDF, Markdown, or screenshots). Do not ask me to repeat them.

## 0. Project location
- Portal root: `adobe-study-material/` (contains `index.html`, `assets/`, `data/`, `tools/`, `original-sources/`).
- Never delete existing content. Only add, or correct clearly wrong data, and say so in your report.
- Keep my original files in `original-sources/` (copy every uploaded source there).

## 1. Intake: identify everything first
Before changing anything, list:
- The certification code (for example AD0-E605). If the source does not state it, search Adobe's certification pages and confirm the code. Never guess.
- The official exam name, and any mismatch between the file title and the exam I named. Report mismatches; do not silently relabel.
- Every study section (headings h2/h3/h4) and every practice question, with its correct answer.
- Whether PDFs are image-only. If so, OCR them (pdftoppm + tesseract) and check the OCR against the page images.

## 2. Study guide
- Add the complete guide as `Complete_Study_Guide_<CODE>.html`. Keep every word of the original (compare word counts and headings before and after).
- Give every h3/h4 heading an id so quick-revision links work. Do not change visible text.
- Remove any link that points to a missing anchor. Replace it with the official Adobe URL if one exists; otherwise make it work or remove it. Report which.

## 3. Data files (`data/<code>/`)
Create:
- `exam.json`: name, code, domains/topics, exam facts (only from sources).
- `chapters.json`: one entry per study chapter with id, title, topics.
- `questions.json`: one entry per question with fields:
  `id`, `chapterId`, `domainId`, `topic`, `difficulty`, `type` (`single` or `multi`), `question`, `options` (`[{id, text}]`), `correctAnswers` (option ids), `explanation`, `incorrectExplanations`, `explanationSource`.
- `quick-revision.json`: built by `tools/build_quick_revision.py` (add the guide to its GUIDES map).

Rules for questions:
- Use the exact question wording and options from the source. If I reword a question, say so in the report.
- Set `type` to `multi` when there is more than one correct answer, and `single` otherwise.
- Every question needs at least 2 options, valid correct-answer ids, and a non-empty explanation. If the source gives no explanation, write "Answer key taken from <source>. The source gives no rationale."
- Remove exact duplicates (same stem and same options). For near-duplicates, keep the one with the better explanation and report the choice.
- If a question depends on an image I did not supply, say so and do not invent the missing options.
- If the source gives no correct answer, do not add the question to the graded set. List it in the report.

## 4. Register the certification (`data/certifications.json`)
Add an entry with: `id`, `name`, `code`, `description`, `contentAvailable: true`, `examFile`, `chaptersFile`, `questionsFile`, `icon`, `officialLinks` (only verified URLs).
Then run:
- `python3 tools/build_study_stats.py` (sets studyChapters and studyTopics from the guide)
- Update `questionCount` for every certification from its questions file.
- Do NOT add a question bank unless I ask for one.

## 5. App wiring (`assets/js/app.js`)
- Add the guide file name to the `studyGuideFiles` map.
- Add the guide to the GUIDES map in `tools/build_quick_revision.py` and `tools/build_study_stats.py`.
- Do not hard-code counts or titles. Cards must read from data.

## 6. Build
- `python3 tools/build_quick_revision.py`
- `python3 tools/build_bundle.py`
- `node --check assets/js/portal.bundle.js`

## 7. Verification (mandatory before reporting success)
Run all of these from a fresh unzip of the zip file, not the working folder:
1. Data: unique question ids, no duplicate stems, every correct answer exists in its options, type matches answer count, explanations present, questionCount matches the file, studyChapters and studyTopics set.
2. Links: every local href, src and anchor resolves. Report any external link that could not be checked.
3. Syntax: `node --check` on every JS file; `json.load` on every JSON file.
4. Study material: no "undefined", "NaN" or "[object" text on any screen or in any guide.
5. Practice: answer every question with its correct option(s) in a browser; the score must be 100% and every question must be seen exactly once.
6. Mock: "All available" must include every question.
7. Screens: dashboard shows the new card; study, practice, mock and revision sections open; search finds a term from the new guide and one from a new question; no page errors in the console.
8. Mobile: no horizontal overflow at 390px width.

If a check fails, fix it and re-run all checks. Do not report success until all checks pass.

## 8. Packaging
- Zip the whole `adobe-study-material/` folder as `adobe-study-material-<short-name>-<n>.zip`.
- Unzip the zip into a clean folder and repeat the verification on that copy.
- Keep earlier zips; do not overwrite them.

## 9. Report format (always)
1. What was added (guide, questions with counts, certification card).
2. What was changed or removed, with reasons.
3. Questions not added, and why (no answer key, image-only, duplicate, unclear).
4. Keys I could not verify against Adobe's documentation.
5. Verification results, one line per check, with counts.
6. Mismatches or conflicts in the source (exam code, title, numbers, conflicting facts).
7. The final zip file name.

Never say "everything works" without the verification results above.