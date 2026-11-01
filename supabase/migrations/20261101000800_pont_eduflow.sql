-- Pont EduFlow ↔ site.
-- Le logiciel de gestion EduFlow (installé au collège) se connecte au site avec une clé de liaison :
--   • il récupère les préinscriptions reçues en ligne et renvoie leur suite (acceptée, refusée) ;
--   • il propose des dates du calendrier et la grille des frais : ces propositions arrivent
--     dans « À valider », le Principal décide de leur mise en ligne. EduFlow ne publie jamais seul.
-- La clé n'est montrée qu'une fois, à sa création ; la base n'en garde que l'empreinte (SHA-256).

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.eduflow_links (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id),
  token_hash text not null unique,
  hint text not null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  last_used_at timestamptz,
  revoked_at timestamptz
);
create index if not exists eduflow_links_school on public.eduflow_links (school_id) where revoked_at is null;
alter table public.eduflow_links enable row level security;
-- Aucune règle d'accès directe : seules les fonctions ci-dessous et la fonction serveur y touchent.

alter table public.preinscriptions add column if not exists eduflow_synced_at timestamptz;

-- Crée (ou remplace) la clé de liaison. Réservé au Principal et à l'administrateur du site.
create or replace function public.create_eduflow_link() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  sid uuid := app.my_school();
  token text;
begin
  if sid is null or app.my_role() not in ('super_admin', 'principal') then
    raise exception 'Seuls le Principal et l’administrateur du site relient EduFlow.' using errcode = '42501';
  end if;
  update public.eduflow_links set revoked_at = now() where school_id = sid and revoked_at is null;
  token := 'efs_' || encode(extensions.gen_random_bytes(24), 'hex');
  insert into public.eduflow_links (school_id, token_hash, hint, created_by)
  values (sid, encode(extensions.digest(token, 'sha256'), 'hex'), right(token, 4), auth.uid());
  return jsonb_build_object('token', token);
end;
$$;

create or replace function public.revoke_eduflow_link() returns void
language plpgsql security definer set search_path = '' as $$
begin
  if app.my_role() not in ('super_admin', 'principal') then
    raise exception 'Seuls le Principal et l’administrateur du site relient EduFlow.' using errcode = '42501';
  end if;
  update public.eduflow_links set revoked_at = now() where school_id = app.my_school() and revoked_at is null;
end;
$$;

create or replace function public.eduflow_link_status() returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(
    (select jsonb_build_object('linked', true, 'hint', l.hint, 'created_at', l.created_at, 'last_used_at', l.last_used_at)
       from public.eduflow_links l
      where l.school_id = app.my_school() and l.revoked_at is null
      order by l.created_at desc limit 1),
    jsonb_build_object('linked', false))
$$;

revoke all on function public.create_eduflow_link(), public.revoke_eduflow_link(), public.eduflow_link_status() from public, anon;
grant execute on function public.create_eduflow_link(), public.revoke_eduflow_link(), public.eduflow_link_status() to authenticated;
