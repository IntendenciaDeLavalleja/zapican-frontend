import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users2, Mail, Phone, Facebook, Twitter, Linkedin, X, ChevronRight, ChevronUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { AuthorityPublic, MeetingPublic, PageBlockPublic, SitePublic } from '@/lib/api/types';

function formatMeetingDate(date: string | null | undefined) {
  if (!date) return '';
  return new Intl.DateTimeFormat('es-UY', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(date));
}
function formatMeetingTime(date: string | null | undefined) {
  if (!date) return '';
  return new Intl.DateTimeFormat('es-UY', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(date));
}

type Props = {
  authorities: AuthorityPublic[];
  authoritiesBlock?: PageBlockPublic;
  meetings?: MeetingPublic[];
  meetingsBlock?: PageBlockPublic;
  site?: SitePublic;
};

const sectionMotion = {
  initial: { opacity: 0, y: 52, rotateX: 8, transformPerspective: 1100 },
  whileInView: { opacity: 1, y: 0, rotateX: 0, transformPerspective: 1100 },
  viewport: { once: true, amount: 0.13 },
  transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] as const },
};

function avatarUrl(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f1f5f9&color=0f172a&size=200`;
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function AuthorityModal({ authority, onClose }: { authority: AuthorityPublic; onClose: () => void }) {
  const [bioExpanded, setBioExpanded] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const hasSocial = authority.facebook_url || authority.twitter_url || authority.linkedin_url;
  const hasContact = authority.email || authority.phone;
  const hasExtra = authority.bio || hasContact || hasSocial;

  return (
    <motion.div
      className="fixed inset-0 z-100 flex items-end sm:items-center justify-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-md overflow-hidden rounded-t-[2.4rem] bg-white shadow-[0_48px_120px_rgba(15,23,42,0.28)] sm:rounded-[2.4rem]"
        initial={{ y: 64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 64, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 30 }}
      >
        {/* Drag handle (mobile) */}
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-slate-200 sm:hidden" />

        {/* Photo hero */}
        <div className="relative h-[30rem] w-full overflow-hidden bg-slate-100 sm:h-[34rem]">
          <img
            src={authority.photo_url || avatarUrl(authority.name)}
            alt={authority.name}
            className="h-full w-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/8 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute top-3 right-3 rounded-full bg-black/30 p-2 text-white backdrop-blur-sm transition hover:bg-black/50"
          >
            <X className="h-5 w-5" />
          </button>
          <motion.div
            layout
            className="absolute inset-x-0 bottom-0 px-4 pb-4 sm:px-5 sm:pb-5"
          >
            <motion.div
              layout
              animate={{
                backgroundColor: bioExpanded ? 'rgba(255,255,255,0.94)' : 'rgba(255,255,255,0.10)',
                borderColor: bioExpanded ? 'rgba(255,255,255,0.40)' : 'rgba(255,255,255,0.10)',
                boxShadow: bioExpanded
                  ? '0 30px 70px rgba(15,23,42,0.2)'
                  : '0 14px 30px rgba(15,23,42,0.08)',
                backdropFilter: bioExpanded ? 'blur(16px)' : 'blur(4px)',
              }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-[2rem] border"
            >
              {hasExtra && (
                <button
                  type="button"
                  onClick={() => setBioExpanded((current) => !current)}
                  aria-expanded={bioExpanded}
                  aria-label={bioExpanded ? 'Ocultar biografia' : 'Mostrar biografia'}
                  className="absolute left-1/2 top-0 z-10 flex h-11 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/92 text-slate-500 shadow-[0_12px_24px_rgba(15,23,42,0.16)] transition hover:-translate-y-[55%] hover:text-slate-700"
                >
                  <motion.span
                    animate={{ rotate: bioExpanded ? 180 : 0 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                  >
                    <ChevronUp className="h-5 w-5" />
                  </motion.span>
                </button>
              )}

              <div className="px-6 pb-5 pt-6">
                <h2 className="text-xl font-bold leading-snug text-slate-900">{authority.name}</h2>
                <p className="mt-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[#0d3b66]">
                  {authority.role}
                </p>
              </div>

              <AnimatePresence initial={false}>
                {bioExpanded && (
                  <motion.div
                    key="authority-extra"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden border-t border-slate-200/80"
                  >
                    <div className="max-h-[38vh] space-y-5 overflow-y-auto px-6 py-5">
                      {authority.bio && (
                        <p className="text-sm leading-7 text-slate-600">{authority.bio}</p>
                      )}

                      {hasContact && (
                        <div className="space-y-2.5">
                          {authority.email && (
                            <a
                              href={`mailto:${authority.email}`}
                              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100"
                            >
                              <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                              <span className="truncate">{authority.email}</span>
                            </a>
                          )}
                          {authority.phone && (
                            <a
                              href={`tel:${authority.phone}`}
                              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100"
                            >
                              <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                              <span>{authority.phone}</span>
                            </a>
                          )}
                        </div>
                      )}

                      {hasSocial && (
                        <div className="flex items-center gap-2.5">
                          {authority.facebook_url && (
                            <a
                              href={authority.facebook_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="Facebook"
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Facebook className="h-4 w-4" />
                            </a>
                          )}
                          {authority.twitter_url && (
                            <a
                              href={authority.twitter_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="Twitter / X"
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-800"
                            >
                              <Twitter className="h-4 w-4" />
                            </a>
                          )}
                          {authority.linkedin_url && (
                            <a
                              href={authority.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="LinkedIn"
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
                            >
                              <Linkedin className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!hasExtra && (
                <p className="border-t border-slate-100 px-6 py-5 text-center text-sm italic text-slate-400">
                  Sin informacion adicional disponible.
                </p>
              )}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main block ───────────────────────────────────────────────────────────────

export default function AuthoritiesBlock({ authorities, authoritiesBlock, meetings = [], meetingsBlock, site }: Props) {
  const [selectedAuthority, setSelectedAuthority] = useState<AuthorityPublic | null>(null);

  const mayor = authorities[0] ?? null;
  const councilors = authorities.slice(1);
  const nextMeeting = meetings[0] ?? null;

  return (
    <>
      <motion.section {...sectionMotion} id="concejo" className="scroll-mt-28 px-4 py-12 lg:px-8 lg:py-16">
        <div
          className="municipal-glass-panel mx-auto max-w-7xl rounded-[3rem] p-8 sm:p-10 xl:p-16 shadow-[0_34px_80px_rgba(15,23,42,0.12)] ring-1 ring-black/5 min-w-0"
          style={mayor?.photo_url ? {
            backgroundImage: `var(--glass-overlay), url(${mayor.photo_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          } : undefined}
        >
          <div className="flex flex-col gap-10 lg:gap-14 min-w-0">

            {/* Header + Meetings preview */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-center">
              <div className="min-w-0">
                {authoritiesBlock?.subtitle && (
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-slate-500 wrap-break-word">{authoritiesBlock.subtitle}</p>
                )}
                {authoritiesBlock?.title && (
                  <h3 className="mt-3 text-3xl sm:text-4xl font-black tracking-[-0.04em] text-slate-950 wrap-break-word">{authoritiesBlock.title}</h3>
                )}
                {!!authoritiesBlock?.content?.text && (
                  <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 wrap-break-word">{authoritiesBlock.content.text as string}</p>
                )}
              </div>

              {/* Sessions card */}
              <div className="municipal-panel-dark rounded-4xl bg-[linear-gradient(135deg,#0f172a,#134e4a)] p-6 sm:p-7 text-white shadow-[0_30px_70px_rgba(15,23,42,0.24)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    {meetingsBlock?.subtitle
                      ? <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-white/55">{meetingsBlock.subtitle}</p>
                      : <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-white/55">Participación Ciudadana</p>
                    }
                    {meetingsBlock?.title
                      ? <h4 className="mt-2 text-xl font-semibold sm:text-2xl">{meetingsBlock.title}</h4>
                      : <h4 className="mt-2 text-xl font-semibold sm:text-2xl">Sesiones del Concejo</h4>
                    }
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-md shrink-0">
                    <Users2 className="h-6 w-6 text-[#f9d27c]" />
                  </div>
                </div>

                {nextMeeting ? (
                  <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
                    <p className="text-base font-semibold leading-6 text-white/95">{nextMeeting.title}</p>
                    <p className="mt-2.5 text-sm text-white/68">
                      {formatMeetingDate(nextMeeting.meeting_datetime)}
                      {formatMeetingTime(nextMeeting.meeting_datetime) && (
                        <> &mdash; {formatMeetingTime(nextMeeting.meeting_datetime)}</>
                      )}
                    </p>
                    <p className="mt-3 text-sm text-white/72">{nextMeeting.location_name || nextMeeting.address || 'Sala municipal'}</p>
                  </div>
                ) : (
                  <p className="mt-6 text-sm text-white/60">No hay sesiones próximas cargadas.</p>
                )}

                <div className="mt-5 flex items-center gap-2.5 text-sm text-white/55">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>{site?.address || site?.name || 'Municipio'}</span>
                </div>
              </div>
            </div>

            {/* ── Alcalde ─────────────────────────────────────────── */}
            {mayor && (
              <motion.button
                type="button"
                onClick={() => setSelectedAuthority(mayor)}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.44 }}
                whileHover={{ y: -6, transition: { type: 'spring', stiffness: 300, damping: 22 } }}
                className="municipal-authority-card w-full cursor-pointer rounded-[2.2rem] bg-white p-6 text-left shadow-[0_22px_54px_rgba(15,23,42,0.13)] ring-1 ring-black/5 sm:p-8 flex flex-col sm:flex-row gap-6 items-center"
              >
                {/* Photo */}
                <div className="h-32 w-32 shrink-0 overflow-hidden rounded-[1.6rem] bg-[linear-gradient(135deg,#dbeafe,#fce7f3)] shadow-[0_18px_36px_rgba(15,23,42,0.1)]">
                  <img
                    src={mayor.photo_url || avatarUrl(mayor.name)}
                    alt={mayor.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-slate-400">
                    Autoridad Principal
                  </p>
                  <h4 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
                    {mayor.name}
                  </h4>
                  <p className="mt-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-[#0d3b66]">
                    {mayor.role}
                  </p>
                  {mayor.bio && (
                    <p className="mt-3 text-sm leading-6 text-slate-500 line-clamp-2">{mayor.bio}</p>
                  )}
                </div>
                {/* Arrow hint */}
                <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-400 shrink-0">
                  Ver perfil
                  <ChevronRight className="h-4 w-4" />
                </div>
              </motion.button>
            )}

            {/* ── Concejales/as ────────────────────────────────────── */}
            {councilors.length > 0 && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 xl:gap-6 min-w-0">
                {councilors.map((person, index) => (
                  <motion.button
                    key={person.id}
                    type="button"
                    onClick={() => setSelectedAuthority(person)}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ delay: index * 0.07, duration: 0.4 }}
                    whileHover={{ y: -8, transition: { type: 'spring', stiffness: 280, damping: 20 } }}
                    className="municipal-authority-card cursor-pointer rounded-4xl bg-white p-6 text-center shadow-[0_22px_54px_rgba(15,23,42,0.1)] ring-1 ring-black/5 flex flex-col items-center"
                  >
                    <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-[1.4rem] bg-[linear-gradient(135deg,#dbeafe,#fce7f3)] shadow-[0_14px_28px_rgba(15,23,42,0.08)]">
                      <img
                        src={person.photo_url || avatarUrl(person.name)}
                        alt={person.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <h4 className="mt-4 text-base font-semibold text-slate-950 leading-snug">
                      {person.name}
                    </h4>
                    <p className="mt-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.3em] text-[#0d3b66]">
                      {person.role}
                    </p>
                    {person.bio && (
                      <p className="mt-2.5 text-xs leading-5 text-slate-500 line-clamp-2">{person.bio}</p>
                    )}
                    <span className="mt-4 text-[0.65rem] font-semibold uppercase tracking-wider text-slate-300">
                      Ver perfil
                    </span>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!mayor && councilors.length === 0 && (
              <div className="rounded-[1.8rem] border border-dashed border-slate-300 px-6 py-12 text-center text-slate-500">
                No hay autoridades visibles cargadas desde el backend.
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* Modal */}
      <AnimatePresence>
        {selectedAuthority && (
          <AuthorityModal
            key={selectedAuthority.id}
            authority={selectedAuthority}
            onClose={() => setSelectedAuthority(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
