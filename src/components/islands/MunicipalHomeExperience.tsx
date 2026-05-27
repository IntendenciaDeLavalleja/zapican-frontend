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
import { authoritiesApi, agendaApi, eventsApi, meetingsApi, newsApi, proceduresApi, siteApi } from '@/lib/api';
import { repairApiPayload, sanitizePageBlocks, sanitizeProcedureTypes } from '@/lib/utils';
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
  const [currentSite, setCurrentSite] = useState(site);
  const [currentTheme, setCurrentTheme] = useState(theme);
  const [currentNews, setCurrentNews] = useState(news);
  const [currentEvents, setCurrentEvents] = useState(events);
  const [currentAgendaItems, setCurrentAgendaItems] = useState(agendaItems);
  const [currentMeetings, setCurrentMeetings] = useState(meetings);
  const [currentAuthorities, setCurrentAuthorities] = useState(authorities);
  const [currentProcedures, setCurrentProcedures] = useState(procedures);
  const [blocks, setBlocks] = useState(initialBlocks);

  useEffect(() => {
    Promise.all([
      siteApi.config(),
      newsApi.list(),
      eventsApi.list(),
      meetingsApi.list(),
      authoritiesApi.list(),
      siteApi.blocks('home'),
      proceduresApi.list(),
      agendaApi.list(),
    ])
      .then(([configResp, newsResp, eventsResp, meetingsResp, authsResp, blocksResp, proceduresResp, agendaResp]) => {
        setCurrentSite(repairApiPayload(configResp.site));
        setCurrentTheme(repairApiPayload(configResp.theme));
        setCurrentNews(repairApiPayload(newsResp.news ?? []));
        setCurrentEvents(repairApiPayload(eventsResp.events ?? []));
        setCurrentMeetings(repairApiPayload(meetingsResp.meetings ?? []));
        setCurrentAuthorities(repairApiPayload(authsResp.authorities ?? []));
        setBlocks(sanitizePageBlocks(repairApiPayload(blocksResp.blocks ?? [])));
        setCurrentProcedures(sanitizeProcedureTypes(repairApiPayload(proceduresResp.items ?? [])));
        setCurrentAgendaItems(repairApiPayload(agendaResp.agenda ?? []));
      })
      .catch(() => { /* mantiene los datos del build si la API no responde */ });
  }, []);

  const getBlock = (type: string) => blocks.find((b) => b.block_type === type);
  const cardStyle = currentTheme?.card_style ?? 'soft';
  const heroStyle = currentTheme?.hero_style ?? 'image-full';

  return (
    <>
      <AnimatedBackground />
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} site={currentSite} />
      <div className="municipal-home-root relative flex min-h-screen w-full flex-col overflow-x-hidden text-slate-900" data-card-style={cardStyle} data-hero-style={heroStyle}>
        <MunicipalNavbar site={currentSite} navBlock={getBlock('navigation')} theme={currentTheme} enableNightMode={enableNightMode} />
        <main className="flex-1 w-full max-w-[100vw] overflow-hidden pt-20">
          <HeroBlock
            site={currentSite}
            theme={currentTheme}
            news={currentNews}
            events={currentEvents}
            heroBlock={getBlock('hero')}
            quickLinksBlock={getBlock('quick_links')}
            eventsBlock={getBlock('events_preview')}
          />
          <AboutBlock site={currentSite} highlightsBlock={getBlock('tourism_highlights')} />
          <ProceduresBlock procedures={currentProcedures} proceduresBlock={getBlock('procedures_preview')} />
          <NewsEventsBlock news={currentNews} agendaItems={currentAgendaItems} newsBlock={getBlock('featured_news')} eventsBlock={getBlock('events_preview')} />
          <AuthoritiesBlock
            authorities={currentAuthorities}
            authoritiesBlock={getBlock('authorities')}
            meetings={currentMeetings}
            meetingsBlock={getBlock('meetings_preview')}
            site={currentSite}
          />
          <ContactBlock site={currentSite} contactBlock={getBlock('contact_card')} onContactOpen={() => setContactOpen(true)} />
        </main>
        <MunicipalFooter site={currentSite} navBlock={getBlock('navigation')} theme={currentTheme} />
      </div>
    </>
  );
}