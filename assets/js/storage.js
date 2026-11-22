const STORAGE_KEY = "adobe-study-portal-progress";
const STATE_VERSION = 1;

export function createInitialState() {
  return {
    version: STATE_VERSION,
    completedChapters: [],
    bookmarkedTopics: [],
    lastChapterId: null,
    results: [],
    recentActivity: [],
    preferences: { certificationId: "ad0-e409", mode: "learning" }
  };
}

function isValidState(value) {
  return value
    && value.version === STATE_VERSION
    && Array.isArray(value.completedChapters)
    && Array.isArray(value.bookmarkedTopics)
    && Array.isArray(value.results)
    && Array.isArray(value.recentActivity)
    && value.preferences
    && typeof value.preferences === "object";
}

export function loadProgress() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return createInitialState();
  const value = JSON.parse(raw);
  if (!isValidState(value)) {
    throw new Error("Saved progress has an unsupported or incomplete format.");
  }
  return value;
}

export function saveProgress(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function validateImportedProgress(value) {
  if (!isValidState(value)) {
    throw new Error("This file is not a valid Study Portal progress backup.");
  }
  return value;
}

export function downloadProgress(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `adobe-study-progress-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
