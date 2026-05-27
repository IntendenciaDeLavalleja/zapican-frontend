import { atom } from 'nanostores';

export type ProcedureDraft = {
  procedureSlug: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantAddress: string;
  documentNumber: string;
  notes: string;
  acceptedTerms: boolean;
  files: Record<string, { name: string; size: number; type: string; lastModified: number }>;
};

const STORAGE_KEY = 'municipios-procedure-draft';

const initialDraft: ProcedureDraft = {
  procedureSlug: '',
  applicantName: '',
  applicantEmail: '',
  applicantPhone: '',
  applicantAddress: '',
  documentNumber: '',
  notes: '',
  acceptedTerms: false,
  files: {},
};

function loadDraft(): ProcedureDraft {
  if (typeof window === 'undefined') return initialDraft;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialDraft;
    const parsed = JSON.parse(raw);
    return { ...initialDraft, ...parsed, files: parsed?.files ?? {} };
  } catch {
    return initialDraft;
  }
}

export const $procedureDraft = atom<ProcedureDraft>(initialDraft);

let hydrated = false;
export function hydrateProcedureDraft() {
  if (hydrated || typeof window === 'undefined') return;
  hydrated = true;
  $procedureDraft.set(loadDraft());
}

export function patchProcedureDraft(partial: Partial<ProcedureDraft>) {
  const current = $procedureDraft.get();
  const next = { ...current, ...partial };
  if (JSON.stringify(current) === JSON.stringify(next)) {
    return;
  }
  $procedureDraft.set(next);
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
}

export function clearProcedureDraft() {
  $procedureDraft.set(initialDraft);
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}