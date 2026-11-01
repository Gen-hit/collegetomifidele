'use client';

import { CircleCheck, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { inputClass } from '@/components/ui/field';
import { sourceTexts } from '@/i18n/dictionaries';
import { isFilled, pendingTexts, type PendingText } from '@/i18n/texts';
import { cn } from '@/lib/utils';
import type { BlockFormProps } from './editor';
import { Group, TextField } from './inputs';

/**
 * Les textes du collège encore entre crochets dans le site, à remplir ici en français et en anglais.
 * Les emplacements qui servent seulement quand une donnée manque (montant, téléphone, date…) ne sont pas listés :
 * ils se remplissent dans les autres réglages.
 */
const dataFallback = [/placeholder$/i, /^home\.admissions\.cards\./, /^pages\.fees\.grid\.downloadMissing$/, /\.results\.text$/, /^pages\.admissions\.fees\.examNote$/];

export const editableTexts: PendingText[] = pendingTexts(sourceTexts.fr, sourceTexts.en).filter(
  (t) => !dataFallback.some((rule) => rule.test(t.path)),
);

const pageOf: [RegExp, string][] = [
  [/^home\./, 'Accueil'],
  [/^pages\.about\./, 'Le collège'],
  [/^pages\.principal\./, 'Mot du Principal'],
  [/^pages\.programmes\./, 'Programmes'],
  [/^pages\.sections\.francophone\./, 'Section francophone'],
  [/^pages\.sections\.anglophone\./, 'Section anglophone'],
  [/^pages\.technique\./, 'Enseignement technique'],
  [/^pages\.facilities\./, 'Infrastructures'],
  [/^pages\.admissions\./, 'Admissions'],
  [/^pages\.fees\./, 'Frais et paiement'],
  [/^pages\.results\./, 'Résultats'],
  [/^pages\.campus\./, 'Vie scolaire'],
  [/^pages\.contact\./, 'Contact'],
  [/^pages\.privacy\./, 'Confidentialité'],
];
const page = (path: string) => pageOf.find(([rule]) => rule.test(path))?.[1] ?? 'Autres textes';

/** « [Club 1 : nom à fournir] » → « Club 1 : nom à fournir » : la consigne, sans crochets. */
const instruction = (text: string) => text.replace(/\[|\]/g, '').trim();

/** Le texte d'origine garde-t-il une partie déjà rédigée, hors crochets ? On la propose alors à compléter. */
const hasWrittenPart = (text: string) => text.replace(/\[[^\]]*\]/g, '').replace(/[\s.,:;·–-]/g, '').length > 3;

type Filter = 'todo' | 'done' | 'all';

export function TextsForm({ data, set, readOnly }: BlockFormProps<'texts'>) {
  const [filter, setFilter] = useState<Filter>('todo');
  const [query, setQuery] = useState('');
  const done = (t: PendingText) => isFilled(data.fr[t.path]);
  const count = editableTexts.filter(done).length;
  const groups = useMemo(() => {
    const plain = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const q = plain(query.trim());
    const map = new Map<string, PendingText[]>();
    for (const t of editableTexts) {
      if (filter === 'todo' && done(t)) continue;
      if (filter === 'done' && !done(t)) continue;
      if (q && !plain(`${t.fr} ${data.fr[t.path] ?? ''} ${page(t.path)}`).includes(q)) continue;
      const name = page(t.path);
      map.set(name, [...(map.get(name) ?? []), t]);
    }
    return [...map.entries()];
    // La liste se fige au changement de filtre : un texte en cours de saisie ne disparaît pas sous les doigts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, query]);

  const setText = (lang: 'fr' | 'en', path: string, value: string) => set((d) => ({ ...d, [lang]: { ...d[lang], [path]: value } }));

  return (
    <>
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5">
        <p className="font-semibold text-navy-700" aria-live="polite">
          {`${count} texte${count > 1 ? 's' : ''} rempli${count > 1 ? 's' : ''} sur ${editableTexts.length}`}
        </p>
        <div className="h-2.5 overflow-hidden rounded-full bg-surface-alt" aria-hidden="true">
          <div className="h-full rounded-full bg-green-700 transition-all" style={{ width: `${Math.round((count / Math.max(1, editableTexts.length)) * 100)}%` }} />
        </div>
        <p className="text-[15px] leading-6 text-muted">
          Tant qu’un texte n’est pas rempli, le passage correspondant n’apparaît pas sur le site public. Remplacez la consigne par le vrai texte du collège :
          le site anglais reprend le français tant que l’anglais est vide.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex gap-2" role="group" aria-label="Filtrer">
          {(
            [
              ['todo', 'À remplir'],
              ['done', 'Remplis'],
              ['all', 'Tous'],
            ] as [Filter, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={filter === id}
              onClick={() => setFilter(id)}
              className={cn(
                'inline-flex min-h-11 items-center rounded-full border px-4 text-[15px] font-semibold transition-colors',
                filter === id ? 'border-navy-700 bg-navy-700 text-white' : 'border-line bg-white text-navy-700 hover:border-navy-700',
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="relative flex-1">
          <span className="sr-only">Rechercher un texte</span>
          <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Club, règlement, Principal…" className={cn(inputClass(), 'pl-10')} />
        </label>
      </div>

      {groups.length === 0 ? (
        <p className="rounded-2xl border border-line bg-white p-6 text-muted">
          {filter === 'todo' ? 'Tous les textes sont remplis. Bravo !' : 'Aucun texte dans cette liste.'}
        </p>
      ) : null}

      {groups.map(([name, items]) => (
        <Group key={name} title={name}>
          <div className="flex flex-col divide-y divide-line">
            {items.map((t) => {
              const long = t.fr.length > 70;
              const filled = done(t);
              return (
                <div key={t.path} className="flex flex-col gap-3 py-5 first:pt-0 last:pb-0">
                  <p className="flex items-start gap-2 text-[15px] leading-6 text-muted">
                    {filled ? <CircleCheck aria-label="Rempli" className="mt-0.5 size-5 shrink-0 text-green-700" /> : null}
                    <span>{instruction(t.fr)}</span>
                  </p>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <TextField
                      label="Texte"
                      lang="fr"
                      multiline={long}
                      value={data.fr[t.path] ?? (hasWrittenPart(t.fr) ? t.fr : '')}
                      onChange={(v) => setText('fr', t.path, v)}
                      error={data.fr[t.path] && !isFilled(data.fr[t.path]) ? 'Retirez les crochets : remplacez la consigne par le texte.' : undefined}
                      disabled={readOnly}
                    />
                    <TextField
                      label="Texte"
                      lang="en"
                      multiline={long}
                      value={data.en[t.path] ?? ''}
                      onChange={(v) => setText('en', t.path, v)}
                      placeholder={instruction(t.en)}
                      error={data.en[t.path] && !isFilled(data.en[t.path]) ? 'Retirez les crochets.' : undefined}
                      disabled={readOnly}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Group>
      ))}
    </>
  );
}
