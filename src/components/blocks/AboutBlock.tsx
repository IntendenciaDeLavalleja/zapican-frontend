import { motion } from 'framer-motion';
import type { PageBlockPublic, SitePublic } from '@/lib/api/types';

type Props = {
  site: SitePublic;
  highlightsBlock?: PageBlockPublic;
};

const sectionMotion = {
  initial: { opacity: 0, y: 52, rotateX: 8, transformPerspective: 1100 },
  whileInView: { opacity: 1, y: 0, rotateX: 0, transformPerspective: 1100 },
  viewport: { once: true, amount: 0.13 },
  transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] as const },
};

export default function AboutBlock({ site, highlightsBlock }: Props) {
  return (
    <motion.section {...sectionMotion} id="nosotros" className="scroll-mt-28 px-4 pb-16 lg:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
        <div
          className="municipal-showcase-card rounded-[2.5rem] p-10 shadow-[0_26px_70px_rgba(148,163,184,0.18)] ring-1 ring-black/5 lg:p-12 min-w-0"
          style={site.hero_url ? {
            backgroundImage: `var(--showcase-overlay), url(${site.hero_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          } : undefined}
        >
          {!!highlightsBlock?.content?.eyebrow && (
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-[#b7791f]">{highlightsBlock.content.eyebrow as string}</p>
          )}
          {highlightsBlock?.title && (
            <h3 className="mt-4 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl break-words">{highlightsBlock.title}</h3>
          )}
          {highlightsBlock?.subtitle && (
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">{highlightsBlock.subtitle}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 min-w-0">
          {(highlightsBlock?.content?.items as any[] | undefined)?.map((card: any, index: number) => {
            const fallbackTones = [
              { from: '#0d3b66', to: '#155e75' },
              { from: '#7c3aed', to: '#c026d3' },
              { from: '#0f766e', to: '#1d4ed8' },
              { from: '#d97706', to: '#ea580c' },
            ];
            const fallback = fallbackTones[index % fallbackTones.length];
            const fromColor = (card.color_from as string | undefined) || fallback.from;
            const toColor = (card.color_to as string | undefined) || fallback.to;
            return (
              <motion.div
                key={card.title}
                whileHover={{ y: -6, rotateX: 3, rotateY: -3 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                className="rounded-[2.2rem] bg-white p-7 shadow-[0_24px_50px_rgba(15,23,42,0.12)] ring-1 ring-black/5"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div
                  className="inline-flex rounded-2xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white shadow-[0_16px_30px_rgba(15,23,42,0.22)]"
                  style={{ background: `linear-gradient(135deg, ${fromColor}, ${toColor})` }}
                >
                  &nbsp;
                </div>
                <h4 className="mt-5 text-xl font-semibold text-slate-900">{card.title}</h4>
                <p className="mt-3 text-sm leading-6 text-slate-600">{card.text}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
