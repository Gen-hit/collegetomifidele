import { Banknote, Smartphone } from 'lucide-react';
import { fees } from '@content/fees';
import { Container } from '@/components/ui/container';
import { Notice } from '@/components/ui/notice';
import { SectionHeading } from '@/components/ui/section-heading';
import type { Dictionary } from '@/i18n/dictionaries';
import { fill, formatLocalPhone } from '@/lib/format';
import { tones, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';

/** Une teinte par carte, dans l'ordre : premier opérateur, second opérateur. */
const mobileTones: Tone[] = ['gold', 'blue'];

function Steps({ items, tone }: { items: string[]; tone: Tone }) {
  return (
    <ol className="flex flex-col gap-2.5">
      {items.map((step, index) => (
        <li key={step} className="flex items-start gap-3 text-[15px] leading-6">
          <span aria-hidden="true" className={cn('mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold', tones[tone].tile)}>
            {index + 1}
          </span>
          {step}
        </li>
      ))}
    </ol>
  );
}

/**
 * Les moyens de paiement : Mobile Money (numéro et nom du compte) et caisse du secrétariat.
 * Les numéros viennent de content/fees.ts. Le nom du compte est mis en avant : c'est lui que le parent
 * doit reconnaître sur son téléphone avant de valider.
 */
export function PaymentMethods({ id, labels }: { id?: string; labels: Dictionary['pages']['fees']['payment'] }) {
  return (
    <section id={id} className="py-16 sm:py-24">
      <Container className="flex flex-col gap-10">
        <SectionHeading eyebrow={labels.eyebrow} title={labels.title} intro={labels.intro} accent="gold" className="reveal" />
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {fees.mobileMoney.map((method, index) => {
            const tone = mobileTones[index % mobileTones.length];
            const look = tones[tone];
            return (
              <li key={method.id} className="reveal relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-line bg-white p-6">
                <span aria-hidden="true" className={cn('absolute inset-x-0 top-0 h-1.5', look.bar)} />
                <h3 className="flex items-center gap-3 pt-1 font-display text-xl leading-7 font-semibold">
                  <span aria-hidden="true" className={cn('flex size-11 shrink-0 items-center justify-center rounded-[10px]', look.tile)}>
                    <Smartphone className="size-5" strokeWidth={1.75} />
                  </span>
                  {method.name}
                </h3>
                <dl className={cn('flex flex-col gap-3 rounded-xl p-4', look.soft)}>
                  <div className="flex flex-col">
                    <dt className="text-[13px] leading-5 font-semibold tracking-[0.06em] text-muted uppercase">{labels.numberLabel}</dt>
                    <dd className="font-display text-2xl leading-8 font-bold text-navy-700">
                      {method.number ? formatLocalPhone(method.number) : labels.numberPlaceholder}
                    </dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-[13px] leading-5 font-semibold tracking-[0.06em] text-muted uppercase">{labels.holderLabel}</dt>
                    <dd className="font-semibold">{method.holder ?? labels.holderPlaceholder}</dd>
                  </div>
                </dl>
                <Steps tone={tone} items={labels.steps.map((step) => fill(step, { ussd: method.ussd }))} />
              </li>
            );
          })}
          {fees.cashDesk ? (
            <li className="reveal relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-line bg-white p-6 md:col-span-2 lg:col-span-1">
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-green-700" />
              <h3 className="flex items-center gap-3 pt-1 font-display text-xl leading-7 font-semibold">
                <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-[10px] bg-green-100 text-green-700">
                  <Banknote className="size-5" strokeWidth={1.75} />
                </span>
                {labels.cash.title}
              </h3>
              <dl className="flex flex-col rounded-xl bg-green-100 p-4">
                <dt className="text-[13px] leading-5 font-semibold tracking-[0.06em] text-muted uppercase">{labels.cash.label}</dt>
                <dd className="font-display text-2xl leading-8 font-bold text-navy-700">{labels.cash.value}</dd>
              </dl>
              <Steps tone="green" items={labels.cash.steps} />
            </li>
          ) : null}
        </ul>
        <Notice tone="warning" title={labels.warning.title} className="reveal max-w-3xl">
          {labels.warning.text}
        </Notice>
      </Container>
    </section>
  );
}
