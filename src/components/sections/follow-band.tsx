import { SocialLinks } from '@/components/layout/social-links';
import { Container } from '@/components/ui/container';
import { RichTitle } from '@/components/ui/section-heading';
import type { Dictionary } from '@/i18n/dictionaries';
import { cn } from '@/lib/utils';

type FollowBandProps = {
  dict: Dictionary;
  /** À activer quand la section précédente est sur fond blanc et porte déjà sa marge basse. */
  flushTop?: boolean;
};

/** « Suivez le collège » : bandeau sombre avec les icônes des réseaux sociaux (liens dans content/site.ts). */
export function FollowBand({ dict, flushTop = false }: FollowBandProps) {
  const t = dict.follow;

  return (
    <section className={cn('pb-16 sm:pb-24', flushTop ? '' : 'pt-16 sm:pt-24')}>
      <Container>
        <div className="on-dark reveal relative flex flex-col gap-6 overflow-hidden rounded-3xl bg-indigo-900 px-6 py-10 text-white sm:px-12 sm:py-12 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <div aria-hidden="true" className="dot-grid absolute inset-y-0 right-0 w-56 text-sky-400 opacity-20" />
          <div aria-hidden="true" className="absolute -bottom-12 -left-10 size-32 rounded-full bg-navy-700" />
          <div className="relative flex max-w-xl flex-col gap-3">
            <p className="flex items-center gap-3 text-[13px] leading-4 font-semibold tracking-[0.08em] text-sky-400 uppercase">
              <span aria-hidden="true" className="h-0.5 w-8 rounded-full bg-gold-400" />
              {t.eyebrow}
            </p>
            <h2 className="font-display text-[1.7rem] leading-[1.2] font-bold text-balance sm:text-4xl">
              <RichTitle text={t.title} highlight="goldOnDark" />
            </h2>
            <p className="text-pretty">{t.text}</p>
          </div>
          <SocialLinks labels={dict.footer.social} className="relative shrink-0" />
        </div>
      </Container>
    </section>
  );
}
