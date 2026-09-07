# Cabinet Médical — MVP

Application de gestion de cabinet médical : patients, rendez-vous, consultations, bilans médicaux, notes médicales et historique, avec gestion des rôles (ADMIN, DOCTOR, SECRETARY).

Cahier des charges complet : [docs/Prompt Claude Code — Cabinet Médical MVP v2.md](docs/Prompt%20Claude%20Code%20—%20Cabinet%20Médical%20MVP%20v2.md)
Suivi d'avancement : [PROGRESS.md](PROGRESS.md)

## Stack technique

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Supabase](https://supabase.com) (Postgres, Auth, Row Level Security, Storage)
- Tailwind CSS + [shadcn/ui](https://ui.shadcn.com)
- React Hook Form + Zod (validation)
- [FullCalendar](https://fullcalendar.io) (vue calendrier des rendez-vous)

## Prérequis

- Node.js 20+
- Un projet Supabase (cloud ou local via [Supabase CLI](https://supabase.com/docs/guides/cli))

## Installation

```bash
npm install
```

Copier `.env.local.example` vers `.env.local` et renseigner les clés du projet Supabase :

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Base de données

Les migrations SQL se trouvent dans `supabase/migrations/` et doivent être appliquées dans l'ordre sur le projet Supabase (tables + RLS + storage) :

1. `20260906000001_initial_schema.sql` — tables, relations, contraintes
2. `20260906000002_rls_policies.sql` — activation RLS et policies par rôle
3. `20260906000003_storage.sql` — bucket privé `medical-reports` et ses policies

Via la CLI Supabase (projet lié) :

```bash
supabase db push
```

Ou en collant le contenu de chaque fichier dans l'éditeur SQL du dashboard Supabase, dans l'ordre.

### Créer le premier compte administrateur

Le module de gestion des utilisateurs n'est pas encore développé (voir [PROGRESS.md](PROGRESS.md)). Pour démarrer :

1. Créer un utilisateur via Supabase Auth (dashboard → Authentication → Add user, ou `supabase.auth.signUp`).
2. Insérer manuellement la ligne correspondante dans `public.profiles` avec `role = 'ADMIN'` et `is_active = true`.
3. Se connecter à l'application avec cet utilisateur : les rôles `DOCTOR`/`SECRETARY` suivants peuvent alors être créés de la même façon (insertion manuelle dans `profiles`), puis associés à une fiche médecin depuis `/doctors` pour les `DOCTOR`.

## Développement

```bash
npm run dev
```

Application disponible sur [http://localhost:3000](http://localhost:3000).

## Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Lance le serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Démarre le serveur de production (après `build`) |
| `npm run lint` | Vérifie le code avec ESLint |

## Rôles et permissions

| Rôle | Accès |
|---|---|
| `ADMIN` | Accès complet à tous les modules, y compris Médecins et Utilisateurs |
| `DOCTOR` | Patients, Maladies, Rendez-vous, Consultations, Bilans médicaux, Notes médicales, Historique |
| `SECRETARY` | Patients (informations administratives), Rendez-vous — pas d'accès aux consultations, bilans et notes médicales |

La sécurité est assurée en premier lieu par les policies RLS de chaque table Supabase ; les routes et la navigation sont filtrées par rôle en complément (voir `lib/services/auth.service.ts#requireRole` et `components/layout/nav-items.ts`).

## Déploiement (Vercel)

1. Importer le dépôt Git dans [Vercel](https://vercel.com/new).
2. Renseigner les variables d'environnement du projet, pour l'environnement **Production** (Project Settings → Environment Variables) :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SECRET_KEY` (clé secrète, nécessaire au module Utilisateurs — voir `.env.local.example`)

   Sans ces variables, `proxy.ts` (exécuté sur presque toutes les routes) lève une exception à chaque requête et l'application affiche "Internal Server Error" sur tout le site. Un ajout/changement de variable nécessite un redéploiement pour être pris en compte.
3. Le build Vercel utilise `npm run build` (Next.js standard, aucune configuration additionnelle requise).
4. S'assurer que les migrations SQL (`supabase/migrations/`) ont bien été appliquées sur le projet Supabase de production **avant** le premier déploiement.
5. Vérifier dans le dashboard Supabase (Authentication → URL Configuration) que l'URL de production est autorisée comme *Site URL* / *Redirect URL*.

## Structure du projet

```
app/(dashboard)/    Pages de l'application (App Router), une route par module
components/<domaine>/  Composants réutilisables, organisés par domaine métier
lib/services/        Logique métier et accès aux données (server-only)
lib/types/            Types partagés côté client sans dépendance server-only
schemas/              Schémas de validation Zod
supabase/migrations/  Migrations SQL (schéma, RLS, storage)
types/                Types dérivés de la base de données Supabase
```
