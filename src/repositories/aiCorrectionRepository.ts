import type { AiCorrection } from '../models/aiCorrection';

const correctionsKey = 'seibu-report-ai-corrections';

export function findAiCorrections() {
  const raw = localStorage.getItem(correctionsKey);
  const corrections = raw ? (JSON.parse(raw) as AiCorrection[]) : [];
  return corrections.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function findAdoptedAiCorrections(limit = 5) {
  return findAiCorrections()
    .filter((correction) => correction.adopted)
    .slice(0, limit);
}

export function findRejectedAiCorrections(originalText: string, limit = 5) {
  return findAiCorrections()
    .filter((correction) => !correction.adopted && correction.originalText === originalText)
    .slice(0, limit);
}

export function saveAiCorrection(correction: AiCorrection) {
  const corrections = findAiCorrections();
  corrections.unshift(correction);
  localStorage.setItem(correctionsKey, JSON.stringify(corrections.slice(0, 50)));
}
