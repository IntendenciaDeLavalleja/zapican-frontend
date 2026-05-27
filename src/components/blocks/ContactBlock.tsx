import { motion } from 'framer-motion';
import { CalendarDays, Mail, MapPin } from 'lucide-react';
import type { PageBlockPublic, SitePublic } from '@/lib/api/types';

type Props = {
  site: SitePublic;
  contactBlock?: PageBlockPublic;
  onContactOpen: () => void;
};

const sectionMotion = {
  initial: { opacity: 0, y: 52, rotateX: 8, transformPerspective: 1100 },
  whileInView: { opacity: 1, y: 0, rotateX: 0, transformPerspective: 1100 },
  viewport: { once: true, amount: 0.13 },
  transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] as const },
};

export default function ContactBlock({ site, contactBlock, onContactOpen }: Props) {
  return (
    <motion.section {...sectionMotion} id="territorio" className="scroll-mt-28 px-4 py-16 lg:px-8 lg:py-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 min-w-0">
        <div
          className="municipal-contact-visual rounded-[2.8rem] bg-[linear-gradient(135deg,_#0d3b66,_#1d7874)] p-8 text-white shadow-[0_34px_80px_rgba(13,59,102,0.28)] lg:p-14 min-w-0"
          style={site.hero_url ? {
            backgroundImage: `linear-gradient(135deg, rgba(13, 59, 102, 0.88), rgba(29, 120, 116, 0.78)), url(${site.hero_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          } : undefined}
        >
          {!!contactBlock?.content?.territory_eyebrow && (
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-white/55 break-words">{contactBlock.content.territory_eyebrow as string}</p>
          )}
          {!!contactBlock?.content?.territory_title && (
            <h3 className="mt-4 text-3xl sm:text-4xl font-black tracking-[-0.04em] lg:text-5xl break-words">{contactBlock.content.territory_title as string}</h3>
          )}
          <div className="mt-10 space-y-6 text-sm leading-7 text-white/80">
            {site.address && (
              <div className="flex gap-3"><MapPin className="mt-1 h-5 w-5 shrink-0 text-[#f9d27c]" /><span className="break-words">{site.address}</span></div>
            )}
            {site.email && (
              <div className="flex gap-3"><Mail className="mt-1 h-5 w-5 shrink-0 text-[#f9d27c]" /><span className="break-all">{site.email}</span></div>
            )}
            {site.opening_hours && (
              <div className="flex gap-3"><CalendarDays className="mt-1 h-5 w-5 shrink-0 text-[#f9d27c]" /><span className="break-words">{site.opening_hours}</span></div>
            )}
          </div>
        </div>

        <div id="contacto" className="municipal-contact-card scroll-mt-28 rounded-[2.8rem] bg-white p-8 shadow-[0_30px_70px_rgba(15,23,42,0.12)] ring-1 ring-black/5 lg:p-14 min-w-0">
          {contactBlock?.subtitle && (
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-slate-500 break-words">{contactBlock.subtitle}</p>
          )}
          {contactBlock?.title && (
            <h3 className="mt-4 text-3xl sm:text-4xl font-black tracking-[-0.04em] text-slate-950 lg:text-5xl break-words">{contactBlock.title}</h3>
          )}
          {!!contactBlock?.content?.body_text && (
            <p className="mt-8 max-w-2xl text-base leading-8 text-slate-600 break-words">{contactBlock.content.body_text as string}</p>
          )}
          <div className="mt-10 flex flex-wrap gap-5">
            <button
              type="button"
              onClick={onContactOpen}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(14,165,233,0.38)] transition hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #1e40af, #0ea5e9)' }}
            >
              Enviar mensaje
            </button>
            {site.email && !!contactBlock?.content?.cta_email_label && (
              <a href={`mailto:${site.email}`} className="inline-flex rounded-full bg-linear-to-br from-[#1e3a8a] to-[#0d3b66] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(13,59,102,0.36)] transition hover:-translate-y-0.5 hover:from-[#1d4ed8] hover:to-[#0f766e]">
                {contactBlock.content.cta_email_label as string}
              </a>
            )}
            {site.phone && !!contactBlock?.content?.cta_phone_label && (
              <a href={`tel:${site.phone}`} className="inline-flex rounded-full border-2 border-[#0d3b66] bg-white px-6 py-3 text-sm font-semibold text-[#0d3b66] shadow-[0_8px_22px_rgba(13,59,102,0.14)] transition hover:-translate-y-0.5 hover:bg-[#0d3b66] hover:text-white">
                {contactBlock.content.cta_phone_label as string}
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
