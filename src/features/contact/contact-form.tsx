'use client';

import { Lock, Send } from 'lucide-react';
import { useId, useState, type FormEvent } from 'react';
import { FaWhatsapp } from 'react-icons/fa6';
import { buttonClass } from '@/components/ui/button';
import { describedBy, Field, inputClass } from '@/components/ui/field';
import { MessageReady } from '@/components/ui/message-ready';
import { Notice } from '@/components/ui/notice';
import { ConsentField, RequestSaved, TrapField, useFormClock } from '@/features/requests/request-parts';
import { familyRequestsEnabled, sendFamilyRequest, type SendResult } from '@/features/requests/send';
import type { Dictionary } from '@/i18n/dictionaries';
import { fill, formatLocalPhone } from '@/lib/format';
import { normalizePhone } from '@/lib/phone';
import { validateContact, type ContactField, type ContactValues } from './message';

type ContactFormProps = {
  labels: Dictionary['pages']['contact']['form'];
  school: string;
  /** Numéro WhatsApp du secrétariat (content/site.ts). `null` : le message est proposé à la copie. */
  whatsapp: string | null;
  /** Email du secrétariat : s'il existe, le message peut aussi partir par email. */
  email: string | null;
  privacyHref: string;
  locale: string;
};

type Failure = Extract<SendResult, { ok: false }>['reason'];

/**
 * Formulaire de contact. Comme la préinscription :
 * - back-office relié : le message est enregistré pour le secrétariat, WhatsApp en complément et en secours ;
 * - sans back-office : le message s'ouvre dans WhatsApp, à destination du secrétariat.
 */
export function ContactForm({ labels, school, whatsapp, email, privacyHref, locale }: ContactFormProps) {
  const uid = useId();
  const blank: ContactValues = { name: '', phone: '', subject: labels.subjects[0], message: '' };
  const [values, setValues] = useState<ContactValues>(blank);
  const [errors, setErrors] = useState<ContactField[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [trap, setTrap] = useState('');
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [saved, setSaved] = useState<{ text: string; phone: string } | null>(null);
  const startedAt = useFormClock();
  const f = labels.fields;
  const mode = familyRequestsEnabled ? labels : labels.whatsappOnly;

  const id = (name: ContactField) => `${uid}-${name}`;
  const errorOf = (name: 'name' | 'phone' | 'message') => (errors.includes(name) ? f[name].error : undefined);
  const set = (name: ContactField, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => current.filter((item) => item !== name));
  };

  const compose = () => {
    const phone = normalizePhone(values.phone) ?? values.phone;
    const text = fill(labels.template, {
      school,
      subject: values.subject,
      name: values.name.trim(),
      phone: `+237 ${formatLocalPhone(phone)}`,
      message: values.message.trim(),
    });
    return { text, phone };
  };

  const openWhatsapp = (text: string) => {
    setMessage(text);
    if (whatsapp) window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    const invalid = validateContact(values);
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
      'contact',
      { name: values.name, phone, subject: values.subject, message: values.message, consent: true, locale },
      { trap, startedAt: startedAt.current },
    );
    setSending(false);
    if (result.ok) setSaved({ text, phone });
    else setFailure(result.reason);
  };

  const restart = () => {
    setValues(blank);
    setConsent(false);
    setSaved(null);
    setMessage(null);
    setFailure(null);
    startedAt.current = Date.now();
  };

  if (saved) {
    return (
      <RequestSaved
        title={labels.saved.title}
        callback={fill(labels.saved.callback, { phone: `+237 ${formatLocalPhone(saved.phone)}` })}
        whatsappUrl={whatsapp ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(saved.text)}` : null}
        whatsappLabel={labels.saved.whatsapp}
        againLabel={labels.saved.again}
        onAgain={restart}
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
        email={email ? { address: email, subject: fill(labels.emailSubject, { subject: values.subject, school }), label: labels.done.email } : undefined}
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

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={id('name')} label={f.name.label} required error={errorOf('name')}>
          <input
            id={id('name')}
            type="text"
            autoComplete="name"
            required
            value={values.name}
            onChange={(event) => set('name', event.target.value)}
            aria-invalid={errors.includes('name') || undefined}
            aria-describedby={describedBy(id('name'), undefined, errorOf('name'))}
            className={inputClass(errors.includes('name'))}
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

      <Field id={id('subject')} label={f.subject.label}>
        <select id={id('subject')} value={values.subject} onChange={(event) => set('subject', event.target.value)} className={inputClass()}>
          {labels.subjects.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </Field>

      <Field id={id('message')} label={f.message.label} required error={errorOf('message')}>
        <textarea
          id={id('message')}
          rows={5}
          required
          value={values.message}
          onChange={(event) => set('message', event.target.value)}
          aria-invalid={errors.includes('message') || undefined}
          aria-describedby={describedBy(id('message'), undefined, errorOf('message'))}
          className={`${inputClass(errors.includes('message'))} py-3`}
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
        {mode.privacy}
      </p>
    </form>
  );
}
