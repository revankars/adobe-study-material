# Adobe Certification Study Portal

A static study site for four Adobe certifications:

| Code | Certification |
|---|---|
| AD0-E207 | Adobe Analytics Architect Master |
| AD0-E408 | Adobe Target Business Practitioner Professional |
| AD0-E409 | Adobe Target Architect Master |
| AD0-E607 | Adobe Journey Optimizer Business Practitioner Professional |
| AD0-E605 | Adobe Real-Time CDP Developer Expert |
| AD0-E606 | Adobe Journey Optimizer Developer Expert |

It covers six certifications and has five sections: a dashboard, study material, practice tests, mock examinations, and quick revision. A search box covers chapters and questions.

This is an independent study resource. It is not affiliated with or endorsed by Adobe. Always check the latest official Adobe exam guides and Experience League documentation.

## Open it

Double-click `index.html`. The portal works straight from disk.

Over HTTP it also works, and it picks up data edits without a rebuild:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Editing

Quick revision summaries are generated from the complete guides by `python3 tools/build_quick_revision.py`. Run it after changing a guide, then run `tools/build_bundle.py`.

The page loads two generated files: `assets/js/portal.bundle.js` (all the code) and `assets/js/data-bundle.js` (all the data). After changing anything in `assets/js/` or `data/`, regenerate them:

```bash
python3 tools/build_bundle.py
```

## Publish on GitHub Pages

Upload the whole folder to a repository, then choose **Settings → Pages → Deploy from a branch → main / root**. No build step is needed.

## Layout

- `index.html`: the single page shell (sidebar, top bar with search, main content area).
- `assets/css/styles.css`: all styles.
- `tools/build_bundle.py`: builds the two bundle files above.
- `assets/js/`: `app.js` (navigation, routing and actions), `dashboard.js`, `study.js`, `study-selection.js`, `quiz.js`, `practice-tests.js`, `mock-tests.js`, `quick-revision.js`, `storage.js` (progress saved in the browser).
- `data/<cert>/`: `exam.json`, `chapters.json`, `questions.json`. `data/certifications.json` lists the certifications and their official links.
- `Complete_Study_Guide_AD0-E*.html`: the complete study notes for each exam, built from the original Adobe Certification Study Hub. The Study material section shows each one in its own frame.
- `AD0-E207_Comprehensive_Study_Guide.html`, `AD0-E408_COMPREHENSIVE_STUDY_GUIDE.html`, `Adobe_Target_Architect_Study_Guide.html`, `AJO_Study_Guide.html`: earlier guides, kept for reference. The portal no longer uses them.
- `*.docx`: Word versions of the study material.
- `*_Practice*.html`: standalone practice sets that can be opened directly.

## Known content gaps

- `data/ad0-e207/chapters.json` holds one chapter with no topics. `data/ad0-e207/chapters-new.json` holds a different chapter and is not used by the site yet.
- Some AD0-E408 questions still have a generic explanation pointing to the study guide. They are marked "See study guide section on …".
- The Target Architect chapter 9 independent practice exam (from the original hub) is included in the study guide, not in the practice questions.
- `AJO_Study_Guide.html` gives an exam date that has already passed. Confirm the current date on Adobe's certification site.
- Progress is stored in the browser only. Use Export and Import in the footer to move it between browsers.

## Original source files

`original-sources/` holds the files the study material was built from: the original `Adobe_Certification_Study_Hub.html` and the practice question files (`AD0-E408_COMPLETE_PRACTICE_EXAM_40Q.html`, `Practice_Test_30_Questions.md`, `AJO_Practice_Exam_50_Questions.html`, `AJO_Practice_Exam_Questions.md`).

## Real-Time CDP and Journey Optimizer Developer Expert tracks

`tools/import_new_tracks.py` builds these two tracks from `original-sources/`:

- The complete study guides for AD0-E605 and AD0-E606 are the uploaded guides, unchanged except for added heading anchors.
- The graded practice sets are the questions and answer keys in those guides: 10 for AD0-E605 and 15 for AD0-E606. The question bank is not part of the portal.
- `data/ad0-e605/question-bank.json` holds the Real-Time CDP master practice bank as a review-only list. The source does not state the correct answers for these questions, so they are not scored. Please check them against Adobe's official material before relying on them.

The AD0-E605 guide is titled "Architect" in the uploaded file. Confirm that it matches the Developer Expert exam.

Run `python3 tools/import_new_tracks.py`, `python3 tools/build_study_stats.py`, `python3 tools/build_quick_revision.py` and `python3 tools/build_bundle.py` after changing these files.
