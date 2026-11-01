import enBase from '@messages/en.json';
import enAbout from '@messages/en/about.json';
import enAdmissions from '@messages/en/admissions.json';
import enCalendar from '@messages/en/calendar.json';
import enCampus from '@messages/en/campus.json';
import enContact from '@messages/en/contact.json';
import enDocuments from '@messages/en/documents.json';
import enFacilities from '@messages/en/facilities.json';
import enFees from '@messages/en/fees.json';
import enGallery from '@messages/en/gallery.json';
import enNews from '@messages/en/news.json';
import enPrivacy from '@messages/en/privacy.json';
import enPrincipal from '@messages/en/principal.json';
import enProgrammes from '@messages/en/programmes.json';
import enResults from '@messages/en/results.json';
import enSections from '@messages/en/sections.json';
import enTechnique from '@messages/en/technique.json';
import frBase from '@messages/fr.json';
import frAbout from '@messages/fr/about.json';
import frAdmissions from '@messages/fr/admissions.json';
import frCalendar from '@messages/fr/calendar.json';
import frCampus from '@messages/fr/campus.json';
import frContact from '@messages/fr/contact.json';
import frDocuments from '@messages/fr/documents.json';
import frFacilities from '@messages/fr/facilities.json';
import frFees from '@messages/fr/fees.json';
import frGallery from '@messages/fr/gallery.json';
import frNews from '@messages/fr/news.json';
import frPrivacy from '@messages/fr/privacy.json';
import frPrincipal from '@messages/fr/principal.json';
import frProgrammes from '@messages/fr/programmes.json';
import frResults from '@messages/fr/results.json';
import frSections from '@messages/fr/sections.json';
import frTechnique from '@messages/fr/technique.json';
import textsData from '@content/data/texts.json';
import { typo } from '@/lib/format';
import { showPlaceholders } from '@/lib/placeholders';
import type { Locale } from './config';
import { applyOverrides, cleanPlaceholders, overridesFor, type TextOverrides } from './texts';

/**
 * Les textes du site.
 * - `messages/<langue>.json` : menu, accueil, pied de page et textes communs.
 * - `messages/<langue>/<page>.json` : les textes d'une page, rangés sous `dict.pages.<page>`.
 *
 * Pour ajouter une page : créer son fichier dans les deux langues, puis l'ajouter aux deux objets ci-dessous.
 */
const fr = {
  ...frBase,
  pages: {
    about: frAbout,
    principal: frPrincipal,
    programmes: frProgrammes,
    sections: frSections,
    technique: frTechnique,
    facilities: frFacilities,
    admissions: frAdmissions,
    fees: frFees,
    results: frResults,
    campus: frCampus,
    calendar: frCalendar,
    news: frNews,
    gallery: frGallery,
    documents: frDocuments,
    contact: frContact,
    privacy: frPrivacy,
  },
};

/** Le français sert de référence : toute clé doit exister dans les deux langues, sinon la compilation échoue. */
export type Dictionary = typeof fr;

const en: Dictionary = {
  ...enBase,
  pages: {
    about: enAbout,
    principal: enPrincipal,
    programmes: enProgrammes,
    sections: enSections,
    technique: enTechnique,
    facilities: enFacilities,
    admissions: enAdmissions,
    fees: enFees,
    results: enResults,
    campus: enCampus,
    calendar: enCalendar,
    news: enNews,
    gallery: enGallery,
    documents: enDocuments,
    contact: enContact,
    privacy: enPrivacy,
  },
};

// Les textes saisis dans l'administration (content/data/texts.json) remplacent les emplacements entre crochets,
// puis les textes français reçoivent leurs espaces insécables, une fois pour toutes (voir `typo`).
const saved = textsData as TextOverrides;
// Le site public ne montre jamais de crochets : ce qui reste à fournir est retiré (et la section se replie).
// NEXT_PUBLIC_SHOW_PLACEHOLDERS=true les fait réapparaître, pour voir la maquette complète avec ses emplacements.
const finish = <T,>(value: T): T => (showPlaceholders ? value : cleanPlaceholders(value));
const dictionaries: Record<Locale, Dictionary> = {
  fr: finish(typo(applyOverrides(fr, overridesFor('fr', saved)), 'fr')),
  en: finish(applyOverrides(en, overridesFor('en', saved, en))),
};

/** Les textes d'origine, avant les saisies de l'administration (pour l'écran « Textes du site »). */
export const sourceTexts = { fr, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
