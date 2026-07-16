import { collection, doc, getDocs, setDoc } from 'firebase/firestore';

import type { ChemicalMaster, PestMaster, TreatmentMethodMaster } from '../models/treatmentMaster';
import { getFirebaseServices } from '../services/firebaseService';

const pestsKey = 'seibu-report-pest-masters';
const chemicalsKey = 'seibu-report-chemical-masters';
const treatmentMethodsKey = 'seibu-report-treatment-method-masters';
const now = new Date().toISOString();

const defaultPests: PestMaster[] = [
  { pestId: 'cockroach', pestName: 'ゴキブリ', isActive: true, createdAt: now, updatedAt: now },
  { pestId: 'rodent', pestName: 'ネズミ', isActive: true, createdAt: now, updatedAt: now },
  { pestId: 'fly', pestName: 'ハエ', isActive: true, createdAt: now, updatedAt: now }
];

const defaultChemicals: ChemicalMaster[] = [
  { chemicalId: 'gel-bait', pestId: 'cockroach', chemicalName: 'ベイト剤', isActive: true, createdAt: now, updatedAt: now },
  { chemicalId: 'residual-spray', pestId: 'cockroach', chemicalName: '残留噴霧剤', isActive: true, createdAt: now, updatedAt: now },
  { chemicalId: 'rodenticide', pestId: 'rodent', chemicalName: '殺鼠剤', isActive: true, createdAt: now, updatedAt: now },
  { chemicalId: 'fly-insecticide', pestId: 'fly', chemicalName: '飛翔昆虫用薬剤', isActive: true, createdAt: now, updatedAt: now }
];

const defaultTreatmentMethods: TreatmentMethodMaster[] = [
  { treatmentMethodId: 'bait-placement', chemicalId: 'gel-bait', treatmentMethodName: 'ベイト剤配置', isActive: true, createdAt: now, updatedAt: now },
  { treatmentMethodId: 'spray-treatment', chemicalId: 'residual-spray', treatmentMethodName: '残留噴霧処理', isActive: true, createdAt: now, updatedAt: now },
  { treatmentMethodId: 'rodenticide-placement', chemicalId: 'rodenticide', treatmentMethodName: '毒餌配置', isActive: true, createdAt: now, updatedAt: now },
  { treatmentMethodId: 'space-spray', chemicalId: 'fly-insecticide', treatmentMethodName: '空間噴霧処理', isActive: true, createdAt: now, updatedAt: now }
];

function loadLocal<T>(key: string, defaults: T[]) {
  const raw = localStorage.getItem(key);
  if (raw) return JSON.parse(raw) as T[];
  localStorage.setItem(key, JSON.stringify(defaults));
  return defaults;
}

function sortByName<T>(items: T[], key: keyof T) {
  return items.sort((a, b) => String(a[key]).localeCompare(String(b[key]), 'ja'));
}

export async function findPestMasters() {
  const firebase = getFirebaseServices();
  if (firebase) {
    const snapshot = await getDocs(collection(firebase.firestore, 'pest_masters'));
    return sortByName(
      snapshot.docs.map((item) => ({ pestId: item.id, ...item.data() }) as PestMaster),
      'pestName'
    );
  }
  return sortByName(loadLocal<PestMaster>(pestsKey, defaultPests), 'pestName');
}

export async function savePestMaster(pest: PestMaster) {
  const firebase = getFirebaseServices();
  if (firebase) {
    await setDoc(doc(firebase.firestore, 'pest_masters', pest.pestId), pest);
    return;
  }
  const items = loadLocal<PestMaster>(pestsKey, defaultPests);
  const index = items.findIndex((item) => item.pestId === pest.pestId);
  if (index >= 0) items[index] = pest;
  else items.push(pest);
  localStorage.setItem(pestsKey, JSON.stringify(items));
}

export async function findChemicalMasters() {
  const firebase = getFirebaseServices();
  if (firebase) {
    const snapshot = await getDocs(collection(firebase.firestore, 'chemical_masters'));
    return sortByName(
      snapshot.docs.map((item) => ({ chemicalId: item.id, ...item.data() }) as ChemicalMaster),
      'chemicalName'
    );
  }
  return sortByName(loadLocal<ChemicalMaster>(chemicalsKey, defaultChemicals), 'chemicalName');
}

export async function saveChemicalMaster(chemical: ChemicalMaster) {
  const firebase = getFirebaseServices();
  if (firebase) {
    await setDoc(doc(firebase.firestore, 'chemical_masters', chemical.chemicalId), chemical);
    return;
  }
  const items = loadLocal<ChemicalMaster>(chemicalsKey, defaultChemicals);
  const index = items.findIndex((item) => item.chemicalId === chemical.chemicalId);
  if (index >= 0) items[index] = chemical;
  else items.push(chemical);
  localStorage.setItem(chemicalsKey, JSON.stringify(items));
}

export async function findTreatmentMethodMasters() {
  const firebase = getFirebaseServices();
  if (firebase) {
    const snapshot = await getDocs(collection(firebase.firestore, 'treatment_method_masters'));
    return sortByName(
      snapshot.docs.map((item) => ({ treatmentMethodId: item.id, ...item.data() }) as TreatmentMethodMaster),
      'treatmentMethodName'
    );
  }
  return sortByName(loadLocal<TreatmentMethodMaster>(treatmentMethodsKey, defaultTreatmentMethods), 'treatmentMethodName');
}

export async function saveTreatmentMethodMaster(treatmentMethod: TreatmentMethodMaster) {
  const firebase = getFirebaseServices();
  if (firebase) {
    await setDoc(doc(firebase.firestore, 'treatment_method_masters', treatmentMethod.treatmentMethodId), treatmentMethod);
    return;
  }
  const items = loadLocal<TreatmentMethodMaster>(treatmentMethodsKey, defaultTreatmentMethods);
  const index = items.findIndex((item) => item.treatmentMethodId === treatmentMethod.treatmentMethodId);
  if (index >= 0) items[index] = treatmentMethod;
  else items.push(treatmentMethod);
  localStorage.setItem(treatmentMethodsKey, JSON.stringify(items));
}
