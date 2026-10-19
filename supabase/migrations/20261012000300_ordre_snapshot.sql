-- Ordre stable du contenu publié : l'ordre de saisie (le site trie lui-même les dates et les actualités ;
-- les dates à confirmer et les photos gardent l'ordre choisi dans l'administration).
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
      )) || jsonb_build_object('date', n.date, 'cover', n.cover) order by n.created_at, n.slug)
      from public.news n, s where n.school_id = s.id and n.status = 'published' and n.deleted_at is null), '[]'::jsonb),
    'calendar', coalesce((
      select jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
        'id', e.key,
        'category', e.category,
        'end', e.end_date,
        'confirm', case when e.confirm then true end,
        'title', jsonb_build_object('fr', e.title_fr, 'en', coalesce(nullif(e.title_en, ''), e.title_fr)),
        'note', case when e.note_fr <> '' then jsonb_build_object('fr', e.note_fr, 'en', coalesce(nullif(e.note_en, ''), e.note_fr)) end
      )) || jsonb_build_object('start', e.start_date) order by e.created_at, e.key)
      from public.calendar_events e, s where e.school_id = s.id and e.status = 'published' and e.deleted_at is null), '[]'::jsonb),
    'gallery', coalesce((
      select jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
        'thumb', g.thumb,
        'category', g.category,
        'width', g.width,
        'height', g.height,
        'caption', jsonb_build_object('fr', g.caption_fr, 'en', coalesce(nullif(g.caption_en, ''), g.caption_fr)),
        'description', case when g.description_fr <> '' then jsonb_build_object('fr', g.description_fr, 'en', coalesce(nullif(g.description_en, ''), g.description_fr)) end
      )) || jsonb_build_object('src', g.src) order by g.position, g.created_at, g.id)
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
        'updated', d.updated_on) order by d.position, d.created_at, d.key)
      from public.documents d, s where d.school_id = s.id and d.status = 'published' and d.deleted_at is null), '[]'::jsonb),
    'blocks', coalesce((
      select jsonb_object_agg(b.key, b.data)
      from public.content_blocks b, s where b.school_id = s.id and b.status = 'published' and b.deleted_at is null), '{}'::jsonb)
  )
$$;
grant execute on function public.site_snapshot(text) to anon, authenticated;
