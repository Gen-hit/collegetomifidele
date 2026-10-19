-- Lot B4 — Réglages, comptes, journal et ménage du stockage.

-- L'équipe peut lister les fichiers de son établissement (nécessaire au ménage du stockage).
create policy "staff list media" on storage.objects for select to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = (select app.my_school())::text);

-- Fichiers déposés qui ne servent plus nulle part : ni dans un contenu (même archivé ou en proposition),
-- ni dans un réglage. Les fichiers de moins de 24 heures sont ignorés (une saisie peut être en cours).
-- Réservé à l'administrateur du site, qui seul peut supprimer des fichiers.
create or replace function public.orphan_media()
returns table (name text, bytes bigint, created_at timestamptz)
language plpgsql stable security definer set search_path = '' as $$
declare
  sid uuid := app.my_school();
  used text;
begin
  if sid is null or app.my_role() is distinct from 'super_admin' then
    raise exception 'Réservé à l''administrateur du site.' using errcode = '42501';
  end if;
  select string_agg(t, ' ') into used from (
    select row_to_json(n)::text as t from public.news n where n.school_id = sid
    union all select row_to_json(c)::text from public.calendar_events c where c.school_id = sid
    union all select row_to_json(g)::text from public.gallery_photos g where g.school_id = sid
    union all select row_to_json(d)::text from public.documents d where d.school_id = sid
    union all select row_to_json(b)::text from public.content_blocks b where b.school_id = sid
  ) all_rows;
  return query
    select o.name, coalesce((o.metadata ->> 'size')::bigint, 0), o.created_at
      from storage.objects o
     where o.bucket_id = 'media'
       and (storage.foldername(o.name))[1] = sid::text
       and o.created_at < now() - interval '1 day'
       and position(('storage:' || o.name) in coalesce(used, '')) = 0
     order by o.created_at;
end;
$$;
revoke all on function public.orphan_media() from public;
grant execute on function public.orphan_media() to authenticated;
-- Supabase accorde aussi l'exécution au rôle « anon » : on la lui retire explicitement.
revoke execute on function public.orphan_media() from anon;
