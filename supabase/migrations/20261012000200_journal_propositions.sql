-- Journal : une proposition validée ou refusée s'inscrit « resolve », plus « propose ».
-- (to_jsonb(new) -> 'pending' vaut le JSON null, pas le NULL SQL : on teste le type.)
create or replace function app.log_activity() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  rec jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  before jsonb := case when tg_op = 'INSERT' then null else to_jsonb(old) end;
  now_pending boolean := coalesce(jsonb_typeof(rec -> 'pending') = 'object', false);
  was_pending boolean := coalesce(jsonb_typeof(before -> 'pending') = 'object', false);
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
    when now_pending and (rec -> 'pending') is distinct from (before -> 'pending') then 'propose'
    when not now_pending and was_pending then 'resolve'
    else 'update' end;
  insert into public.activity_log (school_id, actor, action, entity, entity_id, label)
  values ((rec ->> 'school_id')::uuid, auth.uid(), act, tg_table_name, (rec ->> 'id')::uuid,
          coalesce(rec ->> 'title_fr', rec ->> 'caption_fr', rec ->> 'key', rec ->> 'student_name', rec ->> 'name', ''));
  return null;
end;
$$;
