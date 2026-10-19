import { Download, Wallet } from 'lucide-react';
import { fees } from '@content/fees';
import { levels, sectionLang, type SectionId } from '@content/levels';
import { Chip } from '@/components/ui/chip';
import { instalmentsFor, sum } from '@/features/fees/simulate';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { fill, formatDate, formatMoney } from '@/lib/format';
import { tones, trackTone, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';

type FeeGridProps = { locale: Locale; labels: Dictionary['pages']['fees'] };

/**
 * La grille des frais : frais d'inscription, puis une carte par niveau avec ses tranches et son total.
 * Tous les montants viennent de content/fees.ts ; un montant absent s'affiche « [à fournir] ».
 */
export function FeeGrid({ locale, labels }: FeeGridProps) {
  const t = labels.grid;
  const money = (amount: number | null) => formatMoney(amount, locale, labels.amountPlaceholder);
  const levelNames = t.levels as Record<string, string>;

  return (
    <div className="flex flex-col gap-10">
      <div className="reveal flex flex-col gap-4 rounded-2xl border border-gold-300 bg-gold-100 p-6 sm:flex-row sm:items-center sm:gap-6 sm:p-8">
        <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gold-400 text-ink">
          <Wallet className="size-6" strokeWidth={1.75} />
        </span>
        <div className="flex flex-1 flex-col gap-1">
          <h3 className="font-display text-xl leading-7 font-semibold text-navy-700">{labels.registration.title}</h3>
          <p className="text-[15px] leading-6">{fees.registration.newStudentsOnly ? labels.registration.new : labels.registration.yearly}</p>
        </div>
        <p className="font-display text-[1.7rem] leading-9 font-bold whitespace-nowrap text-navy-700">{money(fees.registration.amount)}</p>
      </div>

      {(['francophone', 'anglophone'] as SectionId[]).map((section) => {
        const group = levels.filter((level) => level.section === section);
        if (group.length === 0) return null;
        return (
          <div key={section} className="flex flex-col gap-4">
            <h3 lang={sectionLang[section]} className="reveal flex items-center gap-3 font-display text-2xl leading-8 font-bold text-navy-700">
              <span aria-hidden="true" className={cn('h-7 w-1.5 rounded-full', tones[trackTone[section]].bar)} />
              {t.sections[section]}
            </h3>
            <ul className="grid gap-4 md:grid-cols-2">
              {group.map((level) => {
                const tone: Tone = level.stream === 'technical' ? 'gold' : trackTone[section];
                const look = tones[tone];
                const amounts = instalmentsFor(fees, level.id, '');
                const special = Object.keys(fees.tuition[level.id]?.byClass ?? {}).filter((name) => level.classes.includes(name));
                return (
                  <li key={level.id} className="reveal relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-line bg-white p-6">
                    <span aria-hidden="true" className={cn('absolute inset-x-0 top-0 h-1.5', look.bar)} />
                    <div className="flex flex-col gap-2 pt-1">
                      <h4 className="font-display text-xl leading-7 font-semibold">{levelNames[level.id] ?? level.id}</h4>
                      <ul lang={sectionLang[section]} className="flex flex-wrap gap-1.5">
                        {level.classes.map((name) => (
                          <li key={name}>
                            <Chip tone={tone} className="px-2.5 py-1">
                              {name}
                            </Chip>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <dl className="flex flex-col divide-y divide-line border-y border-line">
                      {fees.deadlines.map((deadline, index) => (
                        <div key={index} className="flex items-baseline justify-between gap-4 py-2.5">
                          <dt className="flex flex-col">
                            <span className="font-semibold">{t.instalments[index] ?? `${index + 1}`}</span>
                            <span className="text-sm leading-5 text-muted">
                              {fill(t.before, { date: formatDate(deadline, locale, t.deadlinePlaceholder) })}
                            </span>
                          </dt>
                          <dd className="font-semibold whitespace-nowrap tabular-nums">{money(amounts[index] ?? null)}</dd>
                        </div>
                      ))}
                    </dl>
                    <p className="flex items-baseline justify-between gap-4">
                      <span className="text-[13px] leading-5 font-semibold tracking-[0.06em] text-muted uppercase">{t.total}</span>
                      <span className="font-display text-2xl leading-8 font-bold whitespace-nowrap text-navy-700">{money(sum(amounts))}</span>
                    </p>
                    {special.length > 0 ? (
                      <ul className={cn('flex flex-col gap-1 rounded-xl p-3 text-sm leading-5', look.soft)}>
                        {special.map((name) => (
                          <li key={name} className="flex items-baseline justify-between gap-4">
                            <span>
                              {t.special} · <span lang={sectionLang[section]} className="font-semibold">{name}</span>
                            </span>
                            <span className="font-semibold whitespace-nowrap tabular-nums">{money(sum(instalmentsFor(fees, level.id, name)))}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}

      {fees.gridPdf ? (
        <a
          href={fees.gridPdf}
          download
          className="reveal inline-flex min-h-11 items-center gap-2 self-start font-semibold text-blue-600 underline underline-offset-4"
        >
          <Download aria-hidden="true" className="size-5" strokeWidth={1.75} />
          {t.download}
        </a>
      ) : (
        <p className="reveal flex items-center gap-2 text-[15px] leading-6 text-muted">
          <Download aria-hidden="true" className="size-5" strokeWidth={1.75} />
          {t.downloadMissing}
        </p>
      )}
    </div>
  );
}
