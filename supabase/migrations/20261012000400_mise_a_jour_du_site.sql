-- Mise à jour du site depuis l'administration.
--
-- Le bouton « Mettre le site à jour » appelle la fonction serveur `publish`, qui :
--   1. demande à la base l'autorisation : request_publication() vérifie le droit de publier, l'intervalle
--      minimal entre deux mises à jour et le plafond du mois (l'hébergeur gratuit en permet une vingtaine) ;
--   2. appelle le crochet de construction de l'hébergeur (secret DEPLOY_HOOK_URL de la fonction) ;
--   3. note le résultat dans `publications`.
-- publish_status() résume l'état pour le tableau de bord.

alter table public.school_settings
  add column if not exists monthly_publish_limit integer not null default 20 check (monthly_publish_limit between 1 and 500);

create or replace function public.publish_status() returns jsonb
language sql stable security invoker set search_path = '' as $$
  with me as (select app.my_school() as sid),
  last_ok as (
    select p.requested_at as at, p.status, pr.full_name as by_name
      from public.publications p
      left join public.profiles pr on pr.id = p.requested_by, me
     where p.school_id = me.sid and p.status in ('sent', 'done')
     order by p.requested_at desc limit 1),
  last_any as (
    select p.requested_at as at, p.status, p.detail, pr.full_name as by_name
      from public.publications p
      left join public.profiles pr on pr.id = p.requested_by, me
     where p.school_id = me.sid
     order by p.requested_at desc limit 1),
  since as (select coalesce((select at from last_ok), '-infinity'::timestamptz) as t),
  changed as (
    select count(*) as n from (
      select published_at, deleted_at from public.news, me where school_id = me.sid
      union all select published_at, deleted_at from public.calendar_events, me where school_id = me.sid
      union all select published_at, deleted_at from public.gallery_photos, me where school_id = me.sid
      union all select published_at, deleted_at from public.documents, me where school_id = me.sid
      union all select published_at, deleted_at from public.content_blocks, me where school_id = me.sid
    ) x, since
    where x.published_at is not null
      and (x.published_at > since.t or (x.deleted_at is not null and x.deleted_at > since.t))),
  review as (
    select count(*) as n from (
      select status, pending, deleted_at from public.news, me where school_id = me.sid
      union all select status, pending, deleted_at from public.calendar_events, me where school_id = me.sid
      union all select status, pending, deleted_at from public.gallery_photos, me where school_id = me.sid
      union all select status, pending, deleted_at from public.documents, me where school_id = me.sid
      union all select status, pending, deleted_at from public.content_blocks, me where school_id = me.sid
    ) x
    where (x.deleted_at is null and x.status = 'submitted') or jsonb_typeof(x.pending) = 'object'),
  month as (
    select count(*) as n from public.publications p, me
     where p.school_id = me.sid and p.status in ('sent', 'done')
       and p.requested_at >= date_trunc('month', now()))
  select jsonb_build_object(
    'lastSuccess', (select to_jsonb(l) from last_ok l),
    'lastRequest', (select to_jsonb(l) from last_any l),
    'changesSinceLast', (select n from changed),
    'toReview', (select n from review),
    'monthCount', (select n from month),
    'monthlyLimit', (select s.monthly_publish_limit from public.school_settings s, me where s.school_id = me.sid))
$$;
revoke execute on function public.publish_status() from anon, public;
grant execute on function public.publish_status() to authenticated;

-- Appelée par la fonction serveur `publish`, avec le jeton de la personne connectée.
create or replace function public.request_publication() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  sid uuid := app.my_school();
  limit_month integer;
  done_month integer;
  last_at timestamptz;
  row_id uuid;
begin
  if sid is null then
    raise exception 'Connectez-vous pour mettre le site à jour.' using errcode = '42501';
  end if;
  if not app.can_publish() then
    raise exception 'Seul le Principal peut mettre le site à jour.' using errcode = '42501';
  end if;

  -- Une seule demande à la fois : la construction prend une à deux minutes.
  select max(requested_at) into last_at from public.publications
   where school_id = sid and status in ('requested', 'sent');
  if last_at is not null and last_at > now() - interval '3 minutes' then
    raise exception 'Une mise à jour vient d''être lancée. Patientez quelques minutes.' using errcode = 'P0001';
  end if;

  select monthly_publish_limit into limit_month from public.school_settings where school_id = sid;
  select count(*) into done_month from public.publications
   where school_id = sid and status in ('sent', 'done') and requested_at >= date_trunc('month', now());
  if done_month >= coalesce(limit_month, 20) and app.my_role() is distinct from 'super_admin' then
    raise exception 'Le nombre de mises à jour prévu ce mois-ci est atteint. Contactez l''administrateur du site.'
      using errcode = 'P0001';
  end if;

  insert into public.publications (school_id, requested_by, status)
  values (sid, auth.uid(), 'requested')
  returning id into row_id;

  return jsonb_build_object('id', row_id, 'monthCount', done_month, 'monthlyLimit', limit_month);
end;
$$;
revoke execute on function public.request_publication() from anon, public;
grant execute on function public.request_publication() to authenticated;
