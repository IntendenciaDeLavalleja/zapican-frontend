import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { PageBlockPublic, ProcedureTypePublic } from '@/lib/api/types';
import ProcedureTracker from '@/components/islands/ProcedureTracker';

type Props = {
  procedures: ProcedureTypePublic[];
  proceduresBlock?: PageBlockPublic;
};

const sectionMotion = {
  initial: { opacity: 0, y: 52, rotateX: 8, transformPerspective: 1100 },
  whileInView: { opacity: 1, y: 0, rotateX: 0, transformPerspective: 1100 },
  viewport: { once: true, amount: 0.13 },
  transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] as const },
};

export default function ProceduresBlock({ procedures, proceduresBlock }: Props) {
  const [selectedProcedureSlug, setSelectedProcedureSlug] = useState(procedures[0]?.slug ?? '');

  const selectedProcedure = useMemo(
    () => procedures.find((p) => p.slug === selectedProcedureSlug) ?? procedures[0] ?? null,
    [procedures, selectedProcedureSlug],
  );

  return (
    <>
    <motion.section {...sectionMotion} id="tramites" className="scroll-mt-28 px-4 py-16 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[2.6rem] border border-black/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(241,245,249,0.9))] p-8 shadow-[0_26px_70px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:p-10 lg:p-12">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-slate-500">{(proceduresBlock?.content?.eyebrow as string) || 'Trámites'}</p>
          <h3 className="mt-4 text-4xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl">{proceduresBlock?.title || 'Iniciá tus gestiones con carga guiada y documentación ordenada.'}</h3>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">{proceduresBlock?.subtitle || 'Elegí un trámite desde un único selector y mirá un resumen claro antes de pasar al formulario completo.'}</p>

          {procedures.length > 0 && selectedProcedure ? (
            <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
              <div className="rounded-4xl border border-slate-200/80 bg-white/92 p-6 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
                <label htmlFor="procedure-selector" className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Trámite disponible
                </label>
                <div className="mt-3 rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                  <select
                    id="procedure-selector"
                    value={selectedProcedure.slug}
                    onChange={(e) => setSelectedProcedureSlug(e.target.value)}
                    className="w-full border-0 bg-transparent pr-4 text-base font-semibold text-slate-950 outline-none"
                  >
                    {procedures.map((p) => (
                      <option key={p.slug} value={p.slug}>{p.title}</option>
                    ))}
                  </select>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4">
                    <p className="text-[0.65rem] uppercase tracking-[0.24em] text-slate-400">Tiempo estimado</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{selectedProcedure.estimated_days ? `${selectedProcedure.estimated_days} días` : 'Plazo variable'}</p>
                  </div>
                  <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4">
                    <p className="text-[0.65rem] uppercase tracking-[0.24em] text-slate-400">Costo</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{selectedProcedure.fee_text || 'A confirmar'}</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <a
                    href={`/tramites?tipo=${selectedProcedure.slug}`}
                    className="inline-flex items-center rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(15,23,42,0.18)] transition hover:-translate-y-1"
                    style={{ background: 'linear-gradient(135deg, var(--site-primary), var(--site-secondary))' }}
                  >
                    Iniciar trámite
                  </a>
                </div>
              </div>

              <div className="rounded-4xl border border-black/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.9))] p-6 shadow-[0_22px_48px_rgba(15,23,42,0.10)]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--site-primary),var(--site-secondary))] text-white shadow-[0_16px_28px_rgba(15,23,42,0.16)]">
                    <FileText className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-500">{selectedProcedure.required_documents.length} docs</span>
                </div>
                <h4 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">{selectedProcedure.title}</h4>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{selectedProcedure.summary || 'Completá la solicitud y adjuntá la documentación necesaria desde la página exclusiva del trámite.'}</p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {selectedProcedure.required_documents.slice(0, 6).map((doc) => (
                    <div key={doc} className="rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">{doc}</div>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="rounded-full bg-slate-100 px-3 py-1">Selección guiada</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">Adjuntos por trámite</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">Respuesta municipal</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-4xl border border-dashed border-slate-300 bg-white/70 px-6 py-12 text-center text-slate-500">
              Todavía no hay trámites disponibles para publicar en el sitio.
            </div>
          )}
        </div>
      </div>
    </motion.section>
    <div className="px-4 pb-16 lg:px-8">
      <ProcedureTracker />
    </div>
  </>
  );
}
