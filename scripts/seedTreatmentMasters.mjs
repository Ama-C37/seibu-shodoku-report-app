import fs from 'node:fs';
import path from 'node:path';
import { initializeApp, getApps } from 'firebase/app';
import { doc, getFirestore, setDoc } from 'firebase/firestore';

function readEnv() {
  const raw = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf8');
  return Object.fromEntries(
    raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const index = line.indexOf('=');
        return [line.slice(0, index), line.slice(index + 1).replace(/^["']|["']$/g, '')];
      })
  );
}

const env = readEnv();
const app = getApps()[0] ?? initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
});
const firestore = getFirestore(app);
const now = new Date().toISOString();

const pests = [
  { pestId: 'cockroach', pestName: 'ゴキブリ' },
  { pestId: 'rodent', pestName: 'ネズミ' },
  { pestId: 'fly', pestName: 'ハエ' }
];

const chemicals = [
  { chemicalId: 'gel-bait', pestId: 'cockroach', chemicalName: 'ベイト剤' },
  { chemicalId: 'residual-spray', pestId: 'cockroach', chemicalName: '残留噴霧剤' },
  { chemicalId: 'rodenticide', pestId: 'rodent', chemicalName: '殺鼠剤' },
  { chemicalId: 'fly-insecticide', pestId: 'fly', chemicalName: '飛翔昆虫用薬剤' }
];

const treatmentMethods = [
  { treatmentMethodId: 'bait-placement', chemicalId: 'gel-bait', treatmentMethodName: 'ベイト剤配置' },
  { treatmentMethodId: 'spray-treatment', chemicalId: 'residual-spray', treatmentMethodName: '残留噴霧処理' },
  { treatmentMethodId: 'rodenticide-placement', chemicalId: 'rodenticide', treatmentMethodName: '毒餌配置' },
  { treatmentMethodId: 'space-spray', chemicalId: 'fly-insecticide', treatmentMethodName: '空間噴霧処理' }
];

for (const pest of pests) {
  await setDoc(doc(firestore, 'pest_masters', pest.pestId), {
    ...pest,
    isActive: true,
    createdAt: now,
    updatedAt: now
  }, { merge: true });
  console.log(`pest: ${pest.pestName}`);
}

for (const chemical of chemicals) {
  await setDoc(doc(firestore, 'chemical_masters', chemical.chemicalId), {
    ...chemical,
    isActive: true,
    createdAt: now,
    updatedAt: now
  }, { merge: true });
  console.log(`chemical: ${chemical.chemicalName}`);
}

for (const method of treatmentMethods) {
  await setDoc(doc(firestore, 'treatment_method_masters', method.treatmentMethodId), {
    ...method,
    isActive: true,
    createdAt: now,
    updatedAt: now
  }, { merge: true });
  console.log(`method: ${method.treatmentMethodName}`);
}
