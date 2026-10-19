import { ArrowDown } from 'lucide-react';
import { Container } from '@/components/ui/container';

type AnchorNavProps = {
  /** Nom accessible, par exemple « Sur cette page ». */
  label: string;
  items: { id: string; label: string }[];
};

/**
 * Sommaire cliquable d'une page longue : une rangée de liens vers les sections.
 * Sur téléphone, la rangée défile horizontalement au lieu de passer sur plusieurs lignes.
 */
export function AnchorNav({ label, items }: AnchorNavProps) {
  return (
    <nav aria-label={label} className="border-b border-line bg-white">
      <Container className="flex items-center gap-4">
        <p className="hidden shrink-0 text-[13px] leading-4 font-semibold tracking-[0.08em] text-muted uppercase lg:block">{label}</p>
        <ul className="-mx-4 flex flex-1 gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
          {items.map((item) => (
            <li key={item.id} className="shrink-0">
              <a
                href={`#${item.id}`}
                className="group inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line bg-surface-alt px-4 text-[15px] font-semibold text-navy-700 transition-colors hover:border-gold-400 hover:bg-gold-100"
              >
                {item.label}
                <ArrowDown aria-hidden="true" className="size-4 text-blue-500 transition-transform group-hover:translate-y-0.5" strokeWidth={2} />
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </nav>
  );
}
