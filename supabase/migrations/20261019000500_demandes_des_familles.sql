-- Lot B3 — Demandes des familles.
-- Les formulaires du site (préinscription, contact) enregistrent la demande dans la base par une seule fonction,
-- appelable sans compte. Elle vérifie les champs, écarte les robots, limite les envois répétés,
-- numérote les préinscriptions et efface les demandes de plus de 12 mois (durée annoncée aux familles).

alter table public.preinscriptions add column if not exists stream text;

-- Envois récents par appareil : une empreinte (jamais l'adresse IP elle-même). Seules les 24 dernières heures comptent.
create table if not exists public.request_throttle (
  id bigint generated always as identity primary key,
  school_id uuid not null references public.schools (id),
  fingerprint text not null,
  created_at timestamptz not null default now()
);
create index if not exists request_throttle_lookup on public.request_throttle (school_id, fingerprint, created_at);
alter table public.request_throttle enable row level security;
-- Aucune règle d'accès : seule la fonction ci-dessous y lit et y écrit.

create or replace function app.clean_text(value text, max_length integer) returns text
language sql immutable set search_path = '' as $$
  select nullif(left(btrim(regexp_replace(coalesce(value, ''), '[\x01-\x08\x0B\x0C\x0E-\x1F]', '', 'g')), max_length), '')
$$;

create or replace function app.cameroon_phone(value text) returns text
language sql immutable set search_path = '' as $$
  with d as (select regexp_replace(regexp_replace(coalesce(value, ''), '[\s.\-()]', '', 'g'), '^(\+|00)', '') as v),
       l as (select case when v like '237%' and length(v) = 12 then substr(v, 4) else v end as v from d)
  select case when v ~ '^[62][0-9]{8}$' then '+237' || v end from l
$$;

create or replace function public.submit_family_request(
  p_school text,
  p_kind text,
  p_data jsonb,
  p_trap text default '',
  p_elapsed_ms integer default 0
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  sid uuid;
  headers jsonb := coalesce(nullif(current_setting('request.headers', true), '')::jsonb, '{}'::jsonb);
  ip text;
  fp text;
  recent integer;
  today integer;
  v_phone text := app.cameroon_phone(p_data ->> 'phone');
  v_locale text := case when p_data ->> 'locale' = 'en' then 'en' else 'fr' end;
  ref text;
  seq integer;
  yy text := to_char(now() at time zone 'Africa/Douala', 'YY');
  v_student text; v_class text; v_parent text; v_name text; v_message text; v_subject text;
begin
  select id into sid from public.schools where slug = p_school;
  if sid is null then
    raise exception 'Établissement inconnu.' using errcode = 'P0002';
  end if;

  -- Robot probable (case piège remplie, ou formulaire rempli en moins de 2 secondes) :
  -- on répond « reçu » sans rien enregistrer, pour ne pas lui apprendre à contourner.
  if coalesce(p_trap, '') <> '' or coalesce(p_elapsed_ms, 0) < 2000 then
    return jsonb_build_object('ok', true);
  end if;

  if coalesce((p_data ->> 'consent')::boolean, false) is not true then
    raise exception 'consent' using errcode = '22023';
  end if;
  if v_phone is null then
    raise exception 'phone' using errcode = '22023';
  end if;

  -- 5 envois par appareil en 15 minutes, 300 par jour pour l'établissement.
  ip := btrim(split_part(coalesce(headers ->> 'cf-connecting-ip', headers ->> 'x-real-ip', headers ->> 'x-forwarded-for', ''), ',', 1));
  fp := md5(sid::text || '|' || coalesce(nullif(ip, ''), 'inconnu'));
  select count(*) into recent from public.request_throttle
   where school_id = sid and fingerprint = fp and created_at > now() - interval '15 minutes';
  select count(*) into today from public.request_throttle
   where school_id = sid and created_at > now() - interval '1 day';
  if recent >= 5 or today >= 300 then
    raise exception 'throttled' using errcode = '54000';
  end if;
  insert into public.request_throttle (school_id, fingerprint) values (sid, fp);

  -- Durée de conservation annoncée aux familles : 12 mois. Passé ce délai, les données personnelles sont effacées
  -- (la ligne reste, vide, pour garder la numérotation et les statistiques).
  update public.preinscriptions
     set student_name = '(effacé)', parent_name = '(effacé)', parent_phone = '', parent_email = null,
         message = null, internal_note = '', deleted_at = coalesce(deleted_at, now())
   where school_id = sid and created_at < now() - interval '12 months' and parent_phone <> '';
  update public.contact_messages
     set name = '(effacé)', phone = '', email = null, message = '(effacé)', internal_note = '',
         deleted_at = coalesce(deleted_at, now())
   where school_id = sid and created_at < now() - interval '12 months' and phone <> '';

  if p_kind = 'preinscription' then
    v_student := app.clean_text(p_data ->> 'student', 120);
    v_class := app.clean_text(p_data ->> 'className', 40);
    v_parent := app.clean_text(p_data ->> 'parent', 120);
    v_message := app.clean_text(p_data ->> 'message', 2000);
    if v_student is null or length(v_student) < 3 or v_class is null or v_parent is null or length(v_parent) < 3 then
      raise exception 'fields' using errcode = '22023';
    end if;

    -- Numéro de suivi : P26-0001, P26-0002… par établissement et par année.
    perform pg_advisory_xact_lock(hashtext('preinscription:' || sid::text));
    select coalesce(max(substr(reference, 5)::integer), 0) + 1 into seq
      from public.preinscriptions where school_id = sid and reference like 'P' || yy || '-%';
    ref := 'P' || yy || '-' || lpad(seq::text, 4, '0');

    insert into public.preinscriptions
      (school_id, reference, student_name, target_class, section, stream, parent_name, parent_phone, message, locale, consent_at)
    values
      (sid, ref, v_student, v_class, app.clean_text(p_data ->> 'section', 20), app.clean_text(p_data ->> 'stream', 20),
       v_parent, v_phone, v_message, v_locale, now());
    return jsonb_build_object('ok', true, 'reference', ref);
  elsif p_kind = 'contact' then
    v_name := app.clean_text(p_data ->> 'name', 120);
    v_subject := coalesce(app.clean_text(p_data ->> 'subject', 80), 'Autre');
    v_message := app.clean_text(p_data ->> 'message', 2000);
    if v_name is null or length(v_name) < 3 or v_message is null or length(v_message) < 3 then
      raise exception 'fields' using errcode = '22023';
    end if;
    insert into public.contact_messages (school_id, name, phone, subject, message, locale, consent_at)
    values (sid, v_name, v_phone, v_subject, v_message, v_locale, now());
    return jsonb_build_object('ok', true);
  end if;

  raise exception 'kind' using errcode = '22023';
end;
$$;

revoke all on function public.submit_family_request(text, text, jsonb, text, integer) from public;
grant execute on function public.submit_family_request(text, text, jsonb, text, integer) to anon, authenticated;

-- Le libellé du journal pour une demande : le nom de l'élève, ou celui de la personne qui écrit (déjà prévu),
-- et le tableau de bord compte les demandes non traitées.
create or replace function public.requests_status() returns jsonb
language sql stable set search_path = '' as $$
  select jsonb_build_object(
    'preinscriptions', (select count(*) from public.preinscriptions
                         where school_id = (select app.my_school()) and deleted_at is null and status = 'new'),
    'messages', (select count(*) from public.contact_messages
                  where school_id = (select app.my_school()) and deleted_at is null and status = 'new'))
$$;
grant execute on function public.requests_status() to authenticated;
