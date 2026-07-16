import { FormEvent, useEffect, useMemo, useState } from 'react';

import { AdminLayout } from '../../components/admin/AdminLayout';
import { PrimaryButton } from '../../components/PrimaryButton';
import type { ChemicalMaster, PestMaster, TreatmentMethodMaster } from '../../models/treatmentMaster';
import {
  findChemicalMasters,
  findPestMasters,
  findTreatmentMethodMasters,
  saveChemicalMaster,
  savePestMaster,
  saveTreatmentMethodMaster
} from '../../repositories/treatmentMasterRepository';

export function AdminTreatmentMastersPage() {
  const [pests, setPests] = useState<PestMaster[]>([]);
  const [chemicals, setChemicals] = useState<ChemicalMaster[]>([]);
  const [treatmentMethods, setTreatmentMethods] = useState<TreatmentMethodMaster[]>([]);
  const [selectedPestId, setSelectedPestId] = useState('');
  const [selectedChemicalId, setSelectedChemicalId] = useState('');
  const [pestName, setPestName] = useState('');
  const [editingPestId, setEditingPestId] = useState('');
  const [chemicalName, setChemicalName] = useState('');
  const [editingChemicalId, setEditingChemicalId] = useState('');
  const [treatmentMethodName, setTreatmentMethodName] = useState('');
  const [editingTreatmentMethodId, setEditingTreatmentMethodId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const [nextPests, nextChemicals, nextTreatmentMethods] = await Promise.all([
      findPestMasters(),
      findChemicalMasters(),
      findTreatmentMethodMasters()
    ]);
    setPests(nextPests);
    setChemicals(nextChemicals);
    setTreatmentMethods(nextTreatmentMethods);
    setSelectedPestId((current) => current || nextPests[0]?.pestId || '');
  }

  useEffect(() => {
    let active = true;
    refresh().finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const selectedPest = pests.find((pest) => pest.pestId === selectedPestId) ?? null;
  const chemicalsForSelectedPest = useMemo(
    () => chemicals.filter((chemical) => chemical.pestId === selectedPestId),
    [chemicals, selectedPestId]
  );
  const selectedChemical =
    chemicalsForSelectedPest.find((chemical) => chemical.chemicalId === selectedChemicalId) ?? chemicalsForSelectedPest[0] ?? null;
  const methodsForSelectedChemical = useMemo(
    () => treatmentMethods.filter((method) => method.chemicalId === selectedChemical?.chemicalId),
    [selectedChemical?.chemicalId, treatmentMethods]
  );

  useEffect(() => {
    if (!chemicalsForSelectedPest.length) {
      setSelectedChemicalId('');
      return;
    }
    if (!chemicalsForSelectedPest.some((chemical) => chemical.chemicalId === selectedChemicalId)) {
      setSelectedChemicalId(chemicalsForSelectedPest[0].chemicalId);
    }
  }, [chemicalsForSelectedPest, selectedChemicalId]);

  function cancelPestEdit() {
    setEditingPestId('');
    setPestName('');
  }

  function cancelChemicalEdit() {
    setEditingChemicalId('');
    setChemicalName('');
  }

  function cancelMethodEdit() {
    setEditingTreatmentMethodId('');
    setTreatmentMethodName('');
  }

  async function savePest(event: FormEvent) {
    event.preventDefault();
    if (!pestName.trim()) return;
    const now = new Date().toISOString();
    const existing = pests.find((item) => item.pestId === editingPestId);
    const value = {
      pestId: existing?.pestId ?? crypto.randomUUID(),
      pestName: pestName.trim(),
      isActive: existing?.isActive ?? true,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now
    };
    await savePestMaster(value);
    setSelectedPestId(value.pestId);
    cancelPestEdit();
    setMessage(existing ? '対象害虫獣を更新しました。' : '対象害虫獣を追加しました。');
    await refresh();
  }

  async function saveChemical(event: FormEvent) {
    event.preventDefault();
    if (!chemicalName.trim() || !selectedPestId) return;
    const now = new Date().toISOString();
    const existing = chemicals.find((item) => item.chemicalId === editingChemicalId);
    const value = {
      chemicalId: existing?.chemicalId ?? crypto.randomUUID(),
      pestId: selectedPestId,
      chemicalName: chemicalName.trim(),
      isActive: existing?.isActive ?? true,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now
    };
    await saveChemicalMaster(value);
    setSelectedChemicalId(value.chemicalId);
    cancelChemicalEdit();
    setMessage(existing ? '使用薬剤を更新しました。' : '使用薬剤を追加しました。');
    await refresh();
  }

  async function saveMethod(event: FormEvent) {
    event.preventDefault();
    if (!treatmentMethodName.trim() || !selectedChemical) return;
    const now = new Date().toISOString();
    const existing = treatmentMethods.find((item) => item.treatmentMethodId === editingTreatmentMethodId);
    await saveTreatmentMethodMaster({
      treatmentMethodId: existing?.treatmentMethodId ?? crypto.randomUUID(),
      chemicalId: selectedChemical.chemicalId,
      treatmentMethodName: treatmentMethodName.trim(),
      isActive: existing?.isActive ?? true,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now
    });
    cancelMethodEdit();
    setMessage(existing ? '処理方法を更新しました。' : '処理方法を追加しました。');
    await refresh();
  }

  async function togglePest(pest: PestMaster) {
    await savePestMaster({ ...pest, isActive: !pest.isActive, updatedAt: new Date().toISOString() });
    setMessage(pest.isActive ? '対象害虫獣を無効にしました。' : '対象害虫獣を有効にしました。');
    await refresh();
  }

  async function toggleChemical(chemical: ChemicalMaster) {
    await saveChemicalMaster({ ...chemical, isActive: !chemical.isActive, updatedAt: new Date().toISOString() });
    setMessage(chemical.isActive ? '使用薬剤を無効にしました。' : '使用薬剤を有効にしました。');
    await refresh();
  }

  async function toggleMethod(method: TreatmentMethodMaster) {
    await saveTreatmentMethodMaster({ ...method, isActive: !method.isActive, updatedAt: new Date().toISOString() });
    setMessage(method.isActive ? '処理方法を無効にしました。' : '処理方法を有効にしました。');
    await refresh();
  }

  return (
    <AdminLayout title="施工内容マスタ">
      {loading ? <p className="muted-text">読み込み中...</p> : null}
      {message ? <p className="hint">{message}</p> : null}
      <div className="master-editor">
        <section className="master-panel">
          <header>
            <h2>1. 対象害虫獣</h2>
            <span>{pests.length}件</span>
          </header>
          <form className="master-inline-form" onSubmit={savePest}>
            <input placeholder="対象害虫獣を追加" value={pestName} onChange={(event) => setPestName(event.target.value)} />
            <PrimaryButton type="submit">{editingPestId ? '更新' : '追加'}</PrimaryButton>
            {editingPestId ? <PrimaryButton type="button" variant="secondary" onClick={cancelPestEdit}>取消</PrimaryButton> : null}
          </form>
          <div className="master-item-list">
            {pests.map((pest) => (
              <button
                key={pest.pestId}
                type="button"
                className={`master-item ${pest.pestId === selectedPestId ? 'is-selected' : ''} ${!pest.isActive ? 'is-inactive' : ''}`}
                onClick={() => setSelectedPestId(pest.pestId)}
              >
                <span>
                  <strong>{pest.pestName}</strong>
                  <small>{pest.isActive ? '有効' : '無効'}</small>
                </span>
                <span className="master-item-actions">
                  <span onClick={(event) => {
                    event.stopPropagation();
                    setEditingPestId(pest.pestId);
                    setPestName(pest.pestName);
                  }}>編集</span>
                  <span onClick={(event) => {
                    event.stopPropagation();
                    void togglePest(pest);
                  }}>{pest.isActive ? '無効化' : '有効化'}</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="master-panel">
          <header>
            <h2>2. 使用薬剤</h2>
            <span>{selectedPest?.pestName || '未選択'}</span>
          </header>
          <form className="master-inline-form" onSubmit={saveChemical}>
            <input
              placeholder="使用薬剤を追加"
              value={chemicalName}
              disabled={!selectedPest}
              onChange={(event) => setChemicalName(event.target.value)}
            />
            <PrimaryButton type="submit" disabled={!selectedPest}>{editingChemicalId ? '更新' : '追加'}</PrimaryButton>
            {editingChemicalId ? <PrimaryButton type="button" variant="secondary" onClick={cancelChemicalEdit}>取消</PrimaryButton> : null}
          </form>
          <div className="master-item-list">
            {chemicalsForSelectedPest.map((chemical) => (
              <button
                key={chemical.chemicalId}
                type="button"
                className={`master-item ${chemical.chemicalId === selectedChemical?.chemicalId ? 'is-selected' : ''} ${!chemical.isActive || !selectedPest?.isActive ? 'is-inactive' : ''}`}
                onClick={() => setSelectedChemicalId(chemical.chemicalId)}
              >
                <span>
                  <strong>{chemical.chemicalName}</strong>
                  <small>{chemical.isActive && selectedPest?.isActive ? '有効' : '無効または親項目が無効'}</small>
                </span>
                <span className="master-item-actions">
                  <span onClick={(event) => {
                    event.stopPropagation();
                    setSelectedChemicalId(chemical.chemicalId);
                    setEditingChemicalId(chemical.chemicalId);
                    setChemicalName(chemical.chemicalName);
                  }}>編集</span>
                  <span onClick={(event) => {
                    event.stopPropagation();
                    void toggleChemical(chemical);
                  }}>{chemical.isActive ? '無効化' : '有効化'}</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="master-panel">
          <header>
            <h2>3. 処理方法</h2>
            <span>{selectedChemical?.chemicalName || '未選択'}</span>
          </header>
          <form className="master-inline-form" onSubmit={saveMethod}>
            <input
              placeholder="処理方法を追加"
              value={treatmentMethodName}
              disabled={!selectedChemical}
              onChange={(event) => setTreatmentMethodName(event.target.value)}
            />
            <PrimaryButton type="submit" disabled={!selectedChemical}>{editingTreatmentMethodId ? '更新' : '追加'}</PrimaryButton>
            {editingTreatmentMethodId ? <PrimaryButton type="button" variant="secondary" onClick={cancelMethodEdit}>取消</PrimaryButton> : null}
          </form>
          <div className="master-item-list">
            {methodsForSelectedChemical.map((method) => (
              <div key={method.treatmentMethodId} className={`master-item ${!method.isActive || !selectedChemical?.isActive ? 'is-inactive' : ''}`}>
                <span>
                  <strong>{method.treatmentMethodName}</strong>
                  <small>{method.isActive && selectedChemical?.isActive ? '有効' : '無効または親項目が無効'}</small>
                </span>
                <span className="master-item-actions">
                  <span onClick={() => {
                    setEditingTreatmentMethodId(method.treatmentMethodId);
                    setTreatmentMethodName(method.treatmentMethodName);
                  }}>編集</span>
                  <span onClick={() => void toggleMethod(method)}>{method.isActive ? '無効化' : '有効化'}</span>
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
