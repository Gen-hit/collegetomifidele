import { Info, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const looks = {
  info: { box: 'border-sky-200 bg-sky-100', icon: 'text-blue-500', Icon: Info },
  warning: { box: 'border-gold-300 bg-gold-100', icon: 'text-gold-700', Icon: TriangleAlert },
} as const;

type NoticeProps = { tone?: keyof typeof looks; title?: string; children: ReactNode; className?: string };

/** Encadré d'information ou de mise en garde. Le pictogramme et le titre portent le sens, pas la couleur seule. */
export function Notice({ tone = 'info', title, children, className }: NoticeProps) {
  const { box, icon, Icon } = looks[tone];
  return (
    <div className={cn('flex items-start gap-3 rounded-2xl border p-4 text-[15px] leading-6 sm:p-5', box, className)}>
      <Icon aria-hidden="true" className={cn('mt-0.5 size-5 shrink-0', icon)} strokeWidth={1.75} />
      <div className="flex flex-col gap-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div>{children}</div>
      </div>
    </div>
  );
}
