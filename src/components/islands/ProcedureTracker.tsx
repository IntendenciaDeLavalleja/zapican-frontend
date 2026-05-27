import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Clock, FileText, LoaderCircle, Search, X, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { proceduresApi } from '@/lib/api';
import type { ProcedureReceipt } from '@/lib/api/types';

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  new: {
    label: 'Recibida',
    color: 'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/40',
    icon: <Clock className="h-4 w-4" />,
  },
  in_review: {
    label: 'En revisión',
    color: 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/40',
    icon: <FileText className="h-4 w-4" />,
  },
  needs_info: {
    label: 'Requiere información',
    color: 'text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-900/40',
    icon: <Clock className="h-4 w-4" />,
  },
  approved: {
    label: 'Aprobada',
    color: 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/40',
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  rejected: {
    label: 'Rechazada',
    color: 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/40',
    icon: <XCircle className="h-4 w-4" />,
  },
  completed: {
    label: 'Completada',
    color: 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/40',
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  archived: {
    label: 'Archivada',
    color: 'text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-800',
    icon: <FileText className="h-4 w-4" />,
  },
};

function StatusBadge({ status }: { status: string }) {
  const info = STATUS_MAP[status] ?? {
    label: status,
    color: 'text-slate-600 bg-slate-100',
    icon: <FileText className="h-4 w-4" />,
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${info.color}`}>
      {info.icon}
      {info.label}
    </span>
  );
}

function TrackingModal({
  submission,
  onClose,
}: {
  submission: ProcedureReceipt;
  onClose: () => void;
}) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const statusKey = submission.status ?? 'new';
  const isPositive = ['approved', 'completed'].includes(statusKey);
  const isWarning = statusKey === 'needs_info';
  const isRejected = statusKey === 'rejected';

  const createdAt = submission.created_at
    ? new Date(submission.created_at).toLocaleDateString('es-UY', {
        day: '2-digit', month: 'long', year: 'numeric',
      })
    : null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Panel */}
      <motion.div
        className="relative z-10 w-full max-w-lg rounded-t-[2rem] bg-white p-7 shadow-[0_-24px_80px_rgba(15,23,42,0.22)] sm:rounded-[2rem] sm:shadow-[0_32px_80px_rgba(15,23,42,0.28)] dark:bg-slate-900 dark:shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
        initial={{ y: 60, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${
          isPositive
            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'
            : isRejected
            ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'
            : isWarning
            ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400'
            : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300'
        }`}>
          <FileText className="h-7 w-7" />
        </div>

        <h2 className="mt-5 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
          {submission.procedure?.title ?? 'Trámite'}
        </h2>

        <div className="mt-2 flex items-center gap-2">
          <StatusBadge status={statusKey} />
        </div>

        {/* Info grid */}
        <div className="mt-5 divide-y divide-slate-100 overflow-hidden rounded-[1.25rem] border border-slate-200 dark:divide-white/8 dark:border-white/10">
          <div className="grid grid-cols-[130px_1fr] text-sm">
            <div className="bg-slate-50 px-4 py-3 font-medium text-slate-500 dark:bg-white/5 dark:text-slate-400">Código</div>
            <div className="px-4 py-3 font-mono font-bold text-slate-900 tracking-wider dark:text-white">{submission.tracking_code}</div>
          </div>
          <div className="grid grid-cols-[130px_1fr] text-sm">
            <div className="bg-slate-50 px-4 py-3 font-medium text-slate-500 dark:bg-white/5 dark:text-slate-400">Comprobante</div>
            <div className="px-4 py-3 text-slate-700 dark:text-slate-300">#{submission.id}</div>
          </div>
          {createdAt && (
            <div className="grid grid-cols-[130px_1fr] text-sm">
              <div className="bg-slate-50 px-4 py-3 font-medium text-slate-500 dark:bg-white/5 dark:text-slate-400">Presentada</div>
              <div className="px-4 py-3 text-slate-700 dark:text-slate-300">{createdAt}</div>
            </div>
          )}
        </div>

        {isWarning && (
          <div className="mt-4 rounded-[1.25rem] border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800 dark:border-orange-800/30 dark:bg-orange-900/20 dark:text-orange-300">
            El municipio necesita información adicional para continuar. Revisá tu correo electrónico.
          </div>
        )}
        {isRejected && (
          <div className="mt-4 rounded-[1.25rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800/30 dark:bg-red-900/20 dark:text-red-300">
            La solicitud fue rechazada. Revisá tu correo para conocer los motivos.
          </div>
        )}
        {isPositive && (
          <div className="mt-4 rounded-[1.25rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800/30 dark:bg-emerald-900/20 dark:text-emerald-300">
            {statusKey === 'completed' ? '¡Tu trámite fue completado exitosamente!' : '¡Tu solicitud fue aprobada! Revisá tu correo para más detalles.'}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-full border border-slate-200 bg-slate-50 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
        >
          Cerrar
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function ProcedureTracker() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcedureReceipt | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const resp = await proceduresApi.track(trimmed);
      if (!resp.ok || !resp.submission) {
        setError(resp.message ?? 'Código no encontrado. Verificá que esté bien escrito.');
      } else {
        setResult(resp.submission);
      }
    } catch {
      setError('No se pudo consultar el estado. Intentá de nuevo en unos momentos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="mx-auto w-full max-w-4xl">
        <div className="relative overflow-hidden rounded-[2.2rem] border border-black/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,255,255,0.78))] p-7 shadow-[0_24px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] sm:p-8 lg:p-9">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-slate-500 dark:text-slate-400">
            Seguimiento
          </p>
          <h2 className="mt-3 text-2xl font-black tracking-tighter text-slate-950 dark:text-white sm:text-3xl">
            Consultá el estado de tu trámite
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400">
            Ingresá el código de seguimiento que recibiste por correo al enviar tu solicitud.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="flex-1">
              <input
                ref={inputRef}
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError(null);
                }}
                placeholder="TRM-XXXX-XXXX"
                maxLength={13}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 font-mono text-base font-semibold tracking-widest text-slate-900 outline-none transition placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:border-slate-400 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-600 dark:focus:border-white/25 dark:focus:bg-white/8"
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="characters"
              />
              {error && (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-rose-600 dark:text-rose-400">
                  <XCircle className="h-4 w-4 shrink-0" /> {error}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || code.trim().length < 3}
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(15,23,42,0.18)] transition disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, var(--site-primary), var(--site-secondary))' }}
            >
              {loading ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {loading ? 'Consultando…' : 'Consultar estado'}
            </button>
          </form>
        </div>
      </section>

      <AnimatePresence>
        {result && (
          <TrackingModal
            submission={result}
            onClose={() => setResult(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
