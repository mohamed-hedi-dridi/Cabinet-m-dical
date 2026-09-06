@AGENTS.md

# Projet : Cabinet Médical — MVP

Cahier des charges complet : [docs/Prompt Claude Code — Cabinet Médical MVP v2.md](docs/Prompt%20Claude%20Code%20—%20Cabinet%20Médical%20MVP%20v2.md)

## Suivi d'avancement

Le fichier [PROGRESS.md](PROGRESS.md) trace l'état d'avancement du projet (étapes terminées, en cours, à faire, dette technique, journal des sessions).

**Règle impérative : à chaque fonctionnalité/étape terminée pendant une session, mettre à jour `PROGRESS.md`** (statut de l'étape, détail du module, entrée dans le journal des sessions avec la date du jour). Consulter ce fichier en début de session pour savoir où reprendre le travail.

## Conventions du projet

- Stack : Next.js (App Router) + TypeScript + Supabase (Postgres, Auth, RLS, Storage) + Tailwind + shadcn/ui + React Hook Form + Zod + FullCalendar.
- Rôles : `ADMIN`, `DOCTOR`, `SECRETARY` (voir section 4 du cahier des charges pour les permissions).
- Architecture : pages dans `app/`, composants réutilisables dans `components/<domaine>/`, logique métier dans `lib/services/`, validation dans `schemas/`, types générés/dérivés dans `types/`.
- Ne jamais désactiver RLS. Toujours valider côté serveur (Zod) en plus du client.
- Ne pas passer aux modules métier suivants tant que le module en cours n'est pas fonctionnel (RLS + CRUD + validation + UI states : loading/empty/error).
