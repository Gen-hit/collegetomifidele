'use client';

import { Lock, Send } from 'lucide-react';
import { useId, useState, type FormEvent } from 'react';
import { FaWhatsapp } from 'react-icons/fa6';
import { levels, sectionLang, type SectionId, type StreamId } from '@content/levels';
import { ButtonLink, buttonClass } from '@/components/ui/button';
import { describedBy, Field, inputClass } from '@/components/ui/field';
import { MessageReady } from '@/components/ui/message-ready';
import { Notice } from '@/components/ui/notice';
import { Segmented } from '@/components/ui/segmented';
import { ConsentField, RequestSaved, TrapField, useFormClock } from '@/features/requests/request-parts';
import { familyRequestsEnabled, sendFamilyRequest, type SendResult } from '@/features/requests/send';
import type { Dictionary } from '@/i18n/dictionaries';
import { fill, formatLocalPhone } from '@/lib/format';
import { normalizePhone } from '@/lib/phone';
import { validate, type FieldName, type PreinscriptionValues } from './message';

type PreinscriptionFormProps = {
  labels: Dictionary['pages']['admissions']['form'];
  school: string;
  /** Numéro WhatsApp du secrétariat (content/site.ts). `null` : le message est proposé à la copie. */
  whatsapp: string | null;
  contactHref: string;
  privacyHref: string;
  locale: string;
};

type Failure = Extract<SendResult, { ok: false }>['reason'];

const empty: PreinscriptionValues = { student: '', section: 'francophone', stream: 'general', className: '', parent: '', phone: '', message: '' };

function levelsOf(section: string, stream: string) {
  return levels.filter((level) => level.section === section && level.stream === stream).sort((a, b) => a.cycle - b.cycle);
}

/**
 * Formulaire de préinscription.
 * - Back-office relié : la demande est enregistrée pour le secrétariat, avec un numéro de suivi.
 *   WhatsApp reste proposé en complément, et en secours si l'envoi échoue.
 * - Sans back-office : le formulaire compose un message et l'ouvre dans WhatsApp, comme à l'origine.
 */
export function PreinscriptionForm({ labels, school, whatsapp, contactHref, privacyHref, locale }: PreinscriptionFormProps) {
  const uid = useId();
  const [values, setValues] = useState<PreinscriptionValues>(empty);
  const [errors, setErrors] = useState<FieldName[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [trap, setTrap] = useState('');
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [saved, setSaved] = useState<{ reference: string | null; text: string; phone: string } | null>(null);
  const startedAt = useFormClock();
  const f = labels.fields;
  const mode = familyRequestsEnabled ? labels : labels.whatsappOnly;

  const id = (name: FieldName) => `${uid}-${name}`;
  const errorOf = (name: 'student' | 'className' | 'parent' | 'phone') => (errors.includes(name) ? f[name].error : undefined);
  const set = (name: FieldName, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => current.filter((item) => item !== name));
  };
  /** Changer de section ou de filière vide la classe : la liste proposée n'est plus la même. */
  const setTrack = (name: 'section' | 'stream', value: string) => setValues((current) => ({ ...current, [name]: value, className: '' }));

  const streams = (['general', 'technical'] as StreamId[]).filter((stream) => levelsOf(values.section, stream).length > 0);

  const compose = () => {
    const phone = normalizePhone(values.phone) ?? values.phone;
    let text = fill(labels.template, {
      school,
      student: values.student.trim(),
      section: labels.sections[values.section as SectionId],
      stream: labels.streams[values.stream as StreamId],
      className: values.className,
      parent: values.parent.trim(),
      phone: `+237 ${formatLocalPhone(phone)}`,
    });
    if (values.message.trim()) text += fill(labels.templateMessage, { message: values.message.trim() });
    return { text, phone };
  };

  /** Le message prêt pour WhatsApp, ouvert tout de suite s'il y a un numéro. */
  const openWhatsapp = (text: string) => {
    setMessage(text);
    if (whatsapp) window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    const invalid = validate(values);
    const missingConsent = familyRequestsEnabled && !consent;
    setConsentError(missingConsent);
    if (invalid.length > 0 || missingConsent) {
      setErrors(invalid);
      document.getElementById(invalid.length > 0 ? id(invalid[0]) : `${uid}-consent`)?.focus();
      return;
    }
    const { text, phone } = compose();
    if (!familyRequestsEnabled) {
      openWhatsapp(text);
      return;
    }
    setSending(true);
    setFailure(null);
    const result = await sendFamilyRequest(
      'preinscription',
      {
        student: values.student,
        section: values.section,
        stream: values.stream,
        className: values.className,
        parent: values.parent,
        phone,
        message: values.message,
        consent: true,
        locale,
      },
      { trap, startedAt: startedAt.current },
    );
    setSending(false);
    if (result.ok) setSaved({ reference: result.reference, text, phone });
    else setFailure(result.reason);
  };

  const restart = () => {
    setValues(empty);
    setConsent(false);
    setSaved(null);
    setMessage(null);
    setFailure(null);
    startedAt.current = Date.now();
  };

  if (saved) {
    const s = labels.saved;
    const text = saved.reference ? `${saved.text}\n${s.reference} : ${saved.reference}` : saved.text;
    return (
      <RequestSaved
        title={s.title}
        reference={saved.reference ? { label: s.reference, value: saved.reference, keep: s.keep } : null}
        callback={fill(s.callback, { phone: `+237 ${formatLocalPhone(saved.phone)}` })}
        whatsappUrl={whatsapp ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}` : null}
        whatsappLabel={s.whatsapp}
        againLabel={s.again}
        onAgain={restart}
        footnote={labels.disclaimer}
      />
    );
  }

  if (message) {
    return (
      <MessageReady
        message={message}
        whatsapp={whatsapp}
        labels={labels.done}
        onEdit={() => setMessage(null)}
        fallback={<ButtonLink href={contactHref}>{labels.done.contact}</ButtonLink>}
        footnote={labels.disclaimer}
      />
    );
  }

  return (
    <form noValidate onSubmit={submit} className="relative flex flex-col gap-5 rounded-3xl border border-line bg-white p-6 shadow-card sm:p-8">
      <p className="text-sm leading-5 text-muted">{labels.required}</p>
      {familyRequestsEnabled ? <TrapField value={trap} onChange={setTrap} /> : null}

      {errors.length > 0 ? (
        <p role="alert" className="rounded-xl border border-red-700 bg-red-100 p-3 text-[15px] leading-6 font-semibold text-red-700">
          {labels.errorSummary}
        </p>
      ) : null}

      <Field id={id('student')} label={f.student.label} required error={errorOf('student')}>
        <input
          id={id('student')}
          type="text"
          autoComplete="off"
          required
          value={values.student}
          onChange={(event) => set('student', event.target.value)}
          aria-invalid={errors.includes('student') || undefined}
          aria-describedby={describedBy(id('student'), undefined, errorOf('student'))}
          className={inputClass(errors.includes('student'))}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Segmented
          legend={f.section.label}
          name={`${uid}-section`}
          value={values.section}
          options={(['francophone', 'anglophone'] as SectionId[]).map((section) => ({
            value: section as string,
            label: labels.sections[section],
            lang: sectionLang[section],
          }))}
          onChange={(value) => setTrack('section', value)}
        />
        {streams.length > 1 ? (
          <Segmented
            legend={f.stream.label}
            name={`${uid}-stream`}
            value={values.stream}
            options={streams.map((stream) => ({ value: stream as string, label: labels.streams[stream] }))}
            onChange={(value) => setTrack('stream', value)}
          />
        ) : null}
      </div>

      <Field id={id('className')} label={f.className.label} required error={errorOf('className')}>
        <select
          id={id('className')}
          required
          value={values.className}
          onChange={(event) => set('className', event.target.value)}
          aria-invalid={errors.includes('className') || undefined}
          aria-describedby={describedBy(id('className'), undefined, errorOf('className'))}
          className={inputClass(errors.includes('className'))}
        >
          <option value="">{f.className.placeholder}</option>
          {levelsOf(values.section, values.stream).map((level) => (
            <optgroup key={level.id} label={labels.cycles[level.cycle - 1]}>
              {level.classes.map((name) => (
                <option key={name} value={name} lang={sectionLang[level.section]}>
                  {name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={id('parent')} label={f.parent.label} required error={errorOf('parent')}>
          <input
            id={id('parent')}
            type="text"
            autoComplete="name"
            required
            value={values.parent}
            onChange={(event) => set('parent', event.target.value)}
            aria-invalid={errors.includes('parent') || undefined}
            aria-describedby={describedBy(id('parent'), undefined, errorOf('parent'))}
            className={inputClass(errors.includes('parent'))}
          />
        </Field>
        <Field id={id('phone')} label={f.phone.label} required hint={f.phone.hint} error={errorOf('phone')}>
          <input
            id={id('phone')}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            value={values.phone}
            onChange={(event) => set('phone', event.target.value)}
            aria-invalid={errors.includes('phone') || undefined}
            aria-describedby={describedBy(id('phone'), f.phone.hint, errorOf('phone'))}
            className={inputClass(errors.includes('phone'))}
          />
        </Field>
      </div>

      <Field id={id('message')} label={f.message.label} optional={f.message.optional}>
        <textarea
          id={id('message')}
          rows={3}
          value={values.message}
          onChange={(event) => set('message', event.target.value)}
          className={`${inputClass()} py-3`}
        />
      </Field>

      {familyRequestsEnabled ? (
        <ConsentField
          id={`${uid}-consent`}
          checked={consent}
          onChange={(checked) => {
            setConsent(checked);
            if (checked) setConsentError(false);
          }}
          labels={labels.consent}
          privacyHref={privacyHref}
          invalid={consentError}
        />
      ) : null}

      {failure ? (
        <div role="alert">
        <Notice tone="warning">
          <span className="flex flex-col items-start gap-3">
            <span>{labels.failed[failure]}</span>
            <button type="button" onClick={() => openWhatsapp(compose().text)} className={buttonClass(whatsapp ? 'whatsapp' : 'secondary')}>
              {whatsapp ? <FaWhatsapp aria-hidden="true" className="size-5" /> : null}
              {whatsapp ? labels.failed.fallbackWhatsapp : labels.failed.fallbackCopy}
            </button>
          </span>
        </Notice>
        </div>
      ) : null}

      {familyRequestsEnabled ? (
        <button type="submit" disabled={sending} aria-busy={sending || undefined} className={buttonClass('primary', 'w-full disabled:opacity-70 sm:w-auto sm:self-start')}>
          <Send aria-hidden="true" className="size-5" strokeWidth={1.75} />
          {sending ? labels.sending : mode.submit}
        </button>
      ) : (
        <button type="submit" className={buttonClass('whatsapp', 'w-full sm:w-auto sm:self-start')}>
          <FaWhatsapp aria-hidden="true" className="size-5" />
          {mode.submit}
        </button>
      )}

      <p className="flex items-start gap-2 text-sm leading-5 text-muted">
        <Lock aria-hidden="true" className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
        <span>
          {mode.privacy} {labels.disclaimer}
        </span>
      </p>
    </form>
  );
}
