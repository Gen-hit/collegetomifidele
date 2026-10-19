'use client';

import { ArrowRight, Calculator, Plus, Trash2 } from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa6';
import { fees } from '@content/fees';
import { levels, sectionLang, type Level, type SectionId, type StreamId } from '@content/levels';
import { ButtonLink, buttonClass } from '@/components/ui/button';
import { inputClass } from '@/components/ui/field';
import { Notice } from '@/components/ui/notice';
import { Segmented } from '@/components/ui/segmented';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { fill, formatDate, formatMoney } from '@/lib/format';
import { cn } from '@/lib/utils';
import { simulate } from './simulate';

type ChildState = { id: number; section: SectionId; stream: StreamId; levelId: string; className: string; isNew: boolean };

type FeeSimulatorProps = {
  locale: Locale;
  labels: Dictionary['pages']['fees']['simulator'];
  /** Libellés partagés avec la grille : noms des tranches, des sections, dates limites. */
  grid: Pick<Dictionary['pages']['fees']['grid'], 'instalments' | 'before' | 'deadlinePlaceholder' | 'sections'>;
  amountPlaceholder: string;
  school: string;
  /** Année scolaire affichée dans le message partagé. */
  year: string;
  /** Adresse complète de cette page, ajoutée au message partagé. */
  pageUrl: string;
  applyHref: string;
};

const MAX_CHILDREN = 6;
const sections: SectionId[] = ['francophone', 'anglophone'];

function levelsOf(section: SectionId, stream: StreamId): Level[] {
  return levels.filter((level) => level.section === section && level.stream === stream).sort((a, b) => a.cycle - b.cycle);
}

/** Les filières réellement proposées dans une section. */
function streamsOf(section: SectionId): StreamId[] {
  return (['general', 'technical'] as StreamId[]).filter((stream) => levelsOf(section, stream).length > 0);
}

/** Un enfant placé dans la première classe de la section et de la filière demandées. */
function childIn(id: number, section: SectionId, stream: StreamId, isNew: boolean): ChildState {
  const available = streamsOf(section);
  const chosen = available.includes(stream) ? stream : (available[0] ?? 'general');
  const first = levelsOf(section, chosen)[0];
  return { id, section, stream: chosen, levelId: first?.id ?? '', className: first?.classes[0] ?? '', isNew };
}

/**
 * Simulateur de frais : pour un ou plusieurs enfants, l'échéancier et le total de l'année.
 * Tous les montants viennent de content/fees.ts ; le calcul est dans simulate.ts.
 * Tant que le collège n'a pas publié ses montants, le simulateur l'indique au lieu d'afficher un total.
 */
export function FeeSimulator({ locale, labels, grid, amountPlaceholder, school, year, pageUrl, applyHref }: FeeSimulatorProps) {
  const uid = useId();
  const [children, setChildren] = useState<ChildState[]>([childIn(1, 'francophone', 'general', true)]);
  const [nextId, setNextId] = useState(2);

  const estimate = useMemo(() => simulate(children, fees), [children]);
  const money = (amount: number | null) => formatMoney(amount, locale, amountPlaceholder);

  const update = (id: number, change: (child: ChildState) => ChildState) =>
    setChildren((list) => list.map((child) => (child.id === id ? change(child) : child)));

  const addChild = () => {
    const last = children.at(-1);
    setChildren((list) => [...list, childIn(nextId, last?.section ?? 'francophone', last?.stream ?? 'general', true)]);
    setNextId((value) => value + 1);
  };

  const owesRegistration = estimate.children.some((child) => child.registration !== 0);
  const describe = (child: ChildState) => `${child.className} · ${grid.sections[child.section]}`;

  // Le français met une espace avant les deux-points, l'anglais non.
  const sep = locale === 'fr' ? ' : ' : ': ';
  const shareText = [
    `${fill(labels.shareTitle, { school })} (${year})`,
    '',
    ...children.map((child, index) => `${fill(labels.child, { n: index + 1 })}${sep}${describe(child)} — ${money(estimate.children[index].total)}`),
    '',
    `${labels.atRegistration}${sep}${money(estimate.dueAtRegistration)}`,
    ...estimate.instalments
      .slice(1)
      .map((amount, index) => `${grid.instalments[index + 1]} (${fill(grid.before, { date: formatDate(fees.deadlines[index + 1], locale, grid.deadlinePlaceholder) })})${sep}${money(amount)}`),
    `${labels.total}${sep}${money(estimate.total)}`,
    '',
    labels.disclaimer,
    pageUrl,
  ].join('\n');

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:gap-8">
      <div className="flex flex-col gap-4">
        {children.map((child, index) => {
          const streams = streamsOf(child.section);
          const options = levelsOf(child.section, child.stream);
          const classId = `${uid}-class-${child.id}`;
          return (
            <fieldset key={child.id} className="flex animate-pop flex-col gap-5 rounded-2xl border border-line bg-white p-5 sm:p-6">
              <legend className="sr-only">{fill(labels.child, { n: index + 1 })}</legend>
              <div className="flex items-center justify-between gap-3">
                <p aria-hidden="true" className="flex items-center gap-3 font-display text-xl leading-7 font-semibold text-navy-700">
                  <span className="flex size-9 items-center justify-center rounded-full bg-navy-700 text-base text-white">{index + 1}</span>
                  {fill(labels.child, { n: index + 1 })}
                </p>
                {children.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => setChildren((list) => list.filter((item) => item.id !== child.id))}
                    aria-label={fill(labels.remove, { n: index + 1 })}
                    className="flex size-11 items-center justify-center rounded-lg text-muted transition-colors hover:bg-red-100 hover:text-red-700"
                  >
                    <Trash2 aria-hidden="true" className="size-5" strokeWidth={1.75} />
                  </button>
                ) : null}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Segmented
                  legend={labels.section}
                  name={`${uid}-section-${child.id}`}
                  value={child.section}
                  options={sections.map((section) => ({ value: section, label: grid.sections[section], lang: sectionLang[section] }))}
                  onChange={(section) => update(child.id, (current) => childIn(current.id, section, current.stream, current.isNew))}
                />
                {streams.length > 1 ? (
                  <Segmented
                    legend={labels.stream}
                    name={`${uid}-stream-${child.id}`}
                    value={child.stream}
                    options={streams.map((stream) => ({ value: stream, label: labels.streams[stream] }))}
                    onChange={(stream) => update(child.id, (current) => childIn(current.id, current.section, stream, current.isNew))}
                  />
                ) : null}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor={classId} className="font-semibold">
                  {labels.className}
                </label>
                <select
                  id={classId}
                  lang={sectionLang[child.section]}
                  value={`${child.levelId}|${child.className}`}
                  onChange={(event) => {
                    const [levelId, className] = event.target.value.split('|');
                    update(child.id, (current) => ({ ...current, levelId, className }));
                  }}
                  className={inputClass()}
                >
                  {options.map((level) => (
                    <optgroup key={level.id} label={labels.cycles[level.cycle - 1]}>
                      {level.classes.map((name) => (
                        <option key={name} value={`${level.id}|${name}`}>
                          {name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <label className="flex min-h-11 cursor-pointer items-center gap-3 font-semibold">
                <input
                  type="checkbox"
                  checked={child.isNew}
                  onChange={(event) => update(child.id, (current) => ({ ...current, isNew: event.target.checked }))}
                  className="size-5 shrink-0 accent-navy-700"
                />
                {labels.isNew}
              </label>
            </fieldset>
          );
        })}

        {children.length < MAX_CHILDREN ? (
          <button type="button" onClick={addChild} className={buttonClass('secondary', 'self-start')}>
            <Plus aria-hidden="true" className="size-5" strokeWidth={2} />
            {labels.add}
          </button>
        ) : null}
      </div>

      <div className="on-dark relative flex flex-col gap-5 overflow-hidden rounded-3xl bg-indigo-900 p-6 text-white sm:p-8 lg:sticky lg:top-28 lg:self-start">
        <span aria-hidden="true" className="dot-grid absolute top-0 right-0 size-32 text-sky-400 opacity-20" />
        <h3 className="relative flex items-center gap-3 font-display text-2xl leading-8 font-bold">
          <span aria-hidden="true" className="flex size-11 items-center justify-center rounded-[10px] bg-gold-400 text-ink">
            <Calculator className="size-5" strokeWidth={1.75} />
          </span>
          {labels.result}
        </h3>

        <div aria-live="polite" className="relative flex flex-col gap-5">
          <ul className="flex flex-col divide-y divide-white/15 border-y border-white/15">
            {children.map((child, index) => {
              const line = estimate.children[index];
              return (
                <li key={child.id} className="flex flex-col gap-1 py-3">
                  <p className="flex items-baseline justify-between gap-4">
                    <span className="font-semibold">
                      {fill(labels.child, { n: index + 1 })} · <span lang={sectionLang[child.section]}>{child.className}</span>
                    </span>
                    <span className="font-semibold whitespace-nowrap tabular-nums">{money(line.total)}</span>
                  </p>
                  <p className="flex items-baseline justify-between gap-4 text-sm leading-5 text-sky-200">
                    <span>{labels.tuition}</span>
                    <span className="whitespace-nowrap tabular-nums">{money(line.tuition)}</span>
                  </p>
                  {line.registration !== 0 ? (
                    <p className="flex items-baseline justify-between gap-4 text-sm leading-5 text-sky-200">
                      <span>{labels.registrationLine}</span>
                      <span className="whitespace-nowrap tabular-nums">{money(line.registration)}</span>
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>

          <div className="flex flex-col gap-2">
            <p className="text-[13px] leading-4 font-semibold tracking-[0.08em] text-sky-400 uppercase">{labels.schedule}</p>
            <dl className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="flex flex-col">
                  <span className="font-semibold">{labels.atRegistration}</span>
                  <span className="text-sm leading-5 text-sky-200">{owesRegistration ? labels.atRegistrationDetail : grid.instalments[0]}</span>
                </dt>
                <dd className="font-semibold whitespace-nowrap tabular-nums">{money(estimate.dueAtRegistration)}</dd>
              </div>
              {estimate.instalments.slice(1).map((amount, index) => (
                <div key={index} className="flex items-baseline justify-between gap-4">
                  <dt className="flex flex-col">
                    <span className="font-semibold">{grid.instalments[index + 1]}</span>
                    <span className="text-sm leading-5 text-sky-200">
                      {fill(grid.before, { date: formatDate(fees.deadlines[index + 1], locale, grid.deadlinePlaceholder) })}
                    </span>
                  </dt>
                  <dd className="font-semibold whitespace-nowrap tabular-nums">{money(amount)}</dd>
                </div>
              ))}
            </dl>
          </div>

          <p className="flex flex-col gap-1 rounded-2xl bg-indigo-950 p-4">
            <span className="text-[13px] leading-4 font-semibold tracking-[0.08em] text-sky-400 uppercase">{labels.total}</span>
            <span className={cn('font-display font-bold text-gold-400', estimate.complete ? 'text-4xl leading-10' : 'text-2xl leading-8')}>
              {money(estimate.total)}
            </span>
          </p>
        </div>

        {estimate.complete ? (
          <p className="relative text-sm leading-5 text-sky-200">{labels.disclaimer}</p>
        ) : (
          <Notice className="relative border-white/20 bg-white/10 text-white [&_svg]:text-sky-400">{labels.pending}</Notice>
        )}

        <div className="relative flex flex-col gap-3">
          {estimate.complete ? (
            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass('whatsapp', 'w-full')}
            >
              <FaWhatsapp aria-hidden="true" className="size-5" />
              {labels.share}
            </a>
          ) : null}
          <ButtonLink href={applyHref} variant="gold" className="w-full">
            {labels.apply}
            <ArrowRight aria-hidden="true" className="size-5" strokeWidth={2} />
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
