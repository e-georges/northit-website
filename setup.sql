-- ══════════════════════════════════════════════════════════════
-- North IT — Setup Supabase
-- Coller et exécuter dans : Supabase > SQL Editor > New query
-- ══════════════════════════════════════════════════════════════

-- ── 1. Tables ──────────────────────────────────────────────────

-- Documents de formation
create table if not exists public.documents (
  id          uuid        default gen_random_uuid() primary key,
  nom         text        not null,
  description text,
  categorie   text        default 'Documents',
  type        text        default 'pdf' check (type in ('pdf','excel')),
  url         text        not null default 'REMPLACER',
  visible     boolean     default false,
  taille      text,
  note_admin  text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Rôles utilisateurs (formateur | apprenant)
create table if not exists public.user_roles (
  id         uuid        default gen_random_uuid() primary key,
  user_id    uuid        references auth.users(id) on delete cascade unique,
  role       text        not null check (role in ('formateur','apprenant')),
  full_name  text,
  created_at timestamptz default now()
);

-- Signatures électroniques natives
create table if not exists public.signatures (
  id            uuid        default gen_random_uuid() primary key,
  user_id       uuid        references auth.users(id) on delete cascade,
  document_type text        not null,
  full_name     text        not null,
  email         text        not null,
  session_nom   text,
  signed_at     timestamptz default now()
);

-- ── 2. Row Level Security ───────────────────────────────────────

alter table public.documents   enable row level security;
alter table public.user_roles  enable row level security;
alter table public.signatures  enable row level security;

-- Fonction helper : l'utilisateur connecté est-il formateur ?
create or replace function public.is_formateur()
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'formateur'
  );
$$;

-- Documents : apprenants voient les visibles, formateurs voient tout
create policy "doc_read" on public.documents
  for select to authenticated
  using (visible = true or is_formateur());

create policy "doc_write_formateur" on public.documents
  for all to authenticated
  using (is_formateur()) with check (is_formateur());

-- Rôles : chacun voit le sien, formateur voit tous
create policy "role_read" on public.user_roles
  for select to authenticated
  using (user_id = auth.uid() or is_formateur());

create policy "role_write_formateur" on public.user_roles
  for all to authenticated
  using (is_formateur()) with check (is_formateur());

-- Signatures : créer la sienne, formateur voit toutes
create policy "sig_insert" on public.signatures
  for insert to authenticated with check (user_id = auth.uid());

create policy "sig_read" on public.signatures
  for select to authenticated
  using (user_id = auth.uid() or is_formateur());

-- ── 3. Données initiales (documents) ───────────────────────────

insert into public.documents (nom, description, categorie, type, taille, note_admin) values
('Planning de la session',        'Horaires, pauses et déroulé des 3 jours',              'Organisation',      'pdf',   '0.3 Mo', 'Partager avant le début de la session'),
('Fiche de connexion PeopleCert', 'Identifiants et instructions pour l examen en ligne',  'Organisation',      'pdf',   '0.4 Mo', 'Partager le Jour 3 matin uniquement'),
('Programme — Jour 1',            'Fondamentaux ITIL® 4 et Système de Valeur des Services','Supports de cours', 'pdf',   '3.2 Mo', 'Partager le lundi matin avant la session'),
('Programme — Jour 2',            'Chaîne de valeur des services et pratiques ITIL®',     'Supports de cours', 'pdf',   '4.1 Mo', 'Partager le mardi matin'),
('Programme — Jour 3',            'Révisions, amélioration continue et préparation',       'Supports de cours', 'pdf',   '2.8 Mo', 'Partager le mercredi matin'),
('Fiche mémo — Concepts clés',    'Synthèse des 34 pratiques, 7 principes et SVS',         'Supports de cours', 'pdf',   '1.1 Mo', 'Partager dès le Jour 1'),
('Grille de suivi de progression','Tableau de suivi personnel par pratique ITIL®',         'Supports de cours', 'excel', '0.2 Mo', 'Partager dès le Jour 1'),
('Examen blanc — 40 QCM',         'Conditions réelles de l examen PeopleCert + correction','Préparation examen','pdf',   '0.9 Mo', 'Partager la veille de l examen uniquement');

-- ── 4. Définir Éric comme formateur ────────────────────────────
-- IMPORTANT : remplacer l'email ci-dessous par le vôtre
-- Exécuter APRÈS votre première connexion sur espace-apprenant.html

-- insert into public.user_roles (user_id, role, full_name)
-- select id, 'formateur', 'Éric GEORGES'
-- from auth.users
-- where email = 'e.georges@northit.fr';

-- ══════════════════════════════════════════════════════════════
-- Vérification : après exécution vous devez voir 8 lignes ici
-- SELECT * FROM public.documents;
-- ══════════════════════════════════════════════════════════════
