import { zodResolver } from '@hookform/resolvers/zod';
import { useStore } from '@nanostores/react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ArrowRight, Check, CheckCircle2, FileText, LoaderCircle, ShieldCheck, UploadCloud } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { proceduresApi } from '@/lib/api';
import type { ProcedureReceipt, ProcedureTypePublic } from '@/lib/api/types';
import { $procedureDraft, clearProcedureDraft, hydrateProcedureDraft, patchProcedureDraft } from '@/stores/procedureDraft';

const formSchema = z.object({
  procedureSlug: z.string().min(1, 'Seleccioná un trámite.'),
  applicantName: z.string().min(3, 'Ingresá el nombre completo.'),
  applicantEmail: z.string().email('Ingresá un email válido.'),
  applicantPhone: z.string().regex(/^\d{0,9}$/, 'Solo dígitos, máximo 9 caracteres.').optional(),
  applicantAddress: z.string().min(5, 'Ingresá la dirección del domicilio.'),
  documentNumber: z.string().regex(/^\d{7,8}$/, 'Solo dígitos, sin puntos ni guiones (7 u 8 dígitos con el verificador).'),
  notes: z.string().optional(),
  acceptedTerms: z.literal(true, {
    errorMap: () => ({ message: 'Debes confirmar la veracidad de la información.' }),
  }),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  procedures: ProcedureTypePublic[];
  selectedSlug?: string | null;
};

const stepMotion = {
  initial: { opacity: 0, y: 18, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -18, scale: 0.98 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function documentFieldName(documentName: string, index: number) {
  return `document_${index}_${slugify(documentName) || 'adjunto'}`;
}

function getSelectedSlugFromLocation() {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('tipo');
}

export default function ProcedureWizard({ procedures, selectedSlug }: Props) {
  const draft = useStore($procedureDraft);
  // routeSelectedSlug comes from prop (SSR-safe) or URL (client-only)
  const [routeSelectedSlug, setRouteSelectedSlug] = useState(() => selectedSlug || getSelectedSlugFromLocation());
  // step is initialized ONLY from the URL/prop so SSR and client agree on the initial render
  const [step, setStep] = useState(() => (routeSelectedSlug ? 1 : 0));
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<ProcedureReceipt | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [files, setFiles] = useState<Record<string, File | null>>({});

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      procedureSlug: routeSelectedSlug || '',
      applicantName: '',
      applicantEmail: '',
      applicantPhone: '',
      applicantAddress: '',
      documentNumber: '',
      notes: '',
      acceptedTerms: false,
    },
  });

  const values = watch();
  const selectedProcedure = useMemo(
    () => procedures.find((item) => item.slug === values.procedureSlug) ?? null,
    [procedures, values.procedureSlug],
  );

  useEffect(() => {
    hydrateProcedureDraft();
    // After hydration restore saved draft values into the form
    const saved = $procedureDraft.get();
    if (saved.applicantName) setValue('applicantName', saved.applicantName);
    if (saved.applicantEmail) setValue('applicantEmail', saved.applicantEmail);
    if (saved.applicantPhone) setValue('applicantPhone', saved.applicantPhone);
    if (saved.applicantAddress) setValue('applicantAddress', saved.applicantAddress);
    if (saved.documentNumber) setValue('documentNumber', saved.documentNumber);
    if (saved.notes) setValue('notes', saved.notes);
    if (saved.acceptedTerms) setValue('acceptedTerms', saved.acceptedTerms);
    // Advance to step 1 if a procedure was saved but no URL param set the slug
    if (!routeSelectedSlug && saved.procedureSlug && step === 0) {
      setValue('procedureSlug', saved.procedureSlug);
      setStep(1);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const syncSelectedSlug = () => {
      setRouteSelectedSlug(selectedSlug || getSelectedSlugFromLocation());
    };

    syncSelectedSlug();
    document.addEventListener('astro:page-load', syncSelectedSlug);
    window.addEventListener('popstate', syncSelectedSlug);

    return () => {
      document.removeEventListener('astro:page-load', syncSelectedSlug);
      window.removeEventListener('popstate', syncSelectedSlug);
    };
  }, [selectedSlug]);

  useEffect(() => {
    patchProcedureDraft({
      procedureSlug: values.procedureSlug ?? '',
      applicantName: values.applicantName ?? '',
      applicantEmail: values.applicantEmail ?? '',
      applicantPhone: values.applicantPhone ?? '',
      applicantAddress: values.applicantAddress ?? '',
      documentNumber: values.documentNumber ?? '',
      notes: values.notes ?? '',
      acceptedTerms: values.acceptedTerms ?? false,
    });
  }, [values]);

  useEffect(() => {
    if (!routeSelectedSlug) return;
    if (values.procedureSlug !== routeSelectedSlug) {
      setValue('procedureSlug', routeSelectedSlug, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    }
    setStep(1);
  }, [routeSelectedSlug, setValue, values.procedureSlug]);

  const requiredDocuments = selectedProcedure?.required_documents ?? [];
  const missingFiles = requiredDocuments.filter((documentName, index) => !files[documentFieldName(documentName, index)]);

  const onPickFile = (fieldName: string, file: File | null) => {
    setFiles((current) => ({ ...current, [fieldName]: file }));
    patchProcedureDraft({
      files: file
        ? {
            ...draft.files,
            [fieldName]: {
              name: file.name,
              size: file.size,
              type: file.type,
              lastModified: file.lastModified,
            },
          }
        : Object.fromEntries(Object.entries(draft.files).filter(([key]) => key !== fieldName)),
    });
  };

  const nextStep = async () => {
    setSubmitError(null);
    if (step === 0) {
      const valid = await trigger('procedureSlug');
      if (!valid) return;
    }
    if (step === 1) {
      const valid = await trigger(['applicantName', 'applicantEmail', 'applicantPhone', 'applicantAddress', 'documentNumber']);
      if (!valid) return;
    }
    if (step === 2 && missingFiles.length > 0) {
      setSubmitError('Adjuntá todos los documentos obligatorios para continuar.');
      return;
    }
    setStep((current) => Math.min(current + 1, 3));
  };

  const previousStep = () => {
    setSubmitError(null);
    setStep((current) => Math.max(current - 1, 0));
  };

  const onSubmit = handleSubmit(async (formValues) => {
    if (!selectedProcedure) return;
    if (missingFiles.length > 0) {
      setSubmitError('Adjuntá todos los documentos obligatorios antes de enviar.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = new FormData();
      payload.append('procedure_slug', selectedProcedure.slug);
      payload.append('applicant_name', formValues.applicantName);
      payload.append('applicant_email', formValues.applicantEmail);
      payload.append('applicant_phone', formValues.applicantPhone ?? '');
      payload.append('applicant_address', formValues.applicantAddress ?? '');
      payload.append('document_number', formValues.documentNumber);
      payload.append(
        'payload_json',
        JSON.stringify({
          notes: formValues.notes ?? '',
          acceptedTerms: formValues.acceptedTerms,
          requiredDocuments: selectedProcedure.required_documents,
        }),
      );

      selectedProcedure.required_documents.forEach((documentName, index) => {
        const fieldName = documentFieldName(documentName, index);
        const file = files[fieldName];
        if (file) payload.append(fieldName, file);
      });

      const response = await proceduresApi.submit(payload);
      if (!response.ok) {
        setSubmitError(response.message ?? 'No se pudo enviar la solicitud.');
        return;
      }

      setReceipt(response.receipt ?? null);
      clearProcedureDraft();
      reset({
        procedureSlug: '',
        applicantName: '',
        applicantEmail: '',
        applicantPhone: '',
        applicantAddress: '',
        documentNumber: '',
        notes: '',
        acceptedTerms: false,
      });
      setFiles({});
      setRouteSelectedSlug(null);
    } catch (error: any) {
      setSubmitError(error?.response?.data?.message ?? 'Hubo un problema al enviar la solicitud.');
    } finally {
      setSubmitting(false);
    }
  });

  const progress = [
    { label: 'Tipo de trámite', helper: 'Elegí qué querés gestionar.' },
    { label: 'Tus datos', helper: 'Necesitamos identificar la solicitud.' },
    { label: 'Documentación', helper: 'Subí lo exigido para este trámite.' },
    { label: 'Términos y envío', helper: 'Leé, aceptá y confirmá.' },
  ];

  if (receipt) {
    return (
      <div className="rounded-[2rem] border border-emerald-200 bg-white/92 p-8 shadow-[0_24px_60px_rgba(16,185,129,0.12)] backdrop-blur-xl dark:border-emerald-800/40 dark:bg-slate-900/90">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h2 className="mt-6 text-3xl font-black tracking-[-0.03em] text-slate-950 dark:text-white">Solicitud enviada</h2>
        <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400">Recibimos tu trámite correctamente. Te enviamos un correo con el código de seguimiento. El equipo municipal lo va a revisar y se va a comunicar contigo.</p>

        {receipt.tracking_code && (
          <div className="mt-6 rounded-[1.5rem] bg-slate-950 p-6 text-center dark:bg-slate-800/60 dark:ring-1 dark:ring-white/10">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.28em] text-slate-400">Código de seguimiento</p>
            <p className="mt-2 font-mono text-3xl font-black tracking-[0.1em] text-white">{receipt.tracking_code}</p>
            <p className="mt-2 text-xs text-slate-500">Guardalo para consultar el estado de tu trámite en cualquier momento</p>
          </div>
        )}

        <div className="mt-5 grid gap-3 rounded-[1.5rem] bg-slate-50 p-5 text-sm text-slate-700 dark:bg-slate-800/40 dark:text-slate-300 md:grid-cols-3">
          <div><span className="block text-xs uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">Comprobante</span><strong>#{receipt.id}</strong></div>
          <div><span className="block text-xs uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">Estado</span><strong>Nuevo</strong></div>
          <div><span className="block text-xs uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">Trámite</span><strong>{receipt.procedure?.title ?? 'Solicitud'}</strong></div>
        </div>
        <button
          type="button"
          onClick={() => {
            setReceipt(null);
            setStep(0);
          }}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-500 hover:bg-slate-50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
        >
          Iniciar otra solicitud
        </button>
      </div>
    );
  }

  const showSelectionStage = step === 0;

  return (
    <div className={showSelectionStage ? 'mx-auto max-w-4xl' : 'grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:gap-8'}>
      {!showSelectionStage && (
        <aside className="rounded-[2rem] border border-black/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.88))] p-5 shadow-[0_24px_54px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:p-6">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-slate-500">Seguimiento</p>
        <div className="mt-5 space-y-3">
          {progress.map((item, index) => {
            const isDone = index < step;
            const isCurrent = index === step;
            return (
              <div key={item.label} className={`rounded-[1.25rem] border px-4 py-3 transition ${isCurrent ? 'border-slate-900 bg-slate-950 text-white shadow-[0_20px_44px_rgba(15,23,42,0.24)]' : isDone ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-white text-slate-600'}`}>
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${isCurrent ? 'bg-white/14 text-white' : isDone ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {isDone ? <Check className="h-4 w-4" /> : index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className={`text-xs ${isCurrent ? 'text-white/68' : 'text-slate-400'}`}>{item.helper}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {selectedProcedure && (
          <div className="mt-5 rounded-[1.4rem] bg-[linear-gradient(135deg,var(--site-primary),var(--site-secondary))] p-4 text-white shadow-[0_22px_56px_rgba(15,23,42,0.18)]">
            <p className="text-[0.7rem] uppercase tracking-[0.28em] text-white/60">Trámite activo</p>
            <h3 className="mt-2 text-xl font-black tracking-[-0.03em]">{selectedProcedure.title}</h3>
            {selectedProcedure.summary && <p className="mt-2 text-sm leading-6 text-white/78">{selectedProcedure.summary}</p>}
            <div className="mt-4 grid gap-3 text-sm">
              <div className="rounded-2xl border border-white/14 bg-white/10 px-4 py-3">
                <span className="block text-[0.65rem] uppercase tracking-[0.24em] text-white/55">Tiempo estimado</span>
                <strong>{selectedProcedure.estimated_days ? `${selectedProcedure.estimated_days} días` : 'A confirmar'}</strong>
              </div>
              <div className="rounded-2xl border border-white/14 bg-white/10 px-4 py-3">
                <span className="block text-[0.65rem] uppercase tracking-[0.24em] text-white/55">Costo</span>
                <strong>{selectedProcedure.fee_text || 'Sin dato'}</strong>
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 rounded-[1.25rem] border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>El borrador se guarda localmente. Por seguridad, los archivos seleccionados no sobreviven a una recarga y deberán adjuntarse de nuevo.</p>
          </div>
        </div>
      </aside>
      )}

      <form onSubmit={onSubmit} className={`rounded-[2rem] border border-black/6 bg-white/94 shadow-[0_28px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl ${showSelectionStage ? 'p-6 sm:p-7' : 'p-6 sm:p-8 lg:p-9'}`}>
        <AnimatePresence mode="wait">
          <motion.div key={step} {...stepMotion}>
            {step === 0 && (
              <section>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-slate-500">Paso 1</p>
                <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] text-slate-950">Elegí el trámite a iniciar</h2>
                <p className="mt-3 max-w-2xl text-slate-600">Seleccioná un trámite y pasás enseguida a la siguiente etapa. Acá no hace falta mostrar todo el recorrido todavía.</p>
                <div className="mt-6 grid gap-3">
                  {procedures.map((procedure) => {
                    const selected = values.procedureSlug === procedure.slug;
                    return (
                      <button
                        key={procedure.id}
                        type="button"
                        onClick={() => {
                          setValue('procedureSlug', procedure.slug, { shouldValidate: true, shouldDirty: true });
                          setSubmitError(null);
                          setStep(1);
                        }}
                        className={`group rounded-[1.4rem] border px-4 py-4 text-left transition ${selected ? 'border-slate-900 bg-slate-950 text-white shadow-[0_24px_48px_rgba(15,23,42,0.24)]' : 'border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f8fafc)] hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]'}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className={`text-lg font-semibold ${selected ? 'text-white' : 'text-slate-950'}`}>{procedure.title}</p>
                            {procedure.summary && <p className={`mt-2 text-sm leading-6 ${selected ? 'text-white/72' : 'text-slate-600'}`}>{procedure.summary}</p>}
                          </div>
                          <ArrowRight className={`mt-1 h-5 w-5 shrink-0 ${selected ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'}`} />
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2 text-xs">
                          <span className={`rounded-full px-3 py-1 ${selected ? 'bg-white/12 text-white/80' : 'bg-slate-100 text-slate-600'}`}>{procedure.required_documents.length} documentos</span>
                          <span className={`rounded-full px-3 py-1 ${selected ? 'bg-white/12 text-white/80' : 'bg-slate-100 text-slate-600'}`}>{procedure.estimated_days ? `${procedure.estimated_days} días` : 'Plazo variable'}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {errors.procedureSlug && <p className="mt-3 text-sm text-rose-600">{errors.procedureSlug.message}</p>}
              </section>
            )}

            {step === 1 && (
              <section>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-slate-500">Paso 2</p>
                <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] text-slate-950">Contanos quién presenta el trámite</h2>
                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">Nombre completo</label>
                    <input className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:bg-white" {...register('applicantName')} />
                    {errors.applicantName && <p className="mt-2 text-sm text-rose-600">{errors.applicantName.message}</p>}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                    <input type="email" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:bg-white" {...register('applicantEmail')} />
                    {errors.applicantEmail && <p className="mt-2 text-sm text-rose-600">{errors.applicantEmail.message}</p>}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Teléfono</label>
                    <input
                      inputMode="numeric"
                      maxLength={9}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:bg-white"
                      {...register('applicantPhone', {
                        onChange: (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 9); },
                      })}
                    />
                    {errors.applicantPhone && <p className="mt-2 text-sm text-rose-600">{errors.applicantPhone.message}</p>}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Cédula de identidad</label>
                    <input
                      inputMode="numeric"
                      maxLength={8}
                      placeholder="Con dígito verificador, sin puntos ni guiones"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:bg-white"
                      {...register('documentNumber', {
                        onChange: (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 8); },
                      })}
                    />
                    {errors.documentNumber && <p className="mt-2 text-sm text-rose-600">{errors.documentNumber.message}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">Dirección del domicilio</label>
                    <input placeholder="Ej: Av. Artigas 123, Piso 2" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:bg-white" {...register('applicantAddress')} />
                    {errors.applicantAddress && <p className="mt-2 text-sm text-rose-600">{errors.applicantAddress.message}</p>}
                  </div>
                </div>
              </section>
            )}

            {step === 2 && (
              <section>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-slate-500">Paso 3</p>
                <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] text-slate-950">Adjuntá la documentación requerida</h2>
                <div className="mt-3 rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                  {selectedProcedure?.eligibility_notes || 'Subí cada documento en formato legible. Se aceptan imágenes y PDF.'}
                </div>
                <div className="mt-8 grid gap-4">
                  {requiredDocuments.map((documentName, index) => {
                    const fieldName = documentFieldName(documentName, index);
                    const file = files[fieldName];
                    const persisted = draft.files[fieldName];
                    return (
                      <label key={fieldName} className="block rounded-[1.6rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f8fafc)] p-5 shadow-[0_16px_36px_rgba(15,23,42,0.06)] transition hover:border-slate-400">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-base font-semibold text-slate-950">{documentName}</p>
                            <p className="mt-1 text-sm text-slate-500">Adjunto obligatorio para completar la solicitud.</p>
                          </div>
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                            <UploadCloud className="h-5 w-5" />
                          </div>
                        </div>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="mt-4 block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
                          onChange={(event) => onPickFile(fieldName, event.target.files?.[0] ?? null)}
                        />
                        <div className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                          {file ? (
                            <span>{file.name}</span>
                          ) : persisted ? (
                            <span>Había un adjunto seleccionado: {persisted.name}. Debés volver a cargarlo para enviarlo.</span>
                          ) : (
                            <span>Ningún archivo seleccionado todavía.</span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
                <div className="mt-6">
                  <label className="mb-2 block text-sm font-medium text-slate-700">Comentarios adicionales</label>
                  <textarea rows={5} className="w-full rounded-[1.6rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:bg-white" {...register('notes')} />
                </div>
              </section>
            )}

            {step === 3 && (
              <section>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-slate-500">Paso 4</p>
                <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] text-slate-950">Privacidad y confirmación</h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">Antes de enviar, leé los siguientes puntos sobre el uso de tus datos.</p>

                <div className="mt-6 space-y-3">
                  <div className="flex gap-3 rounded-[1.4rem] border border-slate-200 bg-slate-50 px-5 py-4">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    <p className="text-sm leading-6 text-slate-700">Los datos que ingresás serán utilizados <strong>exclusivamente</strong> para gestionar el servicio solicitado y ponernos en contacto con vós al respecto.</p>
                  </div>
                  <div className="flex gap-3 rounded-[1.4rem] border border-amber-200 bg-amber-50 px-5 py-4">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                    <p className="text-sm leading-6 text-amber-900">Al enviar este formulario, te <strong>comprometés a no incluir datos privados sensibles</strong> (números de cuenta, contraseñas, información médica, etc.) en ningún campo. El municipio no se hace responsable por información sensible incorporada voluntariamente por el solicitante.</p>
                  </div>
                  <div className="flex gap-3 rounded-[1.4rem] border border-slate-200 bg-slate-50 px-5 py-4">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
                    <p className="text-sm leading-6 text-slate-700">El Municipio de Zapicán <strong>jamás solicitará</strong> contraseñas, números de tarjeta de crédito, ni datos sensibles de ninguna índole a través de este sistema.</p>
                  </div>
                </div>

                <label className="mt-6 flex cursor-pointer items-start gap-4 rounded-[1.5rem] border-2 border-slate-200 bg-white px-5 py-4 transition hover:border-slate-400 has-[:checked]:border-emerald-400 has-[:checked]:bg-emerald-50">
                  <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 rounded border-slate-300 accent-emerald-600" {...register('acceptedTerms')} />
                  <span className="text-sm leading-6 text-slate-700">Leí y acepto los términos anteriores. Declaro que la información y la documentación presentadas son correctas y autorizo su revisión administrativa para este trámite.</span>
                </label>
                {errors.acceptedTerms && <p className="mt-2 text-sm text-rose-600">{errors.acceptedTerms.message}</p>}
              </section>
            )}
          </motion.div>
        </AnimatePresence>

        {submitError && (
          <div className="mt-6 rounded-[1.3rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {submitError}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => {
              if (step === 1) {
                setStep(0);
                return;
              }
              previousStep();
            }}
            disabled={step === 0 || submitting}
            className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Volver
          </button>
          <div className="flex flex-col items-end gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                clearProcedureDraft();
                window.location.reload();
              }}
              className="inline-flex items-center justify-center rounded-full border border-transparent px-5 py-3 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
            >
              Limpiar borrador
            </button>
            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_rgba(15,23,42,0.18)]"
                style={{ background: 'linear-gradient(135deg, var(--site-primary), var(--site-secondary))' }}
              >
                Continuar <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting || !values.acceptedTerms}
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_rgba(15,23,42,0.18)] disabled:cursor-not-allowed disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, var(--site-primary), var(--site-secondary))' }}
              >
                {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                {submitting ? 'Enviando solicitud…' : 'Confirmar envío'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}