import { Clock, Download, Eye, FileText } from 'lucide-react';
import { Fragment } from 'react';
import { documentCategories, localize, type DocumentCategory, type SchoolDocument } from '@content/documents';
import { buttonClass } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { LightboxGroup, LightboxTrigger, type LightboxLabels } from '@/components/ui/lightbox';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { fill, formatDate } from '@/lib/format';
import { toneCycle, tones } from '@/lib/tones';
import { cn } from '@/lib/utils';

type DocumentListProps = {
  locale: Locale;
  documents: SchoolDocument[];
  labels: Dictionary['pages']['documents'];
  viewer: LightboxLabels;
  photoWord: string;
};

const actionClass = 'min-h-11 w-auto shrink-0 px-4 text-[15px]';

/**
 * Les documents à télécharger, rubrique par rubrique. Un document en ligne s'ouvre en aperçu dans la visionneuse
 * (une image par page) et se télécharge. Un document sans fichier (content/documents.ts) est annoncé
 * « Bientôt disponible » : il n'y a jamais de lien qui ne mène nulle part.
 */
export function DocumentList({ locale, documents, labels, viewer, photoWord }: DocumentListProps) {
  const groups = documentCategories
    .map((category, index) => ({ category, tone: toneCycle[index % toneCycle.length], items: documents.filter((doc) => doc.category === category) }))
    .filter((group) => group.items.length > 0);
  const available = documents.filter((doc) => doc.file).length;
  const summary = available === 0 ? labels.available.none : fill(available === 1 ? labels.available.one : labels.available.other, { count: available });

  return (
    <section className="py-12 sm:py-16">
      <Container className="flex flex-col gap-12">
        <p className="reveal inline-flex items-center gap-2 self-start rounded-full bg-surface-alt px-4 py-2 text-[15px] leading-5 font-semibold text-navy-700">
          <FileText aria-hidden="true" className="size-4.5 text-blue-500" strokeWidth={1.75} />
          {summary}
        </p>
        {groups.map(({ category, tone, items }) => (
          <div key={category} className="grid gap-5 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10">
            <h2 className="reveal flex items-center gap-3 self-start font-display text-2xl leading-8 font-bold text-navy-700 lg:sticky lg:top-28">
              <span aria-hidden="true" className={cn('h-8 w-1.5 shrink-0 rounded-full', tones[tone].bar)} />
              {labels.categories[category as DocumentCategory]}
            </h2>
            <ul className="flex flex-col gap-3">
              {items.map((doc) => {
                const title = doc.title[locale];
                const file = doc.file ? localize(doc.file, locale) : null;
                const pages = doc.preview ? localize(doc.preview, locale) : [];
                const download = file ? { href: file, label: labels.download, download: true } : undefined;
                const row = (
                  <li
                    id={doc.id}
                    className="reveal flex scroll-mt-4 flex-col gap-4 rounded-2xl border border-line bg-white p-4 transition duration-300 hover:shadow-card sm:flex-row sm:items-center sm:p-5"
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-4">
                      {pages.length > 0 ? (
                        // La première page du document, en vignette : elle ouvre l'aperçu.
                        <LightboxTrigger index={0} badge={false} className="w-14 shrink-0 overflow-hidden rounded-md border border-line shadow-card transition duration-200 hover:-translate-y-0.5 sm:w-16">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={pages[0].replace(/\.webp$/, '-mini.webp')} alt="" width={240} height={340} loading="lazy" decoding="async" className="aspect-210/297 w-full object-cover object-top" />
                        </LightboxTrigger>
                      ) : (
                        <span aria-hidden="true" className={cn('flex size-12 shrink-0 items-center justify-center rounded-xl', file ? tones[tone].tile : 'bg-surface-alt text-muted')}>
                          <FileText className="size-6" strokeWidth={1.75} />
                        </span>
                      )}
                      <div className="flex min-w-0 flex-col gap-1">
                        <h3 className="font-display text-lg leading-6 font-semibold text-pretty text-navy-700">{title}</h3>
                        <p className="text-[15px] leading-6 text-pretty text-muted">{doc.description[locale]}</p>
                        {file ? (
                          <p className="text-[13px] leading-5 font-semibold text-muted">
                            {labels.format}
                            {doc.updated ? ` · ${fill(labels.updated, { date: formatDate(doc.updated, locale, '') })}` : ''}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    {file ? (
                      <div className="flex shrink-0 flex-wrap gap-2 self-start sm:self-center">
                        {pages.length > 0 ? (
                          <LightboxTrigger index={0} badge={false} className={buttonClass('secondary', cn(actionClass, 'cursor-pointer'))}>
                            <Eye aria-hidden="true" className="size-4.5" strokeWidth={1.75} />
                            {labels.preview}
                          </LightboxTrigger>
                        ) : (
                          <a href={file} target="_blank" rel="noopener noreferrer" aria-label={fill(labels.previewLabel, { title })} className={buttonClass('secondary', actionClass)}>
                            <Eye aria-hidden="true" className="size-4.5" strokeWidth={1.75} />
                            {labels.preview}
                          </a>
                        )}
                        <a href={file} download aria-label={fill(labels.downloadLabel, { title })} className={buttonClass('primary', actionClass)}>
                          <Download aria-hidden="true" className="size-4.5" strokeWidth={1.75} />
                          {labels.download}
                        </a>
                      </div>
                    ) : (
                      <p className="inline-flex min-h-9 shrink-0 items-center gap-2 self-start rounded-full bg-surface-alt px-3 text-sm leading-5 font-semibold text-muted sm:self-center">
                        <Clock aria-hidden="true" className="size-4" strokeWidth={1.75} />
                        {labels.soon}
                      </p>
                    )}
                  </li>
                );
                // Un document avec aperçu a sa propre visionneuse : ses pages, et le bouton de téléchargement.
                return pages.length > 0 ? (
                  <LightboxGroup
                    key={doc.id}
                    labels={viewer}
                    photoWord={photoWord}
                    items={pages.map((src, index) => ({
                      src,
                      thumb: src.replace(/\.webp$/, '-mini.webp'),
                      title: pages.length > 1 ? fill(labels.page, { title, page: index + 1, total: pages.length }) : title,
                      description: doc.description[locale],
                      action: download,
                    }))}
                  >
                    {row}
                  </LightboxGroup>
                ) : (
                  <Fragment key={doc.id}>{row}</Fragment>
                );
              })}
            </ul>
          </div>
        ))}
      </Container>
    </section>
  );
}
