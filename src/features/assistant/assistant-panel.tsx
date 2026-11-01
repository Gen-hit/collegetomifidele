'use client';

import { ArrowRight, Bot, Send, X } from 'lucide-react';
import Link from 'next/link';
import { Dialog } from 'radix-ui';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { FaWhatsapp } from 'react-icons/fa6';
import { href, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { cn } from '@/lib/utils';
import { askAssistant } from './provider';

type Message = { id: number; from: 'bot' | 'user'; text: string; link?: { href: string; label: string } };

export type AssistantTopic = { id: string; label: string; answer: string; href: string; linkLabel: string };

/** Mots qui rattachent une question libre à un sujet guidé (début de mot, sans accents, français et anglais). */
const topicWords: Record<string, string[]> = {
  fees: ['frais', 'scolarit', 'tranche', 'pai', 'pay', 'prix', 'cout', 'montant', 'combien', 'momo', 'mobile money', 'fee', 'tuition', 'cost', 'price', 'how much'],
  enroll: ['inscri', 'preinscri', 'admission', 'dossier', 'concours', 'piece', 'enrol', 'apply', 'applica', 'register', 'entrance'],
  programmes: ['classe', 'filiere', 'section', 'programme', 'technique', 'anglophone', 'francophone', 'bac', 'bepc', 'probatoire', 'gce', 'cap', 'specialit', 'course', 'stream', 'subject', 'level'],
  calendar: ['date', 'calendrier', 'rentree', 'vacance', 'conge', 'examen', 'ferie', 'calendar', 'holiday', 'term', 'exam', 'when'],
  location: ['ou se trouve', 'ou est', 'adresse', 'situe', 'trouver', 'carte', 'itineraire', 'quartier', 'where', 'address', 'map', 'location', 'direction'],
};

const plain = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/** Le sujet guidé dont le plus de mots apparaissent dans la question, ou rien. */
export function matchTopic(question: string, topics: AssistantTopic[]): AssistantTopic | null {
  const q = ` ${plain(question).replace(/[^a-z0-9 ]+/g, ' ')} `;
  let best: AssistantTopic | null = null;
  let score = 0;
  for (const topic of topics) {
    const hits = (topicWords[topic.id] ?? []).filter((word) => q.includes(` ${word}`)).length;
    if (hits > score) [best, score] = [topic, hits];
  }
  return best;
}

type AssistantPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locale: Locale;
  labels: Omit<Dictionary['assistant'], 'topics'>;
  topics: AssistantTopic[];
  /** Lien WhatsApp du secrétariat ; `null` tant que le numéro n'est pas renseigné. */
  whatsappHref: string | null;
};

/**
 * Fenêtre du mini-assistant : réponses guidées par sujet, et message par défaut pour toute
 * question libre tant que l'assistant n'est pas branché (voir provider.ts).
 */
export function AssistantPanel({ open, onOpenChange, locale, labels, topics, whatsappHref }: AssistantPanelProps) {
  const contactHref = href(locale, '/contact');
  const [messages, setMessages] = useState<Message[]>([{ id: 0, from: 'bot', text: labels.welcome }]);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);
  const nextId = useRef(1);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, open]);

  const push = (...items: Omit<Message, 'id'>[]) =>
    setMessages((current) => [...current, ...items.map((item) => ({ ...item, id: nextId.current++ }))]);

  const chooseTopic = (topic: AssistantTopic) =>
    push(
      { from: 'user', text: topic.label },
      { from: 'bot', text: topic.answer, link: { href: topic.href, label: topic.linkLabel } },
    );

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const question = draft.trim();
    if (!question || pending) return;
    setDraft('');
    push({ from: 'user', text: question });
    setPending(true);
    const answer = await askAssistant(question, locale);
    setPending(false);
    if (answer) return push({ from: 'bot', text: answer });
    // Sans assistant en ligne : la question est rapprochée d'un sujet guidé, sinon renvoyée au secrétariat.
    const topic = matchTopic(question, topics);
    if (topic) return push({ from: 'bot', text: topic.answer, link: { href: topic.href, label: topic.linkLabel } });
    push({ from: 'bot', text: labels.fallback, link: { href: contactHref, label: labels.contactLink } });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-indigo-950/40 sm:bg-transparent" />
        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            'fixed z-50 flex flex-col overflow-hidden bg-white shadow-float data-[state=open]:animate-pop',
            'inset-x-0 bottom-0 h-[85dvh] rounded-t-3xl',
            'sm:inset-x-auto sm:right-4 sm:bottom-4 sm:h-[min(36rem,calc(100dvh-2rem))] sm:w-96 sm:rounded-3xl sm:border sm:border-line',
          )}
        >
          <header className="on-dark flex shrink-0 items-center gap-3 bg-navy-700 px-4 py-3 text-white">
            <span className="flex size-10 items-center justify-center rounded-full bg-gold-400 text-ink">
              <Bot aria-hidden="true" className="size-5" strokeWidth={1.75} />
            </span>
            <div className="flex flex-1 flex-col">
              <Dialog.Title className="font-display text-lg leading-6 font-bold">{labels.title}</Dialog.Title>
              <span className="text-sm leading-5 text-sky-200">{labels.subtitle}</span>
            </div>
            <Dialog.Close
              aria-label={labels.close}
              className="flex size-11 items-center justify-center rounded-full transition-colors hover:bg-white/15"
            >
              <X aria-hidden="true" className="size-5" strokeWidth={2} />
            </Dialog.Close>
          </header>

          <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-surface-alt p-4" aria-live="polite">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex max-w-[88%] animate-pop flex-col gap-2 rounded-2xl px-4 py-3 text-[15px] leading-6',
                  message.from === 'bot'
                    ? 'self-start rounded-bl-md border border-line bg-white text-ink'
                    : 'self-end rounded-br-md bg-navy-700 text-white',
                )}
              >
                <p>{message.text}</p>
                {message.link ? (
                  <Link
                    href={message.link.href}
                    onClick={() => onOpenChange(false)}
                    className="inline-flex min-h-11 items-center gap-1 self-start font-semibold text-blue-600 underline underline-offset-4"
                  >
                    {message.link.label}
                    <ArrowRight aria-hidden="true" className="size-4" strokeWidth={2} />
                  </Link>
                ) : null}
              </div>
            ))}
            {pending ? <div className="self-start rounded-2xl border border-line bg-white px-4 py-3 text-muted">…</div> : null}

            <div className="mt-1 flex flex-col gap-2">
              <p className="text-[13px] leading-4 font-semibold tracking-[0.08em] text-muted uppercase">{labels.topicsLabel}</p>
              <div className="flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => chooseTopic(topic)}
                    className="min-h-11 rounded-full border border-blue-600 bg-white px-4 text-[15px] font-semibold text-blue-600 transition-colors hover:bg-sky-100"
                  >
                    {topic.label}
                  </button>
                ))}
              </div>
              {whatsappHref ? (
                <a
                  href={whatsappHref}
                  className="inline-flex min-h-11 items-center gap-2 self-start font-semibold text-green-700 underline underline-offset-4"
                >
                  <FaWhatsapp aria-hidden="true" className="size-5" />
                  {labels.whatsapp}
                </a>
              ) : null}
            </div>
            <div ref={endRef} />
          </div>

          <form onSubmit={submit} className="flex shrink-0 items-center gap-2 border-t border-line bg-white p-3">
            <label htmlFor="assistant-input" className="sr-only">
              {labels.inputLabel}
            </label>
            <input
              id="assistant-input"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={labels.inputPlaceholder}
              autoComplete="off"
              className="min-h-12 flex-1 rounded-full border border-control bg-white px-4 text-base text-ink placeholder:text-muted"
            />
            <button
              type="submit"
              aria-label={labels.send}
              disabled={pending}
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-navy-700 text-white transition-colors hover:bg-indigo-900 disabled:opacity-60"
            >
              <Send aria-hidden="true" className="size-5" strokeWidth={1.75} />
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
