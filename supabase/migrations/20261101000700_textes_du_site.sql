-- Réglages > Textes du site : les textes du collège saisis dans l'administration (français et anglais).
-- Un nouveau bloc de réglages « texts », publié vide : tant qu'un texte n'est pas rempli, le passage n'apparaît pas.
alter table public.content_blocks drop constraint if exists content_blocks_key_check;
alter table public.content_blocks add constraint content_blocks_key_check
  check (key in ('fees', 'payment', 'results', 'contact', 'team', 'admissions', 'photos', 'texts'));

insert into public.content_blocks (school_id, key, data, status, published_at, created_at, updated_at)
select id, 'texts', '{"fr":{},"en":{}}'::jsonb, 'published', '2026-10-12T04:00:00Z', '2026-10-12T04:00:00Z', '2026-10-12T04:00:00Z'
from public.schools where slug = 'tomi-fidele'
on conflict (school_id, key) do nothing;
