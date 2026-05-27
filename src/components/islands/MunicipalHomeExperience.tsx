import { useState, useEffect } from 'react';
import AnimatedBackground from '@/components/common/AnimatedBackground';
import MunicipalNavbar from '@/components/common/Navbar';
import MunicipalFooter from '@/components/common/Footer';
import ContactModal from '@/components/islands/ContactModal';
import HeroBlock from '@/components/blocks/HeroBlock';
import AboutBlock from '@/components/blocks/AboutBlock';
import ProceduresBlock from '@/components/blocks/ProceduresBlock';
import NewsEventsBlock from '@/components/blocks/NewsEventsBlock';
import AuthoritiesBlock from '@/components/blocks/AuthoritiesBlock';
import ContactBlock from '@/components/blocks/ContactBlock';
import { siteApi } from '@/lib/api';
import { repairApiPayload, sanitizePageBlocks } from '@/lib/utils';
import type {
  AuthorityPublic,
  CalendarItemPublic,
  EventSummary,
  MeetingPublic,
  ProcedureTypePublic,
  SitePublic,
  NewsSummary,
  PageBlockPublic,
  ThemePublic,
} from '@/lib/api/types';

type Props = {
  site: SitePublic;
  theme?: ThemePublic | null;
  enableNightMode: boolean;
  news: NewsSummary[];
  events: EventSummary[];
  agendaItems: CalendarItemPublic[];
  meetings: MeetingPublic[];
  authorities: AuthorityPublic[];
  procedures: ProcedureTypePublic[];
  blocks: PageBlockPublic[];
};

export default function MunicipalHomeExperience({ site, theme, enableNightMode, news, events, agendaItems, meetings, authorities, procedures, blocks: initialBlocks }: Props) {
  const [contactOpen, setContactOpen] = useState(false);
  const [blocks, setBlocks] = useState(initialBlocks);

  useEffect(() => {
    siteApi.blocks('home')
      .then((resp) => {
        const fresh = sanitizePageBlocks(repairApiPayload(resp.blocks ?? []));
        if (fresh.length > 0) setBlocks(fresh);
      })
      .catch(() => { /* mantiene los datos del build si la API no responde */ });
  }, []);

  const getBlock = (type: string) => blocks.find((b) => b.block_type === type);
  const cardStyle = theme?.card_style ?? 'soft';
  const heroStyle = theme?.hero_style ?? 'image-full';

  return (
    <>
      <AnimatedBackground />
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} site={site} />
      <div className="municipal-home-root relative flex min-h-screen w-full flex-col overflow-x-hidden text-slate-900" data-card-style={cardStyle} data-hero-style={heroStyle}>
        <MunicipalNavbar site={site} navBlock={getBlock('navigation')} theme={theme} enableNightMode={enableNightMode} />
        <main className="flex-1 w-full max-w-[100vw] overflow-hidden pt-20">
          <HeroBlock
            site={site}
            theme={theme}
            news={news}
            events={events}
            heroBlock={getBlock('hero')}
            quickLinksBlock={getBlock('quick_links')}
            eventsBlock={getBlock('events_preview')}
          />
          <AboutBlock site={site} highlightsBlock={getBlock('tourism_highlights')} />
          <ProceduresBlock procedures={procedures} proceduresBlock={getBlock('procedures_preview')} />
          <NewsEventsBlock news={news} agendaItems={agendaItems} newsBlock={getBlock('featured_news')} eventsBlock={getBlock('events_preview')} />
          <AuthoritiesBlock
            authorities={authorities}
            authoritiesBlock={getBlock('authorities')}
            meetings={meetings}
            meetingsBlock={getBlock('meetings_preview')}
            site={site}
          />
          <ContactBlock site={site} contactBlock={getBlock('contact_card')} onContactOpen={() => setContactOpen(true)} />
        </main>
        <MunicipalFooter site={site} navBlock={getBlock('navigation')} theme={theme} />
      </div>
    </>
  );
}