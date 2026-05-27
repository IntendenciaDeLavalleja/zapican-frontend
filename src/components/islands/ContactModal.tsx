import { AnimatePresence, motion } from 'framer-motion';
import { X, Send, CheckCircle, AlertCircle, Loader, MapPin, Mail, Phone } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { formsApi } from '@/lib/api';
import type { SitePublic } from '@/lib/api/types';

type Props = {
  open: boolean;
  onClose: () => void;
  site: SitePublic;
};

type Status = 'idle' | 'sending' | 'success' | 'error';

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.22 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

const panelVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: 24, scale: 0.97, transition: { duration: 0.2 } },
};

export default function ContactModal({ open, onClose, site }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Trap focus + lock body scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const raf = requestAnimationFrame(() => firstInputRef.current?.focus());
    return () => {
      document.body.style.overflow = prev;
      cancelAnimationFrame(raf);
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const reset = () => {
    setName(''); setEmail(''); setSubject(''); setMessage('');
    setStatus('idle');
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await formsApi.submit('contacto', { name, email, subject, message });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="contact-overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-200 flex items-center justify-center px-4 py-6"
          style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(7, 17, 38, 0.52)' }}
          onPointerDown={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <motion.div
            key="contact-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-label="Formulario de contacto"
            className="relative w-full max-w-2xl overflow-hidden rounded-[2.4rem] bg-white shadow-[0_48px_120px_rgba(7,17,38,0.32)]"
          >
            {/* Decorative gradient strip at top */}
            <div
              aria-hidden="true"
              className="h-1.5 w-full"
              style={{ background: 'linear-gradient(90deg, #1e40af, #0ea5e9, #38bdf8, #0ea5e9, #1e40af)' }}
            />

            {/* Header */}
            <div className="relative px-8 pt-8 pb-6 lg:px-12 lg:pt-10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-sky-500">
                    {site.name || 'Municipio'}
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-slate-950 sm:text-3xl">
                    Escribinos
                  </h2>
                  <p className="mt-1.5 text-sm text-slate-500">
                    Te respondemos a la brevedad.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Cerrar"
                  className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Quick contact info strip */}
              <div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-500">
                {site.address && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                    {site.address}
                  </span>
                )}
                {site.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                    {site.email}
                  </span>
                )}
                {site.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                    {site.phone}
                  </span>
                )}
              </div>
            </div>

            <div className="h-px mx-8 lg:mx-12 bg-slate-100" />

            {/* Body */}
            <div className="px-8 pb-10 pt-6 lg:px-12 lg:pb-12">
              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-5 py-8 text-center"
                  >
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
                      <CheckCircle className="h-10 w-10 text-emerald-500" strokeWidth={1.6} />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-slate-900">¡Mensaje enviado!</p>
                      <p className="mt-2 text-sm text-slate-500 max-w-xs mx-auto">
                        Gracias por comunicarte. Nos pondremos en contacto contigo a la brevedad.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="mt-2 rounded-full bg-slate-900 px-7 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-700"
                    >
                      Cerrar
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    noValidate
                    className="space-y-5"
                  >
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <Field label="Nombre completo" required>
                        <input
                          ref={firstInputRef}
                          type="text"
                          placeholder="Tu nombre"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="field-input"
                        />
                      </Field>

                      <Field label="Correo electrónico" required>
                        <input
                          type="email"
                          placeholder="correo@ejemplo.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="field-input"
                        />
                      </Field>
                    </div>

                    <Field label="Asunto">
                      <input
                        type="text"
                        placeholder="¿Sobre qué nos escribís?"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="field-input"
                      />
                    </Field>

                    <Field label="Mensaje" required>
                      <textarea
                        placeholder="Describí tu consulta o solicitud..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        rows={4}
                        className="field-input resize-none"
                      />
                    </Field>

                    {status === 'error' && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
                      >
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        No pudimos enviar el mensaje. Intentá de nuevo o escribinos directamente.
                      </motion.div>
                    )}

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-4 pt-1">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        Cancelar
                      </button>

                      <motion.button
                        type="submit"
                        disabled={status === 'sending'}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center justify-center gap-2.5 rounded-full px-7 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(14,165,233,0.38)] transition hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                        style={{ background: 'linear-gradient(135deg, #1e40af, #0ea5e9)' }}
                      >
                        {status === 'sending' ? (
                          <>
                            <Loader className="h-4 w-4 animate-spin" />
                            Enviando…
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Enviar mensaje
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[0.78rem] font-semibold text-slate-700 tracking-wide">
        {label}{required && <span className="ml-0.5 text-sky-500">*</span>}
      </span>
      {children}
    </label>
  );
}
