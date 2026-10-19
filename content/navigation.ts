/**
 * Structure du menu. Les libellés et descriptions sont dans messages/*.json,
 * sous `nav.<key>`. Les chemins sont identiques dans les deux langues.
 */
export type NavIcon =
  | 'school'
  | 'history'
  | 'user'
  | 'users'
  | 'book'
  | 'languages'
  | 'wrench'
  | 'chart'
  | 'sparkles'
  | 'scroll'
  | 'calendar'
  | 'images'
  | 'file'
  | 'clipboard'
  | 'wallet'
  | 'calculator'
  | 'send'
  | 'help';

export type NavChild = { key: string; path: string; icon: NavIcon };
export type NavItem = { key: string; path: string; children?: NavChild[] };

export const mainNav: NavItem[] = [
  {
    key: 'about',
    path: '/about',
    children: [
      { key: 'aboutOverview', path: '/about', icon: 'school' },
      { key: 'aboutHistory', path: '/about#histoire', icon: 'history' },
      { key: 'principal', path: '/about/principal', icon: 'user' },
      { key: 'team', path: '/about#equipe', icon: 'users' },
    ],
  },
  {
    key: 'programmes',
    path: '/programmes',
    children: [
      { key: 'francophone', path: '/programmes/francophone', icon: 'book' },
      { key: 'anglophone', path: '/programmes/anglophone', icon: 'languages' },
      { key: 'technique', path: '/programmes/technique', icon: 'wrench' },
      { key: 'results', path: '/results', icon: 'chart' },
    ],
  },
  { key: 'facilities', path: '/facilities' },
  {
    key: 'campus',
    path: '/campus',
    children: [
      { key: 'clubs', path: '/campus#clubs', icon: 'sparkles' },
      { key: 'rules', path: '/campus#reglement', icon: 'scroll' },
      { key: 'calendar', path: '/calendar', icon: 'calendar' },
      { key: 'gallery', path: '/gallery', icon: 'images' },
      { key: 'documents', path: '/documents', icon: 'file' },
    ],
  },
  { key: 'news', path: '/news' },
  {
    key: 'admissions',
    path: '/admissions',
    children: [
      { key: 'procedure', path: '/admissions#procedure', icon: 'clipboard' },
      { key: 'fees', path: '/admissions/fees', icon: 'wallet' },
      { key: 'simulator', path: '/admissions/fees#simulateur', icon: 'calculator' },
      { key: 'apply', path: '/admissions#preinscription', icon: 'send' },
      { key: 'faq', path: '/admissions#faq', icon: 'help' },
    ],
  },
  { key: 'contact', path: '/contact' },
];
