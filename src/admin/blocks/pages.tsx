'use client';

import contactData from '@content/data/contact.json';
import admissionsData from '@content/data/admissions.json';
import feesData from '@content/data/fees.json';
import paymentData from '@content/data/payment.json';
import resultsData from '@content/data/results.json';
import teamData from '@content/data/team.json';
import photosData from '@content/data/photos.json';
import { BlockEditorPage } from './editor';
import { AdmissionsForm, ContactForm, FeesForm, PaymentForm, PhotosForm, ResultsForm, TeamForm } from './forms';
import type { BlockData, BlockKey } from './model';

/**
 * Les sept écrans de réglages. Les valeurs de départ sont celles des fichiers du projet (content/data/*.json) :
 * elles servent si le bloc n'existe pas encore dans la base.
 */
const initial = {
  contact: contactData,
  admissions: admissionsData,
  fees: feesData,
  payment: paymentData,
  results: resultsData,
  team: teamData,
  photos: photosData,
} as unknown as BlockData;

export const blockPages: { key: BlockKey; path: string; title: string; summary: string; superAdminOnly?: boolean }[] = [
  { key: 'contact', path: '/admin/reglages/coordonnees/', title: 'Coordonnées et chiffres clés', summary: 'Adresse, téléphones, WhatsApp, email, horaires, réseaux sociaux, chiffres clés.' },
  { key: 'admissions', path: '/admin/reglages/admissions/', title: 'Admissions', summary: 'Année scolaire des inscriptions et dates des concours d’entrée.' },
  { key: 'fees', path: '/admin/reglages/frais/', title: 'Frais de scolarité', summary: 'Tranches, échéances, frais d’inscription, scolarité par niveau, grille PDF.' },
  { key: 'payment', path: '/admin/reglages/paiement/', title: 'Paiement', summary: 'Numéros Mobile Money et paiement au secrétariat.', superAdminOnly: true },
  { key: 'results', path: '/admin/reglages/resultats/', title: 'Résultats aux examens', summary: 'Inscrits et admis par examen et par session.' },
  { key: 'team', path: '/admin/reglages/equipe/', title: 'Équipe de direction', summary: 'Le Principal et l’équipe : noms, fonctions, portraits.' },
  { key: 'photos', path: '/admin/reglages/photos/', title: 'Photos du site', summary: 'Les photos des pages : accueil, programmes, infrastructures, vie scolaire.' },
];

const page = (key: BlockKey) => blockPages.find((p) => p.key === key)!;

export function ContactSettings() {
  return <BlockEditorPage blockKey="contact" title={page('contact').title} intro="Ces informations s’affichent sur toutes les pages du site. Une case vide garde l’emplacement « à fournir »." initial={initial.contact} form={(props) => <ContactForm {...props} />} />;
}
export function AdmissionsSettings() {
  return <BlockEditorPage blockKey="admissions" title={page('admissions').title} intro="Les repères de la rentrée, sur la page Admissions et dans le bandeau d’annonce." initial={initial.admissions} form={(props) => <AdmissionsForm {...props} />} />;
}
export function FeesSettings() {
  return <BlockEditorPage blockKey="fees" title={page('fees').title} intro="La seule source des montants affichés sur le site : grille, simulateur et page Admissions." initial={initial.fees} form={(props) => <FeesForm {...props} />} />;
}
export function PaymentSettings() {
  return <BlockEditorPage blockKey="payment" title={page('payment').title} intro="Où et comment les familles paient." initial={initial.payment} superAdminOnly form={(props) => <PaymentForm {...props} />} />;
}
export function ResultsSettings() {
  return <BlockEditorPage blockKey="results" title={page('results').title} intro="Uniquement les chiffres officiels du collège." initial={initial.results} form={(props) => <ResultsForm {...props} />} />;
}
export function TeamSettings() {
  return <BlockEditorPage blockKey="team" title={page('team').title} intro="Les personnes présentées sur le site." initial={initial.team} form={(props) => <TeamForm {...props} />} />;
}
export function PhotosSettings() {
  return <BlockEditorPage blockKey="photos" title={page('photos').title} intro="Chaque photo remplace un emplacement gris du site. Elles sont réduites automatiquement avant l’envoi." initial={initial.photos} form={(props) => <PhotosForm {...props} />} />;
}
