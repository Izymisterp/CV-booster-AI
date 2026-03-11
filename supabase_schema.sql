-- Table pour stocker les candidatures
create table public.applications (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Données d'entrée
  original_cv_content text,
  job_description text,
  
  -- Résultats générés (stockés en JSONB pour flexibilité)
  improved_cv jsonb, -- Contient la structure complète du CV amélioré
  cover_letter text,
  motivations jsonb, -- Liste de strings
  keywords_found jsonb, -- Liste de strings
  suggestions jsonb, -- Liste de strings
  ats_score integer,
  
  -- Métadonnées optionnelles
  user_id uuid references auth.users(id), -- Pour une future authentification
  title text -- Titre optionnel pour l'affichage (ex: "CV pour [Entreprise]")
);

-- Active RLS (Row Level Security)
alter table public.applications enable row level security;

-- Politique de sécurité (pour l'instant ouvert en lecture/écriture si pas d'auth, 
-- mais idéalement devrait être restreint à l'utilisateur authentifié)
-- ATTENTION : Ceci est une politique de développement. En production, utilisez l'authentification.
create policy "Allow public access for demo"
  on public.applications
  for all
  using (true)
  with check (true);
