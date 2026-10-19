-- ════════════════════════════════════════════════════════════════════════════════════════════
-- Back-office du site du Collège Tomi Fidele · Lot B1 · Socle
--
-- Principes
--   • Le site public est statique : il ne lit jamais ces tables directement. Au moment de la
--     construction, il appelle site_snapshot('tomi-fidele'), qui ne renvoie que le contenu publié,
--     déjà au format des fichiers content/data/*.json. C'est le « contrat » du site : EduFlow
--     pourra plus tard fournir le même JSON.
--   • Trois rôles : super_admin (WINX), principal, secretariat.
--     Ce qui est en ligne ne change qu'avec l'accord du Principal : une modification du secrétariat
--     sur un contenu publié devient une proposition (colonne `pending`), la version en ligne reste
--     en place jusqu'à validation. Le réglage `secretariat_can_publish` lève cette règle.
--   • Chaque ligne porte `school_id` : la même base pourra servir d'autres établissements.
--   • Rien ne se supprime par erreur : le secrétariat et le Principal archivent (`deleted_at`),
--     seul le super admin supprime définitivement.
-- ════════════════════════════════════════════════════════════════════════════════════════════

create schema if not exists app;
grant usage on schema app to anon, authenticated;

-- ── Établissements, comptes, invitations, réglages ─────────────────────────────────────────

create table public.schools (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  school_id uuid not null references public.schools (id),
  full_name text not null default '',
  role text not null check (role in ('super_admin', 'principal', 'secretariat')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Une adresse invitée peut créer son compte ; toute autre adresse est refusée.
create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id),
  email text not null,
  full_name text not null default '',
  role text not null check (role in ('super_admin', 'principal', 'secretariat')),
  invited_by uuid references auth.users (id),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index invitations_email_open on public.invitations (lower(email)) where accepted_at is null;

create table public.school_settings (
  school_id uuid primary key references public.schools (id) on delete cascade,
  -- Le secrétariat publie-t-il sans validation du Principal ?
  secretariat_can_publish boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id)
);

-- ── Fonctions d'aide (schéma `app`, non exposé par l'API) ─────────────────────────────────

create or replace function app.my_profile() returns public.profiles
language sql stable security definer set search_path = '' as $$
  select p.* from public.profiles p where p.id = auth.uid() and p.active
$$;

create or replace function app.my_school() returns uuid
language sql stable security definer set search_path = '' as $$
  select p.school_id from public.profiles p where p.id = auth.uid() and p.active
$$;

create or replace function app.my_role() returns text
language sql stable security definer set search_path = '' as $$
  select p.role from public.profiles p where p.id = auth.uid() and p.active
$$;

-- Peut mettre en ligne, valider une proposition, archiver un contenu publié.
create or replace function app.can_publish() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce(
    (select p.role in ('super_admin', 'principal')
            or (p.role = 'secretariat' and coalesce(s.secretariat_can_publish, false))
       from public.profiles p
       left join public.school_settings s on s.school_id = p.school_id
      where p.id = auth.uid() and p.active),
    false)
$$;

grant execute on function app.my_profile(), app.my_school(), app.my_role(), app.can_publish() to authenticated;

-- ── Contenus ───────────────────────────────────────────────────────────────────────────────
-- Colonnes communes : status (draft | submitted | published), pending (proposition sur un
-- contenu publié), traçabilité, archivage. Les textes anglais sont facultatifs : vides, le
-- site reprend le français.

create table public.news (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id),
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  date date,
  category text not null default 'life' check (category in ('academic', 'sport', 'culture', 'announcement', 'life')),
  featured boolean not null default false,
  is_sample boolean not null default false,
  cover text,
  cover_caption_fr text not null default '',
  cover_caption_en text not null default '',
  title_fr text not null check (length(trim(title_fr)) > 0),
  title_en text not null default '',
  summary_fr text not null default '',
  summary_en text not null default '',
  body_fr text not null default '',
  body_en text not null default '',
  status text not null default 'draft' check (status in ('draft', 'submitted', 'published')),
  pending jsonb,
  pending_by uuid references auth.users (id),
  pending_at timestamptz,
  published_at timestamptz,
  published_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id),
  deleted_at timestamptz,
  unique (school_id, slug)
);

create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id),
  -- Identifiant des liens partagés (…/calendar/#evt-<key>) : ne change plus après publication.
  key text not null check (key ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category text not null check (category in ('term', 'evaluation', 'exam', 'holiday', 'international', 'openDay', 'culture', 'meeting')),
  start_date date,
  end_date date,
  title_fr text not null check (length(trim(title_fr)) > 0),
  title_en text not null default '',
  note_fr text not null default '',
  note_en text not null default '',
  confirm boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'published')),
  pending jsonb,
  pending_by uuid references auth.users (id),
  pending_at timestamptz,
  published_at timestamptz,
  published_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id),
  deleted_at timestamptz,
  unique (school_id, key),
  check (end_date is null or start_date is not null),
  check (end_date is null or end_date >= start_date)
);

create table public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id),
  category text not null check (category in ('campus', 'classes', 'workshops', 'sport', 'events')),
  src text,
  thumb text,
  width integer,
  height integer,
  caption_fr text not null check (length(trim(caption_fr)) > 0),
  caption_en text not null default '',
  description_fr text not null default '',
  description_en text not null default '',
  position integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'published')),
  pending jsonb,
  pending_by uuid references auth.users (id),
  pending_at timestamptz,
  published_at timestamptz,
  published_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id),
  deleted_at timestamptz
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id),
  key text not null check (key ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category text not null check (category in ('rules', 'admissions', 'supplies', 'school')),
  title_fr text not null check (length(trim(title_fr)) > 0),
  title_en text not null default '',
  description_fr text not null default '',
  description_en text not null default '',
  -- Chemin du site ('/documents/x.pdf') ou fichier déposé dans le stockage ('storage:<école>/documents/x.pdf').
  file_fr text,
  file_en text,
  preview_fr jsonb,
  preview_en jsonb,
  updated_on date,
  -- Le fichier de la grille des frais vient de la page « Frais » (bloc fees.gridPdf).
  uses_fee_grid boolean not null default false,
  position integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'published')),
  pending jsonb,
  pending_by uuid references auth.users (id),
  pending_at timestamptz,
  published_at timestamptz,
  published_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id),
  deleted_at timestamptz,
  unique (school_id, key)
);

-- Contenus d'un seul tenant : frais, numéros de paiement, résultats, coordonnées, équipe, admissions,
-- photos des pages. `data` reprend la forme des fichiers content/*.ts.
create table public.content_blocks (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id),
  key text not null check (key in ('fees', 'payment', 'results', 'contact', 'team', 'admissions', 'photos')),
  data jsonb not null default '{}'::jsonb,
  status text not null default 'published' check (status in ('draft', 'submitted', 'published')),
  pending jsonb,
  pending_by uuid references auth.users (id),
  pending_at timestamptz,
  published_at timestamptz,
  published_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id),
  deleted_at timestamptz,
  unique (school_id, key)
);

-- ── Demandes des familles (lot B3 : écrites par une fonction serveur, jamais par le public) ──

create table public.preinscriptions (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id),
  reference text not null,
  student_name text not null,
  birth_date date,
  target_class text not null,
  section text,
  previous_school text,
  parent_name text not null,
  parent_phone text not null,
  parent_email text,
  message text,
  locale text not null default 'fr',
  consent_at timestamptz not null,
  status text not null default 'new' check (status in ('new', 'contacted', 'accepted', 'rejected')),
  internal_note text not null default '',
  handled_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (school_id, reference)
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id),
  name text not null,
  phone text not null,
  email text,
  subject text not null,
  message text not null,
  locale text not null default 'fr',
  consent_at timestamptz not null,
  status text not null default 'new' check (status in ('new', 'handled')),
  internal_note text not null default '',
  handled_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ── Mises à jour du site et journal ──────────────────────────────────────────────────────

create table public.publications (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id),
  requested_by uuid references auth.users (id),
  requested_at timestamptz not null default now(),
  status text not null default 'requested' check (status in ('requested', 'sent', 'failed', 'done')),
  detail text not null default ''
);

create table public.activity_log (
  id bigint generated always as identity primary key,
  school_id uuid not null references public.schools (id),
  actor uuid references auth.users (id),
  action text not null,
  entity text not null,
  entity_id uuid,
  label text not null default '',
  at timestamptz not null default now()
);

create index on public.news (school_id, status) where deleted_at is null;
create index on public.calendar_events (school_id, status) where deleted_at is null;
create index on public.gallery_photos (school_id, status, position) where deleted_at is null;
create index on public.documents (school_id, status, position) where deleted_at is null;
create index on public.preinscriptions (school_id, status, created_at desc) where deleted_at is null;
create index on public.contact_messages (school_id, status, created_at desc) where deleted_at is null;
create index on public.activity_log (school_id, at desc);
create index on public.publications (school_id, requested_at desc);

-- ── Garde-fou de publication (déclencheur commun aux contenus) ────────────────────────────
-- Le navigateur envoie toujours la ligne entière ; c'est la base qui décide :
--   • qui ne peut pas publier ne met jamais une ligne en ligne : « published » devient « submitted » ;
--   • sur un contenu déjà en ligne, ses changements deviennent une proposition (`pending`),
--     la version en ligne reste intacte ; une demande d'archivage devient {"_archive": true} ;
--   • l'établissement, l'auteur et les dates de suivi sont fixés par la base, pas par le navigateur.

create or replace function app.guard_content() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  publisher boolean;
  meta text[] := array['id', 'school_id', 'status', 'pending', 'pending_by', 'pending_at', 'published_at',
                       'published_by', 'created_at', 'created_by', 'updated_at', 'updated_by', 'deleted_at'];
begin
  -- Migrations, import initial et fonctions serveur : pas d'utilisateur, pas de contrôle.
  if uid is null then
    return new;
  end if;

  publisher := app.can_publish();

  -- Les numéros de paiement ne sont modifiables que par le super admin.
  if tg_table_name = 'content_blocks' and (to_jsonb(new) ->> 'key') = 'payment' and app.my_role() is distinct from 'super_admin' then
    raise exception 'Seul le super administrateur modifie les numéros de paiement.' using errcode = '42501';
  end if;

  new.updated_at := now();
  new.updated_by := uid;

  if tg_op = 'INSERT' then
    new.school_id := app.my_school();
    new.created_by := uid;
    new.created_at := now();
    new.pending := null; new.pending_by := null; new.pending_at := null;
    new.deleted_at := null;
    if new.status = 'published' and not publisher then
      new.status := 'submitted';
    end if;
    if new.status = 'published' then
      new.published_at := now(); new.published_by := uid;
    else
      new.published_at := null; new.published_by := null;
    end if;
    return new;
  end if;

  -- UPDATE : ce qui identifie et trace la ligne ne bouge pas.
  new.school_id := old.school_id;
  new.created_by := old.created_by;
  new.created_at := old.created_at;

  if publisher then
    if new.status = 'published' and old.status is distinct from 'published' then
      new.published_at := now(); new.published_by := uid;
    elsif new.status = 'published' and (to_jsonb(new) - meta) is distinct from (to_jsonb(old) - meta) then
      new.published_at := now(); new.published_by := uid;
    elsif new.status <> 'published' then
      new.published_at := null; new.published_by := null;
    else
      new.published_at := old.published_at; new.published_by := old.published_by;
    end if;
    -- Une validation vide la proposition ; sinon on garde celle qui existe.
    if new.pending is distinct from old.pending and new.pending is not null then
      new.pending := old.pending; new.pending_by := old.pending_by; new.pending_at := old.pending_at;
    end if;
    if new.pending is null then
      new.pending_by := null; new.pending_at := null;
    end if;
    return new;
  end if;

  -- Sans droit de publication.
  if old.status = 'published' and old.deleted_at is null then
    if new.deleted_at is not null then
      -- Demande d'archivage d'un contenu en ligne.
      new := jsonb_populate_record(new, to_jsonb(old) - array['updated_at', 'updated_by']);
      new.pending := jsonb_build_object('_archive', true);
      new.pending_by := uid; new.pending_at := now();
      return new;
    end if;
    if (to_jsonb(new) - meta) is distinct from (to_jsonb(old) - meta) then
      -- Proposition : les nouvelles valeurs vont dans `pending`, la version en ligne reste.
      new.pending := to_jsonb(new) - meta;
      new.pending_by := uid; new.pending_at := now();
      new := jsonb_populate_record(new, to_jsonb(old) - array['pending', 'pending_by', 'pending_at', 'updated_at', 'updated_by']);
      return new;
    end if;
    -- Rien de changé sur le contenu : on retire éventuellement sa propre proposition.
    new := jsonb_populate_record(new, to_jsonb(old) - array['pending', 'pending_by', 'pending_at', 'updated_at', 'updated_by']);
    if new.pending is not null and old.pending is not null and new.pending is distinct from old.pending then
      new.pending := old.pending; new.pending_by := old.pending_by; new.pending_at := old.pending_at;
    end if;
    if new.pending is null then new.pending_by := null; new.pending_at := null; end if;
    return new;
  end if;

  -- Brouillon ou contenu soumis : édition libre, sans mise en ligne.
  if new.status = 'published' then
    new.status := 'submitted';
  end if;
  new.published_at := old.published_at; new.published_by := old.published_by;
  new.pending := old.pending; new.pending_by := old.pending_by; new.pending_at := old.pending_at;
  return new;
end;
$$;

create trigger guard before insert or update on public.news for each row execute function app.guard_content();
create trigger guard before insert or update on public.calendar_events for each row execute function app.guard_content();
create trigger guard before insert or update on public.gallery_photos for each row execute function app.guard_content();
create trigger guard before insert or update on public.documents for each row execute function app.guard_content();
create trigger guard before insert or update on public.content_blocks for each row execute function app.guard_content();

-- Journal : qui a fait quoi, sur quel contenu.
create or replace function app.log_activity() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  rec jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  before jsonb := case when tg_op = 'INSERT' then null else to_jsonb(old) end;
  act text;
begin
  if auth.uid() is null then
    return null;
  end if;
  act := case
    when tg_op = 'INSERT' then 'create'
    when tg_op = 'DELETE' then 'delete'
    when (rec ->> 'deleted_at') is not null and (before ->> 'deleted_at') is null then 'archive'
    when (rec ->> 'deleted_at') is null and (before ->> 'deleted_at') is not null then 'restore'
    when rec ->> 'status' = 'published' and before ->> 'status' is distinct from 'published' then 'publish'
    when rec -> 'pending' is not null and before -> 'pending' is distinct from rec -> 'pending' then 'propose'
    when rec -> 'pending' is null and before -> 'pending' is not null then 'resolve'
    else 'update' end;
  insert into public.activity_log (school_id, actor, action, entity, entity_id, label)
  values ((rec ->> 'school_id')::uuid, auth.uid(), act, tg_table_name, (rec ->> 'id')::uuid,
          coalesce(rec ->> 'title_fr', rec ->> 'caption_fr', rec ->> 'key', rec ->> 'student_name', rec ->> 'name', ''));
  return null;
end;
$$;

create trigger log after insert or update or delete on public.news for each row execute function app.log_activity();
create trigger log after insert or update or delete on public.calendar_events for each row execute function app.log_activity();
create trigger log after insert or update or delete on public.gallery_photos for each row execute function app.log_activity();
create trigger log after insert or update or delete on public.documents for each row execute function app.log_activity();
create trigger log after insert or update or delete on public.content_blocks for each row execute function app.log_activity();
create trigger log after update or delete on public.preinscriptions for each row execute function app.log_activity();
create trigger log after update or delete on public.contact_messages for each row execute function app.log_activity();

create or replace function app.touch() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
create trigger touch before update on public.profiles for each row execute function app.touch();
create trigger touch before update on public.preinscriptions for each row execute function app.touch();
create trigger touch before update on public.contact_messages for each row execute function app.touch();

-- Création d'un compte : réservée aux adresses invitées.
create or replace function app.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  inv public.invitations;
begin
  select * into inv from public.invitations i
   where lower(i.email) = lower(new.email) and i.accepted_at is null
   order by i.created_at desc limit 1;
  if not found then
    raise exception 'Cette adresse n''a pas été invitée.' using errcode = '42501';
  end if;
  insert into public.profiles (id, school_id, full_name, role)
  values (new.id, inv.school_id, inv.full_name, inv.role);
  update public.invitations set accepted_at = now() where id = inv.id;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function app.handle_new_user();

-- ── Règles d'accès (Row Level Security) ───────────────────────────────────────────────────
-- Le public n'a accès à aucune table : le site passe par site_snapshot().

alter table public.schools enable row level security;
alter table public.profiles enable row level security;
alter table public.invitations enable row level security;
alter table public.school_settings enable row level security;
alter table public.news enable row level security;
alter table public.calendar_events enable row level security;
alter table public.gallery_photos enable row level security;
alter table public.documents enable row level security;
alter table public.content_blocks enable row level security;
alter table public.preinscriptions enable row level security;
alter table public.contact_messages enable row level security;
alter table public.publications enable row level security;
alter table public.activity_log enable row level security;

create policy "staff read own school" on public.schools for select to authenticated
  using (id = (select app.my_school()));

create policy "staff read profiles" on public.profiles for select to authenticated
  using (school_id = (select app.my_school()));
create policy "update own name" on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()) and role = (select app.my_role()) and active and school_id = (select app.my_school()));
create policy "super admin manages profiles" on public.profiles for update to authenticated
  using (school_id = (select app.my_school()) and (select app.my_role()) = 'super_admin')
  with check (school_id = (select app.my_school()));

create policy "super admin manages invitations" on public.invitations for all to authenticated
  using (school_id = (select app.my_school()) and (select app.my_role()) = 'super_admin')
  with check (school_id = (select app.my_school()) and (select app.my_role()) = 'super_admin');

create policy "staff read settings" on public.school_settings for select to authenticated
  using (school_id = (select app.my_school()));
create policy "principal changes settings" on public.school_settings for update to authenticated
  using (school_id = (select app.my_school()) and (select app.my_role()) in ('super_admin', 'principal'))
  with check (school_id = (select app.my_school()));

-- Contenus : toute l'équipe lit, écrit et archive ; le déclencheur règle la publication.
do $$
declare t text;
begin
  foreach t in array array['news', 'calendar_events', 'gallery_photos', 'documents', 'content_blocks'] loop
    execute format('create policy "staff read" on public.%I for select to authenticated using (school_id = (select app.my_school()))', t);
    execute format('create policy "staff write" on public.%I for insert to authenticated with check (school_id = (select app.my_school()))', t);
    execute format('create policy "staff update" on public.%I for update to authenticated using (school_id = (select app.my_school())) with check (school_id = (select app.my_school()))', t);
    execute format('create policy "super admin deletes" on public.%I for delete to authenticated using (school_id = (select app.my_school()) and (select app.my_role()) = ''super_admin'')', t);
  end loop;
  foreach t in array array['preinscriptions', 'contact_messages'] loop
    execute format('create policy "staff read" on public.%I for select to authenticated using (school_id = (select app.my_school()))', t);
    execute format('create policy "staff update" on public.%I for update to authenticated using (school_id = (select app.my_school())) with check (school_id = (select app.my_school()))', t);
    execute format('create policy "super admin deletes" on public.%I for delete to authenticated using (school_id = (select app.my_school()) and (select app.my_role()) = ''super_admin'')', t);
  end loop;
end $$;

create policy "staff read" on public.publications for select to authenticated
  using (school_id = (select app.my_school()));
create policy "staff read" on public.activity_log for select to authenticated
  using (school_id = (select app.my_school()));

-- ── Stockage des photos et documents ─────────────────────────────────────────────────────
-- Un seau public en lecture (les fichiers sont recopiés dans le site à chaque mise à jour) ;
-- l'équipe écrit seulement dans le dossier de son établissement : <school_id>/...

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 10485760,
        array['image/webp', 'image/jpeg', 'image/png', 'application/pdf'])
on conflict (id) do nothing;

create policy "staff upload media" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = (select app.my_school())::text);
create policy "staff update media" on storage.objects for update to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = (select app.my_school())::text);
create policy "super admin deletes media" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = (select app.my_school())::text
         and (select app.my_role()) = 'super_admin');

-- ── Ce que l'équipe voit d'elle-même ─────────────────────────────────────────────────────

create or replace function public.whoami() returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'id', p.id, 'full_name', p.full_name, 'role', p.role,
    'school', jsonb_build_object('id', s.id, 'slug', s.slug, 'name', s.name),
    'can_publish', app.can_publish(),
    'secretariat_can_publish', coalesce(st.secretariat_can_publish, false))
  from public.profiles p
  join public.schools s on s.id = p.school_id
  left join public.school_settings st on st.school_id = p.school_id
  where p.id = auth.uid() and p.active
$$;
revoke execute on function public.whoami() from anon, public;
grant execute on function public.whoami() to authenticated;

-- ── Le contrat du site : tout le contenu publié, au format des fichiers content/data/*.json ──

create or replace function public.site_snapshot(p_school text) returns jsonb
language sql stable security definer set search_path = '' as $$
  with s as (select id from public.schools where slug = p_school)
  select jsonb_build_object(
    'school', p_school,
    'generatedAt', now(),
    'news', coalesce((
      select jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
        'slug', n.slug,
        'date', n.date,
        'category', n.category,
        'featured', case when n.featured then true end,
        'sample', case when n.is_sample then true end,
        'cover', n.cover,
        'coverCaption', jsonb_build_object('fr', n.cover_caption_fr, 'en', coalesce(nullif(n.cover_caption_en, ''), n.cover_caption_fr)),
        'title', jsonb_build_object('fr', n.title_fr, 'en', coalesce(nullif(n.title_en, ''), n.title_fr)),
        'summary', jsonb_build_object('fr', n.summary_fr, 'en', coalesce(nullif(n.summary_en, ''), n.summary_fr)),
        'body', jsonb_build_object('fr', n.body_fr, 'en', coalesce(nullif(n.body_en, ''), n.body_fr))
      )) || jsonb_build_object('date', n.date, 'cover', n.cover) order by n.date desc nulls last, n.created_at)
      from public.news n, s where n.school_id = s.id and n.status = 'published' and n.deleted_at is null), '[]'::jsonb),
    'calendar', coalesce((
      select jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
        'id', e.key,
        'category', e.category,
        'end', e.end_date,
        'confirm', case when e.confirm then true end,
        'title', jsonb_build_object('fr', e.title_fr, 'en', coalesce(nullif(e.title_en, ''), e.title_fr)),
        'note', case when e.note_fr <> '' then jsonb_build_object('fr', e.note_fr, 'en', coalesce(nullif(e.note_en, ''), e.note_fr)) end
      )) || jsonb_build_object('start', e.start_date) order by e.start_date nulls last, e.key)
      from public.calendar_events e, s where e.school_id = s.id and e.status = 'published' and e.deleted_at is null), '[]'::jsonb),
    'gallery', coalesce((
      select jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
        'thumb', g.thumb,
        'category', g.category,
        'width', g.width,
        'height', g.height,
        'caption', jsonb_build_object('fr', g.caption_fr, 'en', coalesce(nullif(g.caption_en, ''), g.caption_fr)),
        'description', case when g.description_fr <> '' then jsonb_build_object('fr', g.description_fr, 'en', coalesce(nullif(g.description_en, ''), g.description_fr)) end
      )) || jsonb_build_object('src', g.src) order by g.position, g.created_at)
      from public.gallery_photos g, s where g.school_id = s.id and g.status = 'published' and g.deleted_at is null), '[]'::jsonb),
    'documents', coalesce((
      select jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
        'id', d.key,
        'category', d.category,
        'title', jsonb_build_object('fr', d.title_fr, 'en', coalesce(nullif(d.title_en, ''), d.title_fr)),
        'description', jsonb_build_object('fr', d.description_fr, 'en', coalesce(nullif(d.description_en, ''), d.description_fr)),
        'usesFeeGrid', case when d.uses_fee_grid then true end,
        'preview', case
          when d.preview_fr is null then null
          when d.preview_en is null or d.preview_en = d.preview_fr then d.preview_fr
          else jsonb_build_object('fr', d.preview_fr, 'en', d.preview_en) end
      )) || jsonb_build_object(
        'file', case
          when d.file_fr is null then null
          when d.file_en is null or d.file_en = d.file_fr then to_jsonb(d.file_fr)
          else jsonb_build_object('fr', d.file_fr, 'en', d.file_en) end,
        'updated', d.updated_on) order by d.position, d.created_at)
      from public.documents d, s where d.school_id = s.id and d.status = 'published' and d.deleted_at is null), '[]'::jsonb),
    'blocks', coalesce((
      select jsonb_object_agg(b.key, b.data)
      from public.content_blocks b, s where b.school_id = s.id and b.status = 'published' and b.deleted_at is null), '{}'::jsonb)
  )
$$;
grant execute on function public.site_snapshot(text) to anon, authenticated;

-- ── L'établissement ───────────────────────────────────────────────────────────────────────

insert into public.schools (slug, name) values ('tomi-fidele', 'Collège Tomi Fidele');
insert into public.school_settings (school_id) select id from public.schools where slug = 'tomi-fidele';
