import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
import { formsApi } from '@/lib/api';
import type { CustomFormDetail, CustomFormField } from '@/lib/api/types';

interface Props {
  municipalitySlug: string;
  form: CustomFormDetail;
}

export default function FormRenderer({ municipalitySlug, form }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Record<string, any>>();

  const validate = (values: Record<string, any>): string | null => {
    for (const f of form.fields) {
      if (f.required) {
        const v = values[f.name];
        if (v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)) {
          return `Campo requerido: ${f.label ?? f.name}`;
        }
      }
      if (f.type === 'email' && values[f.name]) {
        if (!/^\S+@\S+\.\S+$/.test(String(values[f.name]))) return `Email inválido en ${f.label ?? f.name}`;
      }
    }
    return null;
  };

  const onSubmit = async (values: Record<string, any>) => {
    if (values.website) return; // honeypot
    const err = validate(values);
    if (err) {
      toast.error(err);
      return;
    }
    setSubmitting(true);
    try {
      const res = await formsApi.submit(municipalitySlug, form.slug, { values });
      if (res.ok) {
        const msg = res.message ?? form.success_message ?? 'Formulario enviado.';
        setDone(msg);
        toast.success(msg);
        reset();
      } else {
        toast.error(res.message ?? 'No se pudo enviar.');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Error de red');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="border rounded p-6 text-center" style={{ background: 'var(--municipality-background)' }}>
        <p className="font-semibold text-lg mb-2" style={{ color: 'var(--municipality-secondary)' }}>¡Gracias!</p>
        <p>{done}</p>
        <button className="mt-4 underline" onClick={() => setDone(null)}>Enviar otro</button>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 max-w-2xl">
        <input type="text" {...register('website')} className="hidden" tabIndex={-1} autoComplete="off" />
        {form.fields.map((f) => (
          <FieldInput key={f.name} field={f} register={register} error={errors[f.name]?.message as string | undefined} />
        ))}
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2 rounded font-semibold text-white disabled:opacity-50"
          style={{ background: 'var(--municipality-primary)' }}
        >
          {submitting ? 'Enviando…' : 'Enviar'}
        </button>
      </form>
    </>
  );
}

function FieldInput({
  field,
  register,
  error,
}: {
  field: CustomFormField;
  register: any;
  error?: string;
}) {
  const label = field.label ?? field.name;
  const common = 'w-full border rounded px-3 py-2';
  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        {label}{field.required && <span className="text-red-600"> *</span>}
      </label>
      {field.type === 'textarea' && (
        <textarea rows={5} className={common} placeholder={field.placeholder} {...register(field.name)} />
      )}
      {field.type === 'select' && (
        <select className={common} {...register(field.name)}>
          <option value="">— Seleccionar —</option>
          {(field.options ?? []).map((o) => (
            <option key={String(o)} value={String(o)}>{String(o)}</option>
          ))}
        </select>
      )}
      {field.type === 'checkbox' && (
        <input type="checkbox" {...register(field.name)} />
      )}
      {(field.type === 'text' || field.type === 'email' || field.type === 'phone' || field.type === 'date' || field.type === 'file') && (
        <input
          type={field.type === 'phone' ? 'tel' : field.type}
          className={common}
          placeholder={field.placeholder}
          {...register(field.name)}
        />
      )}
      {field.help && <p className="text-xs opacity-70 mt-1">{field.help}</p>}
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
