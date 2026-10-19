import { ChevronDown } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';

type FaqProps = {
  id?: string;
  eyebrow: string;
  title: string;
  items: { q: string; a: string }[];
};

/**
 * Questions fréquentes en volets dépliables, sans JavaScript (balises <details>).
 * Les réponses réelles sont aussi publiées en données structurées « FAQPage » pour Google ;
 * une réponse encore entre crochets n'y figure pas.
 */
export function Faq({ id, eyebrow, title, items }: FaqProps) {
  const answered = items.filter((item) => !item.a.trim().startsWith('['));
  const structured = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: answered.map((item) => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })),
  };

  return (
    <section id={id} className="bg-surface-alt py-16 sm:py-24">
      <Container className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <SectionHeading eyebrow={eyebrow} title={title} accent="gold" className="reveal lg:sticky lg:top-28 lg:self-start" />
        <div className="flex flex-col gap-3">
          {items.map((item, index) => (
            <details
              key={item.q}
              open={index === 0}
              className="group reveal rounded-2xl border border-line bg-white transition-colors open:border-gold-400 hover:border-gold-400"
            >
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 font-display text-lg leading-6 font-semibold text-navy-700 [&::-webkit-details-marker]:hidden">
                {item.q}
                <span
                  aria-hidden="true"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold-100 text-gold-700 transition-transform duration-200 group-open:rotate-180"
                >
                  <ChevronDown className="size-5" strokeWidth={2} />
                </span>
              </summary>
              <p className="px-5 pb-5 text-pretty">{item.a}</p>
            </details>
          ))}
        </div>
      </Container>
      {answered.length > 0 ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured) }} /> : null}
    </section>
  );
}
