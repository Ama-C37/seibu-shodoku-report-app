import { collection, doc, getDocs, limit as firestoreLimit, query, setDoc, where } from 'firebase/firestore';

import type { AiCorrection } from '../models/aiCorrection';
import { getFirebaseServices } from '../services/firebaseService';

const correctionsKey = 'seibu-report-ai-corrections';

// MVP local implementation. Replace this module with Firestore
// `ai_corrections` persistence when OpenAI history is moved server-side.
function loadAiCorrections() {
  const raw = localStorage.getItem(correctionsKey);
  return raw ? (JSON.parse(raw) as AiCorrection[]) : [];
}

function normalizeAiCorrection(correctionId: string, value: Partial<AiCorrection>): AiCorrection {
  return {
    correctionId,
    originalText: value.originalText ?? '',
    correctedText: value.correctedText ?? '',
    adoptedText: value.adoptedText ?? '',
    adopted: value.adopted ?? false,
    retryIndex: value.retryIndex,
    createdAt: value.createdAt ?? new Date().toISOString()
  };
}

function sortAiCorrections(corrections: AiCorrection[]) {
  return corrections.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function findAiCorrections() {
  const firebase = getFirebaseServices();
  if (firebase) {
    const snapshot = await getDocs(collection(firebase.firestore, 'ai_corrections'));
    return sortAiCorrections(snapshot.docs.map((item) => normalizeAiCorrection(item.id, item.data() as Partial<AiCorrection>)));
  }

  return sortAiCorrections(loadAiCorrections());
}

export async function findAdoptedAiCorrections(limit = 5) {
  const firebase = getFirebaseServices();
  if (firebase) {
    const correctionsQuery = query(
      collection(firebase.firestore, 'ai_corrections'),
      where('adopted', '==', true),
      firestoreLimit(limit)
    );
    const snapshot = await getDocs(correctionsQuery);
    return sortAiCorrections(snapshot.docs.map((item) => normalizeAiCorrection(item.id, item.data() as Partial<AiCorrection>)));
  }

  return sortAiCorrections(loadAiCorrections())
    .filter((correction) => correction.adopted)
    .slice(0, limit);
}

export async function findRejectedAiCorrections(originalText: string, limit = 5) {
  const firebase = getFirebaseServices();
  if (firebase) {
    const correctionsQuery = query(
      collection(firebase.firestore, 'ai_corrections'),
      where('adopted', '==', false),
      where('originalText', '==', originalText),
      firestoreLimit(limit)
    );
    const snapshot = await getDocs(correctionsQuery);
    return sortAiCorrections(snapshot.docs.map((item) => normalizeAiCorrection(item.id, item.data() as Partial<AiCorrection>)));
  }

  return sortAiCorrections(loadAiCorrections())
    .filter((correction) => !correction.adopted && correction.originalText === originalText)
    .slice(0, limit);
}

export async function saveAiCorrection(correction: AiCorrection) {
  const firebase = getFirebaseServices();
  if (firebase) {
    await setDoc(doc(firebase.firestore, 'ai_corrections', correction.correctionId), correction);
    return;
  }

  const corrections = loadAiCorrections();
  corrections.unshift(correction);
  localStorage.setItem(correctionsKey, JSON.stringify(corrections.slice(0, 50)));
}
