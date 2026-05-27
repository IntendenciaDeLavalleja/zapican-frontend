import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast, { Toaster } from 'react-hot-toast';
import { transparencyApi } from '@/lib/api';

const schema = z.object({
  requesterType: z.string().min(1, 'Seleccioná el tipo de solicitante'),
  fullNameOrBusinessName: z.string().min(2, 'Ingresá tu nombre o razón social'),
  identifier: z.string().min(2, 'Ingresá tu documento, RUT u otro identificador'),
  address: z.string().min(5, 'Ingresá tu domicilio'),
  email: z.string().email('Ingresá un correo electrónico válido'),
  phone: z.string().optional(),
  preferredResponseChannel: z.string().min(1, 'Seleccioná la forma de respuesta'),
  requestedInformation: z
    .string()
    .min(20, 'La descripción es demasiado corta (mínimo 20 caracteres)')
    .max(4000, 'La descripción excede el máximo permitido (4000 caracteres)'),
  additionalLocationData: z.string().optional(),
  preferredFormat: z.string().optional(),
  municipality: z.string().min(1, 'El municipio es requerido'),
  acceptedTerms: z.coerce.string()
    .transform(val => val === "true")
    .refine(val => val === true, {
      message: 'Debés aceptar la exclusión de responsabilidad para enviar la solicitud',
    }),
  // honeypot
  _website: z.string().max(0).optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  municipalityName: string;
}

// ---------------------------------------------------------------------------
// Endpoint: /api/v1/transparency/submit
// Para conectar un backend diferente, reemplazá transparencyApi.submit()
// en frontend/src/lib/api/index.ts
// ---------------------------------------------------------------------------

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[var(--municipality-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--municipality-primary)]/20 transition-all dark:input-dark';

const selectClass =
  'w-full rounded-lg border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-900 focus:border-[var(--municipality-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--municipality-primary)]/20 transition-all';

const labelClass = 'block text-sm font-semibold text-slate-700 mb-1.5';

const errorClass = 'mt-1 text-xs text-red-600 font-medium';

export default function TransparencyForm({ municipalityName }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      requesterType: '',
      preferredResponseChannel: '',
      municipality: municipalityName,
    },
  });

  const requestedInfo = watch('requestedInformation') ?? '';

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const payload = {
        requesterType: values.requesterType,
        fullNameOrBusinessName: values.fullNameOrBusinessName,
        identifier: values.identifier,
        address: values.address,
        email: values.email,
        phone: values.phone || undefined,
        preferredResponseChannel: values.preferredResponseChannel,
        requestedInformation: values.requestedInformation,
        additionalLocationData: values.additionalLocationData || undefined,
        preferredFormat: values.preferredFormat || undefined,
        municipality: values.municipality,
        acceptedTerms: true,
        createdAt: new Date().toISOString(),
      };
      const res = await transparencyApi.submit(payload);
      if (res.ok) {
        setReferenceNumber(res.referenceNumber ?? '');
        setSubmitted(true);
        reset();
      } else {
        toast.error(res.message ?? 'No fue posible enviar la solicitud. Revisá los datos e intentá nuevamente.');
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ??
          'No fue posible enviar la solicitud. Revisá los datos o intentá más tarde.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center shadow-sm">
        <div className="mb-4 flex justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
        </div>
        <h3 className="text-lg font-bold text-green-800">Solicitud enviada correctamente</h3>
        {referenceNumber && (
          <p className="mt-2 text-sm font-semibold text-green-700">
            Número de referencia: <span className="font-mono">{referenceNumber}</span>
          </p>
        )}
        <p className="mt-3 text-sm text-green-700 max-w-md mx-auto">
          El Municipio o la Intendencia Departamental se comunicarán por los medios indicados dentro del plazo legal establecido.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-5 rounded-lg px-5 py-2 text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'var(--municipality-primary)' }}
        >
          Realizar otra solicitud
        </button>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5">
        {/* Honeypot */}
        <input type="text" {...register('_website')} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

        {/* Tipo de solicitante */}
        <fieldset className="border border-slate-200 p-5 rounded-lg bg-white/40">
          <legend className="text-sm font-bold text-slate-700 px-2 uppercase tracking-wide">Tipo de Solicitante</legend>
          <div className="flex flex-col gap-3 mt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="radio" value="Persona física" {...register('requesterType')} className="w-4 h-4 accent-(--municipality-primary)" />
              <span className="text-sm text-slate-700">Persona física</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="radio" value="Persona jurídica" {...register('requesterType')} className="w-4 h-4 accent-(--municipality-primary)" />
              <span className="text-sm text-slate-700">Persona jurídica</span>
            </label>
          </div>
          {errors.requesterType && <p className={errorClass} role="alert">{errors.requesterType.message}</p>}
        </fieldset>

        {/* Nombre y documento */}
        <fieldset className="border border-slate-200 p-5 rounded-lg bg-white/40 grid md:grid-cols-2 gap-4">
          <legend className="text-sm font-bold text-slate-700 px-2 uppercase tracking-wide">Datos del solicitante</legend>
          <div className="md:col-span-2">
            <label htmlFor="tr-fullName" className={labelClass}>
              Nombre completo / Razón social <span className="text-red-500">*</span>
            </label>
            <input id="tr-fullName" type="text" className={inputClass} {...register('fullNameOrBusinessName')} />
            {errors.fullNameOrBusinessName && <p className={errorClass} role="alert">{errors.fullNameOrBusinessName.message}</p>}
          </div>
          <div>
            <label htmlFor="tr-identifier" className={labelClass}>
              Documento de identidad / RUT <span className="text-red-500">*</span>
            </label>
            <input id="tr-identifier" type="text" className={inputClass} {...register('identifier')} />
            {errors.identifier && <p className={errorClass} role="alert">{errors.identifier.message}</p>}
          </div>
          <div>
            <label htmlFor="tr-address" className={labelClass}>
              Domicilio <span className="text-red-500">*</span>
            </label>
            <input id="tr-address" type="text" className={inputClass} {...register('address')} />
            {errors.address && <p className={errorClass} role="alert">{errors.address.message}</p>}
          </div>
          <div>
            <label htmlFor="tr-email" className={labelClass}>
              Correo electrónico <span className="text-red-500">*</span>
            </label>
            <input id="tr-email" type="email" className={inputClass} {...register('email')} />
            {errors.email && <p className={errorClass} role="alert">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="tr-phone" className={labelClass}>
              Teléfono
            </label>
            <input id="tr-phone" type="tel" className={inputClass} {...register('phone')} />
          </div>
        </fieldset>

        {/* Información solicitada */}
        <fieldset className="border border-slate-200 p-5 rounded-lg bg-white/40">
          <legend className="text-sm font-bold text-slate-700 px-2 uppercase tracking-wide">Información pública</legend>
          <p className="text-xs text-slate-500 mb-4">Puede solicitar información pública al amparo de la Ley N° 18.381.</p>
          <div>
            <label htmlFor="tr-requestedInfo" className={labelClass}>
              Descripción de la información requerida <span className="text-red-500">*</span>
            </label>
            <textarea
              id="tr-requestedInfo"
              rows={4}
              className={inputClass}
              placeholder="Describa con precisión la información que solicita."
              {...register('requestedInformation')}
            />
            {errors.requestedInformation && <p className={errorClass} role="alert">{errors.requestedInformation.message}</p>}
          </div>
          
          <div className="mt-4">
            <label htmlFor="tr-responseChannel" className={labelClass}>
              Canal de respuesta preferido <span className="text-red-500">*</span>
            </label>
            <select id="tr-responseChannel" className={selectClass} {...register('preferredResponseChannel')}>
              <option value="Correo electrónico">Correo electrónico</option>
              <option value="Presencial">Presencial</option>
            </select>
            {errors.preferredResponseChannel && <p className={errorClass} role="alert">{errors.preferredResponseChannel.message}</p>}
          </div>
        </fieldset>

        {/* Municipio oculto (o solo visible si hubiera selector, pero lo dejamos hidden o pre-fijado arriba) */}
        <input type="hidden" {...register('municipality')} value={municipalityName} />

        {/* Cláusula de consentimiento informado */}
        <fieldset className="border border-slate-300 p-5 rounded-lg bg-slate-50/50 mt-4">
          <legend className="text-sm font-bold text-slate-700 px-2 uppercase tracking-wide">Cláusula de consentimiento informado</legend>
          <div className="text-sm text-slate-600 space-y-4 mb-6 leading-relaxed">
            <p>
              Los datos personales que suministre por este medio quedan protegidos por las disposiciones de la Ley N° 18.331
              (Ley de Protección de Datos Personales - LPDP) y serán incorporados a una base de datos respecto de la cual se
              garantiza su adecuada protección y la adopción de las medidas de seguridad necesarias.
            </p>
            <p>
              El municipio de {municipalityName} tratará dicha información a los efectos de comunicarse con la persona que gestiona y enviarle
              información relevante vinculada a su solicitud.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="radio" value="true" {...register('acceptedTerms')} className="w-4 h-4 accent-(--municipality-primary)" />
              <span className="text-sm font-semibold text-slate-800">Acepto los términos</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="radio" value="false" {...register('acceptedTerms')} onChange={() => reset({ acceptedTerms: undefined as any })} className="w-4 h-4 accent-slate-400" />
              <span className="text-sm font-medium text-slate-600">No acepto los términos</span>
            </label>
          </div>
          {errors.acceptedTerms && <p className={errorClass} role="alert">{errors.acceptedTerms.message}</p>}
        </fieldset>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 w-full justify-between items-center border-t border-slate-200">
          <button
            type="button"
            onClick={() => reset()}
            disabled={submitting}
            className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            &lt;&lt; Volver / Limpiar
          </button>
          
          <button
            type="submit"
            disabled={submitting}
            className="rounded px-8 py-3 text-sm font-bold text-white shadow-sm transition-all hover:opacity-90 min-w-50"
            style={{ background: 'var(--municipality-primary)' }}
          >
            {submitting ? 'Enviando...' : 'Finalizar solicitud >>'}
          </button>
        </div>
      </form>
    </>
  );
}
