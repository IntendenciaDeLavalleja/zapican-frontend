import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast, { Toaster } from 'react-hot-toast';
import { contactApi } from '@/lib/api';

const schema = z.object({
  name: z.string().min(2, 'Ingresá tu nombre'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  subject: z.string().min(3, 'Asunto requerido'),
  message: z.string().min(10, 'El mensaje es muy corto'),
  category: z.string().default('general'),
  website: z.string().optional(), // honeypot
});
type FormValues = z.infer<typeof schema>;

interface Props {
  municipalitySlug: string;
}

export default function ContactForm({ municipalitySlug }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { category: 'general' },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const res = await contactApi.send(municipalitySlug, values);
      if (res.ok) {
        toast.success('Mensaje enviado. Te responderemos pronto.');
        reset();
      } else {
        toast.error(res.message ?? 'No se pudo enviar el mensaje.');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Error de red');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 max-w-2xl">
        <input type="text" {...register('website')} className="hidden" tabIndex={-1} autoComplete="off" />
        <div>
          <label className="block text-sm font-medium mb-1">Nombre</label>
          <input className="w-full border rounded px-3 py-2" {...register('name')} />
          {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" className="w-full border rounded px-3 py-2" {...register('email')} />
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Teléfono</label>
            <input className="w-full border rounded px-3 py-2" {...register('phone')} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Categoría</label>
          <select className="w-full border rounded px-3 py-2" {...register('category')}>
            <option value="general">General</option>
            <option value="reclamo">Reclamo</option>
            <option value="sugerencia">Sugerencia</option>
            <option value="consulta">Consulta</option>
            <option value="prensa">Prensa</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Asunto</label>
          <input className="w-full border rounded px-3 py-2" {...register('subject')} />
          {errors.subject && <p className="text-sm text-red-600 mt-1">{errors.subject.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mensaje</label>
          <textarea rows={6} className="w-full border rounded px-3 py-2" {...register('message')} />
          {errors.message && <p className="text-sm text-red-600 mt-1">{errors.message.message}</p>}
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2 rounded font-semibold text-white disabled:opacity-50"
          style={{ background: 'var(--municipality-primary)' }}
        >
          {submitting ? 'Enviando…' : 'Enviar mensaje'}
        </button>
      </form>
    </>
  );
}
