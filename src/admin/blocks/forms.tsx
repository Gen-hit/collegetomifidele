'use client';

import admissionsFr from '@messages/fr/admissions.json';
import campusFr from '@messages/fr/campus.json';
import facilitiesFr from '@messages/fr/facilities.json';
import { ArrowDown, ArrowUp, Minus, Plus, Trash2 } from 'lucide-react';
import { admissions as admissionsContent } from '@content/admissions';
import { levels } from '@content/levels';
import { exams } from '@content/results';
import { formatLocalPhone } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { BlockFormProps } from './editor';
import { CheckField, Group, NumberField, PdfField, PhotoField, smallButton, TextField } from './inputs';
import { formatAmount, resizeInstalments, type FeesBlock, type ResultsBlock } from './model';

/** Un numéro déjà enregistré (+2376…) s'affiche comme on le lit : 6 77 12 34 56. */
const showPhone = (value: string | null) => (value && /^\+?(237)?[62]\d{8}$/.test(value) ? formatLocalPhone(value) : (value ?? ''));

/**
 * Les formulaires des réglages. Chacun reçoit les données du bloc, une fonction pour les modifier,
 * les erreurs (par chemin : « phones.0 », « stats.founded »…) et l'établissement pour les envois de fichiers.
 */

const dayLabel = { weekdays: 'Du lundi au vendredi', saturday: 'Samedi', sunday: 'Dimanche' } as const;
const socialLabel = {
  facebook: 'Page Facebook',
  instagram: 'Compte Instagram',
  youtube: 'Chaîne YouTube',
  tiktok: 'Compte TikTok',
  whatsappChannel: 'Chaîne WhatsApp',
} as const;

// ── Coordonnées et chiffres clés ──────────────────────────────────────────────────────────
export function ContactForm({ data, set, errors, readOnly }: BlockFormProps<'contact'>) {
  const phones = data.phones.length ? data.phones : [''];
  return (
    <>
      <Group title="Adresse" intro="Affichée sur la page Contact, dans le pied de page et dans les informations lues par Google.">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Quartier, rue ou repère" value={data.address} onChange={(v) => set((d) => ({ ...d, address: v }))} placeholder="Ex. : Bonamoussadi, face à la pharmacie…" disabled={readOnly} maxLength={160} />
          <TextField label="Ville" value={data.city} onChange={(v) => set((d) => ({ ...d, city: v }))} placeholder="Ex. : Douala" disabled={readOnly} maxLength={60} />
        </div>
      </Group>

      <Group title="Téléphone, WhatsApp et email" intro="Les familles appellent et écrivent à ces numéros depuis chaque page du site.">
        <div className="flex flex-col gap-4">
          {phones.map((phone, index) => (
            <div key={index} className="flex items-end gap-2">
              <TextField
                className="flex-1"
                label={index === 0 ? 'Téléphone du secrétariat' : `Autre numéro (${index + 1})`}
                type="tel"
                inputMode="tel"
                value={showPhone(phone)}
                onChange={(v) => set((d) => ({ ...d, phones: Object.assign([...(d.phones.length ? d.phones : [''])], { [index]: v }) }))}
                placeholder="6 77 12 34 56"
                error={errors[`phones.${index}`]}
                disabled={readOnly}
              />
              {phones.length > 1 && !readOnly ? (
                <button type="button" aria-label={`Retirer le numéro ${index + 1}`} onClick={() => set((d) => ({ ...d, phones: d.phones.filter((_, i) => i !== index) }))} className={cn(smallButton, 'mb-1 min-h-12')}>
                  <Trash2 aria-hidden="true" className="size-4" />
                </button>
              ) : null}
            </div>
          ))}
          {phones.length < 3 && !readOnly ? (
            <button type="button" className={cn(smallButton, 'self-start')} onClick={() => set((d) => ({ ...d, phones: [...(d.phones.length ? d.phones : ['']), ''] }))}>
              <Plus aria-hidden="true" className="size-4" />
              Ajouter un numéro
            </button>
          ) : null}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Numéro WhatsApp du secrétariat" type="tel" inputMode="tel" value={showPhone(data.whatsapp)} onChange={(v) => set((d) => ({ ...d, whatsapp: v }))} placeholder="6 77 12 34 56" hint="Les formulaires du site proposent aussi d’écrire à ce numéro." error={errors.whatsapp} disabled={readOnly} />
          <TextField label="Email du secrétariat" type="email" inputMode="email" value={data.email} onChange={(v) => set((d) => ({ ...d, email: v }))} placeholder="secretariat@…" error={errors.email} disabled={readOnly} />
        </div>
      </Group>

      <Group title="Heures d’ouverture du secrétariat" intro="Le site indique aux visiteurs si le secrétariat est ouvert en ce moment.">
        <div className="flex flex-col divide-y divide-line">
          {data.openingHours.map((row, index) => (
            <div key={row.days} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-end sm:gap-4">
              <p className="font-semibold sm:w-48 sm:pb-3">{dayLabel[row.days]}</p>
              {!row.closed ? (
                <div className="grid flex-1 grid-cols-2 gap-3">
                  <TextField label="Ouverture" type="time" value={row.open} onChange={(v) => set((d) => ({ ...d, openingHours: d.openingHours.map((r, i) => (i === index ? { ...r, open: v || null } : r)) }))} error={errors[`openingHours.${index}.open`]} disabled={readOnly} />
                  <TextField label="Fermeture" type="time" value={row.close} onChange={(v) => set((d) => ({ ...d, openingHours: d.openingHours.map((r, i) => (i === index ? { ...r, close: v || null } : r)) }))} error={errors[`openingHours.${index}.close`]} disabled={readOnly} />
                </div>
              ) : (
                <p className="flex-1 text-muted sm:pb-3">Fermé</p>
              )}
              <div className="sm:pb-3">
                <CheckField label="Fermé" checked={row.closed} disabled={readOnly} onChange={(closed) => set((d) => ({ ...d, openingHours: d.openingHours.map((r, i) => (i === index ? { ...r, closed } : r)) }))} />
              </div>
            </div>
          ))}
        </div>
      </Group>

      <Group title="Réseaux sociaux" intro="Collez l’adresse complète de chaque page, copiée depuis le navigateur. Une case vide garde l’icône sans lien.">
        <div className="grid gap-5 sm:grid-cols-2">
          {(Object.keys(socialLabel) as (keyof typeof socialLabel)[]).map((key) => (
            <TextField key={key} label={socialLabel[key]} type="url" inputMode="url" value={data.social[key]} onChange={(v) => set((d) => ({ ...d, social: { ...d.social, [key]: v } }))} placeholder="https://…" error={errors[`social.${key}`]} disabled={readOnly} />
          ))}
        </div>
      </Group>

      <Group title="Chiffres clés" intro="Affichés sur l’accueil et la page « Le collège ». Uniquement des chiffres officiels : une case vide affiche « à fournir ».">
        <div className="grid gap-5 sm:grid-cols-2">
          <NumberField label="Année de création" grouped={false} value={data.stats.founded} onChange={(v) => set((d) => ({ ...d, stats: { ...d.stats, founded: v } }))} error={errors['stats.founded']} disabled={readOnly} placeholder="Ex. : 1995" />
          <NumberField label="Nombre d’élèves" value={data.stats.students} onChange={(v) => set((d) => ({ ...d, stats: { ...d.stats, students: v } }))} error={errors['stats.students']} disabled={readOnly} />
          <NumberField label="Nombre d’enseignants" value={data.stats.teachers} onChange={(v) => set((d) => ({ ...d, stats: { ...d.stats, teachers: v } }))} error={errors['stats.teachers']} disabled={readOnly} />
          <NumberField label="Taux de réussite aux examens" suffix="%" grouped={false} value={data.stats.successRate} onChange={(v) => set((d) => ({ ...d, stats: { ...d.stats, successRate: v } }))} error={errors['stats.successRate']} hint="Toutes sections confondues, dernière session." disabled={readOnly} />
        </div>
      </Group>
    </>
  );
}

// ── Admissions ────────────────────────────────────────────────────────────────────────────
export function AdmissionsForm({ data, set, errors, readOnly }: BlockFormProps<'admissions'>) {
  return (
    <>
      <Group title="Année scolaire" intro="Affichée dans le bandeau d’annonce et sur la page Admissions.">
        <TextField className="sm:max-w-xs" label="Année des inscriptions" value={data.schoolYear} onChange={(v) => set((d) => ({ ...d, schoolYear: v }))} placeholder="2026-2027" error={errors.schoolYear} disabled={readOnly} />
      </Group>
      <Group title="Concours d’entrée" intro="Une date vide s’affiche « date à confirmer ». Les familles peuvent ajouter chaque date à leur agenda.">
        <div className="grid gap-5 sm:grid-cols-2">
          {admissionsContent.entranceExams.map((exam) => (
            <TextField
              key={exam.id}
              label={exam.label.fr}
              type="date"
              value={data.entranceExams[exam.id] ?? ''}
              onChange={(v) => set((d) => ({ ...d, entranceExams: { ...d.entranceExams, [exam.id]: v || null } }))}
              error={errors[`entranceExams.${exam.id}`]}
              disabled={readOnly}
            />
          ))}
        </div>
      </Group>
    </>
  );
}

// ── Frais de scolarité ────────────────────────────────────────────────────────────────────
const sections = admissionsFr.form.sections as Record<string, string>;
const streams = admissionsFr.form.streams as Record<string, string>;
const cycles = admissionsFr.form.cycles;

const total = (list: (number | null)[]) => (list.some((v) => v === null || Number.isNaN(v)) ? null : list.reduce<number>((sum, v) => sum + (v ?? 0), 0));

export function FeesForm({ data, set, errors, readOnly, schoolId }: BlockFormProps<'fees'>) {
  const count = data.deadlines.length;
  const setTuition = (level: string, index: number, value: number | null) =>
    set((d) => {
      const row = d.tuition[level] ?? { instalments: Array(count).fill(null) };
      const instalments = [...row.instalments];
      instalments[index] = value;
      return { ...d, tuition: { ...d.tuition, [level]: { ...row, instalments } } };
    });
  const resize = (next: number) => set((d) => resizeInstalments(d, next) as FeesBlock);

  return (
    <>
      <Group
        title="Tranches et échéances"
        intro="Le nombre de tranches s’applique à toutes les classes. Les dates limites s’affichent sur la page Frais et dans le simulateur."
        action={
          readOnly ? null : (
            <div className="flex items-center gap-2" role="group" aria-label="Nombre de tranches">
              <button type="button" className={smallButton} disabled={count <= 1} onClick={() => resize(count - 1)} aria-label="Une tranche de moins">
                <Minus aria-hidden="true" className="size-4" />
              </button>
              <span className="min-w-24 text-center font-semibold" aria-live="polite">{`${count} tranche${count > 1 ? 's' : ''}`}</span>
              <button type="button" className={smallButton} disabled={count >= 6} onClick={() => resize(count + 1)} aria-label="Une tranche de plus">
                <Plus aria-hidden="true" className="size-4" />
              </button>
            </div>
          )
        }
      >
        <div className="grid gap-5 sm:grid-cols-3">
          {data.deadlines.map((date, index) => (
            <TextField key={index} label={`Date limite, tranche ${index + 1}`} type="date" value={date ?? ''} onChange={(v) => set((d) => ({ ...d, deadlines: d.deadlines.map((x, i) => (i === index ? v || null : x)) }))} error={errors[`deadlines.${index}`]} disabled={readOnly} />
          ))}
        </div>
      </Group>

      <Group title="Frais d’inscription">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
          <NumberField className="sm:w-64" label="Montant" suffix="FCFA" value={data.registration.amount} onChange={(v) => set((d) => ({ ...d, registration: { ...d.registration, amount: v } }))} error={errors['registration.amount']} disabled={readOnly} />
          <div className="sm:pt-9">
            <CheckField label="Payés une seule fois, à la première inscription" hint="Décoché : payés chaque année par tous les élèves." checked={data.registration.newStudentsOnly} disabled={readOnly} onChange={(v) => set((d) => ({ ...d, registration: { ...d.registration, newStudentsOnly: v } }))} />
          </div>
        </div>
      </Group>

      <Group title="Scolarité par niveau" intro="Montant de chaque tranche, en francs CFA. Une case vide affiche « à fournir » sur le site, jamais un chiffre inventé.">
        <div className="flex flex-col gap-6">
          {levels.map((level) => {
            const row = data.tuition[level.id] ?? { instalments: Array(count).fill(null) };
            const sum = total(row.instalments);
            return (
              <fieldset key={level.id} className="flex flex-col gap-3 rounded-xl border border-line p-4">
                <legend className="px-1 font-semibold text-navy-700">
                  {`${sections[level.section]} · ${streams[level.stream]} · ${cycles[level.cycle - 1]}`}
                </legend>
                <p className="-mt-1 text-sm text-muted">{level.classes.join(', ')}</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {row.instalments.map((value, index) => (
                    <NumberField key={index} label={`Tranche ${index + 1}`} suffix="FCFA" value={value} onChange={(v) => setTuition(level.id, index, v)} error={errors[`tuition.${level.id}.${index}`]} disabled={readOnly} />
                  ))}
                </div>
                <p className="text-sm text-muted" aria-live="polite">
                  {sum !== null ? `Total de l’année : ${formatAmount(sum)} FCFA` : 'Total calculé quand toutes les tranches sont remplies.'}
                  {row.byClass ? ' Des tarifs particuliers par classe sont aussi enregistrés pour ce niveau.' : ''}
                </p>
              </fieldset>
            );
          })}
        </div>
      </Group>

      <Group title="Grille des frais à télécharger" intro="Le PDF officiel de la grille, proposé sur la page Frais et dans la page Documents.">
        <PdfField label="Grille des frais (PDF)" value={data.gridPdf} onChange={(v) => set((d) => ({ ...d, gridPdf: v }))} schoolId={schoolId} folder="frais" />
      </Group>
    </>
  );
}

// ── Paiement ──────────────────────────────────────────────────────────────────────────────
const operatorLabel: Record<string, string> = { mtn: 'MTN Mobile Money', orange: 'Orange Money' };

export function PaymentForm({ data, set, errors, readOnly }: BlockFormProps<'payment'>) {
  return (
    <>
      <Group title="Paiement par téléphone" intro="Les familles paient la scolarité à ces numéros. Vérifiez deux fois chaque chiffre : le nom du titulaire s’affiche à la famille au moment du transfert.">
        <div className="flex flex-col gap-6">
          {data.mobileMoney.map((row, index) => (
            <fieldset key={row.id} className="grid gap-4 rounded-xl border border-line p-4 sm:grid-cols-2">
              <legend className="px-1 font-semibold text-navy-700">{operatorLabel[row.id] ?? row.id}</legend>
              <TextField label="Numéro marchand ou de dépôt" type="tel" inputMode="tel" value={showPhone(row.number)} onChange={(v) => set((d) => ({ ...d, mobileMoney: d.mobileMoney.map((m, i) => (i === index ? { ...m, number: v } : m)) }))} placeholder="6 77 12 34 56" error={errors[`mobileMoney.${index}.number`]} disabled={readOnly} />
              <TextField label="Nom du titulaire" value={row.holder} onChange={(v) => set((d) => ({ ...d, mobileMoney: d.mobileMoney.map((m, i) => (i === index ? { ...m, holder: v } : m)) }))} placeholder="Ex. : COLLEGE TOMI FIDELE" error={errors[`mobileMoney.${index}.holder`]} disabled={readOnly} />
            </fieldset>
          ))}
        </div>
      </Group>
      <Group title="Au secrétariat">
        <CheckField label="Le secrétariat encaisse aussi les paiements en espèces" checked={data.cashDesk} disabled={readOnly} onChange={(v) => set((d) => ({ ...d, cashDesk: v }))} />
      </Group>
    </>
  );
}

// ── Résultats aux examens ────────────────────────────────────────────────────────────────
export function ResultsForm({ data, set, errors, readOnly }: BlockFormProps<'results'>) {
  const sessions = [...data.sessions].map((s, index) => ({ s, index })).sort((a, b) => b.s.year - a.s.year);
  const setExam = (index: number, exam: string, field: 'registered' | 'passed', value: number | null) =>
    set((d) => {
      const list = [...d.sessions];
      const session = list[index];
      const results = { ...session.results };
      const current = results[exam] ?? { registered: Number.NaN, passed: Number.NaN };
      const next = { ...current, [field]: value ?? Number.NaN };
      // Les deux cases vides : l'examen n'a pas été présenté cette année-là.
      if (Number.isNaN(next.registered) && Number.isNaN(next.passed)) delete results[exam];
      else results[exam] = next;
      list[index] = { ...session, results };
      return { ...d, sessions: list } as ResultsBlock;
    });
  const latest = data.sessions.reduce((max, s) => (Number.isNaN(s.year) ? max : Math.max(max, s.year)), 0);
  const nextYear = latest ? latest + 1 : new Date().getFullYear();

  return (
    <>
      <Group
        title="Sessions d’examens"
        intro="Pour chaque examen présenté, le nombre d’inscrits et le nombre d’admis : le site calcule les taux et l’évolution d’une année à l’autre. Un examen non présenté : laissez ses deux cases vides."
        action={
          readOnly ? null : (
            <button type="button" className={smallButton} onClick={() => set((d) => ({ ...d, sessions: [...d.sessions, { year: nextYear, results: {} }] }))}>
              <Plus aria-hidden="true" className="size-4" />
              Ajouter une session
            </button>
          )
        }
      >
        {sessions.length === 0 ? <p className="text-muted">Aucune session saisie : la page Résultats affiche des emplacements.</p> : null}
        <div className="flex flex-col gap-6">
          {sessions.map(({ s, index }) => (
            <fieldset key={index} className="flex flex-col gap-4 rounded-xl border border-line p-4">
              <legend className="px-1 font-semibold text-navy-700">{`Session ${Number.isNaN(s.year) ? '…' : s.year}`}</legend>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <NumberField className="w-40" label="Année" grouped={false} value={s.year} onChange={(v) => set((d) => ({ ...d, sessions: d.sessions.map((x, i) => (i === index ? { ...x, year: v ?? Number.NaN } : x)) }))} error={errors[`sessions.${index}.year`]} disabled={readOnly} />
                {!readOnly ? (
                  <button type="button" className={smallButton} onClick={() => set((d) => ({ ...d, sessions: d.sessions.filter((_, i) => i !== index) }))}>
                    <Trash2 aria-hidden="true" className="size-4" />
                    Retirer cette session
                  </button>
                ) : null}
              </div>
              <div className="flex flex-col divide-y divide-line">
                {exams.map((exam) => {
                  const r = s.results[exam.id];
                  const rate = r && r.registered > 0 && r.passed <= r.registered ? Math.round((r.passed / r.registered) * 1000) / 10 : null;
                  return (
                    <div key={exam.id} role="group" aria-label={`${exam.label}, session ${s.year}`} className="flex flex-col gap-2 py-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4">
                      <p className="font-semibold sm:w-40 sm:pb-3">
                        {exam.label}
                        <span className="block text-xs font-normal text-muted">{exam.section === 'francophone' ? 'Section francophone' : 'Section anglophone'}</span>
                      </p>
                      <div className="grid flex-1 grid-cols-2 gap-3">
                        <NumberField label="Inscrits" value={r ? r.registered : null} onChange={(v) => setExam(index, exam.id, 'registered', v)} disabled={readOnly} />
                        <NumberField label="Admis" value={r ? r.passed : null} onChange={(v) => setExam(index, exam.id, 'passed', v)} disabled={readOnly} />
                      </div>
                      <p className="text-sm text-muted sm:w-28 sm:pb-3" aria-live="polite">
                        {rate !== null ? `${String(rate).replace('.', ',')} % de réussite` : ''}
                      </p>
                      {errors[`sessions.${index}.${exam.id}`] ? <p className="text-sm font-semibold text-red-700 sm:w-full">{errors[`sessions.${index}.${exam.id}`]}</p> : null}
                    </div>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>
      </Group>
      <Group title="Source des chiffres" intro="Affichée sous les résultats, pour que les familles sachent d’où ils viennent.">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Source" lang="fr" value={data.source?.fr ?? ''} onChange={(v) => set((d) => ({ ...d, source: { fr: v, en: d.source?.en ?? '' } }))} placeholder="Ex. : résultats officiels de l’Office du Baccalauréat" error={errors['source.fr']} disabled={readOnly} />
          <TextField label="Source" lang="en" value={data.source?.en ?? ''} onChange={(v) => set((d) => ({ ...d, source: { fr: d.source?.fr ?? '', en: v } }))} hint="Facultatif : vide, le site anglais reprend le texte français." disabled={readOnly} />
        </div>
      </Group>
    </>
  );
}

// ── Équipe de direction ──────────────────────────────────────────────────────────────────
export function TeamForm({ data, set, errors, readOnly, schoolId }: BlockFormProps<'team'>) {
  const move = (index: number, direction: -1 | 1) =>
    set((d) => {
      const others = [...d.others];
      const [item] = others.splice(index, 1);
      others.splice(index + direction, 0, item);
      return { ...d, others };
    });
  return (
    <>
      <Group title="Le Principal" intro="Son nom et son portrait apparaissent sur l’accueil, la page « Le collège » et le « Mot du Principal ».">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <PhotoField label="Portrait" shape="portrait" value={data.principal.photo} onChange={(v) => set((d) => ({ ...d, principal: { ...d.principal, photo: v } }))} schoolId={schoolId} folder="equipe" hint="Format portrait, visage bien éclairé." disabled={readOnly} />
          <TextField className="flex-1" label="Nom complet" value={data.principal.name} onChange={(v) => set((d) => ({ ...d, principal: { ...d.principal, name: v } }))} placeholder="Ex. : M. Jean Mbarga" disabled={readOnly} maxLength={80} />
        </div>
      </Group>
      <Group
        title="Équipe de direction"
        intro="Dans l’ordre d’affichage sur la page « Le collège »."
        action={
          readOnly ? null : (
            <button type="button" className={smallButton} onClick={() => set((d) => ({ ...d, others: [...d.others, { name: null, role: { fr: '', en: '' }, photo: null }] }))}>
              <Plus aria-hidden="true" className="size-4" />
              Ajouter une personne
            </button>
          )
        }
      >
        <div className="flex flex-col gap-5">
          {data.others.map((person, index) => (
            <fieldset key={index} className="flex flex-col gap-4 rounded-xl border border-line p-4 sm:flex-row sm:items-start">
              <legend className="sr-only">{`Personne ${index + 1}`}</legend>
              <PhotoField label="Portrait" shape="square" value={person.photo} onChange={(v) => set((d) => ({ ...d, others: d.others.map((p, i) => (i === index ? { ...p, photo: v } : p)) }))} schoolId={schoolId} folder="equipe" disabled={readOnly} />
              <div className="flex flex-1 flex-col gap-4">
                <TextField label="Nom complet" value={person.name} onChange={(v) => set((d) => ({ ...d, others: d.others.map((p, i) => (i === index ? { ...p, name: v } : p)) }))} disabled={readOnly} maxLength={80} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField label="Fonction" lang="fr" value={person.role.fr} onChange={(v) => set((d) => ({ ...d, others: d.others.map((p, i) => (i === index ? { ...p, role: { ...p.role, fr: v } } : p)) }))} placeholder="Ex. : Censeur" error={errors[`others.${index}.role`]} disabled={readOnly} maxLength={60} />
                  <TextField label="Fonction" lang="en" value={person.role.en} onChange={(v) => set((d) => ({ ...d, others: d.others.map((p, i) => (i === index ? { ...p, role: { ...p.role, en: v } } : p)) }))} placeholder="Ex. : Vice-Principal" disabled={readOnly} maxLength={60} />
                </div>
                {!readOnly ? (
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className={smallButton} disabled={index === 0} onClick={() => move(index, -1)} aria-label={`Monter la personne ${index + 1}`}>
                      <ArrowUp aria-hidden="true" className="size-4" />
                    </button>
                    <button type="button" className={smallButton} disabled={index === data.others.length - 1} onClick={() => move(index, 1)} aria-label={`Descendre la personne ${index + 1}`}>
                      <ArrowDown aria-hidden="true" className="size-4" />
                    </button>
                    <button type="button" className={smallButton} onClick={() => set((d) => ({ ...d, others: d.others.filter((_, i) => i !== index) }))}>
                      <Trash2 aria-hidden="true" className="size-4" />
                      Retirer
                    </button>
                  </div>
                ) : null}
              </div>
            </fieldset>
          ))}
        </div>
      </Group>
    </>
  );
}

// ── Photos du site ───────────────────────────────────────────────────────────────────────
const facilityName = Object.fromEntries(facilitiesFr.items.map((item) => [item.key, item.title]));
const clubNames = campusFr.clubs.items.map((club) => club.name);

/** Les emplacements de photos du site, rangés par page, avec ce qu'ils montrent. */
export const photoGroups: { title: string; slots: { key: string; label: string }[] }[] = [
  {
    title: 'Accueil',
    slots: [
      { key: 'home.hero', label: 'Grande photo d’ouverture' },
      { key: 'home.programmes.francophone', label: 'Carte « Section francophone »' },
      { key: 'home.programmes.anglophone', label: 'Carte « Section anglophone »' },
      { key: 'home.programmes.technique', label: 'Carte « Enseignement technique »' },
      { key: 'home.facilities.1', label: 'Infrastructures, photo 1' },
      { key: 'home.facilities.2', label: 'Infrastructures, photo 2' },
      { key: 'home.facilities.3', label: 'Infrastructures, photo 3' },
      { key: 'home.facilities.4', label: 'Infrastructures, photo 4' },
    ],
  },
  { title: 'Le collège', slots: [{ key: 'about.campus', label: 'Vue du campus' }] },
  {
    title: 'Programmes',
    slots: [
      { key: 'programmes.francophone', label: 'Section francophone' },
      { key: 'programmes.anglophone', label: 'Section anglophone' },
      { key: 'programmes.technique', label: 'Enseignement technique' },
    ],
  },
  ...(['francophone', 'anglophone', 'technique'] as const).map((section) => ({
    title: section === 'francophone' ? 'Page Section francophone' : section === 'anglophone' ? 'Page Section anglophone' : 'Page Enseignement technique',
    slots: [
      { key: `${section}.overview`, label: 'Photo de présentation' },
      ...[1, 2, 3].map((n) => ({ key: section === 'technique' ? `technique.workshops.${n}` : `${section}.gallery.${n}`, label: section === 'technique' ? `Atelier, photo ${n}` : `Galerie, photo ${n}` })),
    ],
  })),
  {
    title: 'Infrastructures',
    slots: ['labs', 'computers', 'workshops', 'library', 'sports', 'other'].map((key) => ({ key: `facilities.${key}`, label: facilityName[key] ?? key })),
  },
  {
    title: 'Vie scolaire',
    slots: [...clubNames.map((name, index) => ({ key: `campus.clubs.${index + 1}`, label: name })), { key: 'campus.uniform', label: 'Tenue de classe' }],
  },
];

export function PhotosForm({ data, set, readOnly, schoolId }: BlockFormProps<'photos'>) {
  const filled = Object.values(data.slots).filter(Boolean).length;
  const all = photoGroups.reduce((n, g) => n + g.slots.length, 0);
  return (
    <>
      <p className="font-semibold text-navy-700" aria-live="polite">{`${filled} photo${filled > 1 ? 's' : ''} sur ${all}`}</p>
      {photoGroups.map((group) => (
        <Group key={group.title} title={group.title}>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {group.slots.map((slot) => (
              <PhotoField key={slot.key} label={slot.label} value={data.slots[slot.key] ?? null} onChange={(v) => set((d) => ({ ...d, slots: { ...d.slots, [slot.key]: v } }))} schoolId={schoolId} folder="photos" disabled={readOnly} />
            ))}
          </div>
        </Group>
      ))}
    </>
  );
}
