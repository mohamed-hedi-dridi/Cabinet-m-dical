# Suivi d'avancement — Cabinet Médical MVP

> Ce fichier est mis à jour à chaque étape terminée. Référence : `docs/Prompt Claude Code — Cabinet Médical MVP v2.md` (cahier des charges complet, 24 sections).

## Légende
✅ Terminé · 🚧 En cours · ⬜ À faire

## Étapes (roadmap section 23 du cahier des charges)

| # | Étape | Statut | Détails |
|---|-------|--------|---------|
| 1 | Initialisation (Next.js, TS, Tailwind, shadcn/ui, Supabase, Git) | ✅ | Stack en place |
| 2 | Base de données (tables, relations, migrations, RLS) | ✅ | `supabase/migrations/` — 9 tables + RLS + storage |
| 3 | Authentification (login/logout, sessions, rôles) | ✅ | `app/login/`, `lib/services/auth.service.ts` |
| 4 | Layout (sidebar, header, navigation, dashboard) | ✅ | `components/layout/`, dashboard basique |
| 5 | Patients (CRUD, recherche, fiche patient) | ✅ | Terminé |
| 6 | Maladies (CRUD, association patient/maladie) | ✅ | Terminé |
| 7 | Médecins (CRUD) | ✅ | Terminé |
| 8 | Rendez-vous (CRUD, calendrier FullCalendar, statuts) | ✅ | Terminé |
| 9 | Consultations (création, modification, historique) | ✅ | Terminé |
| 10 | Bilans médicaux (CRUD, upload documents) | ✅ | Terminé |
| 11 | Notes médicales (CRUD, historique) | ✅ | Terminé |
| 12 | Dashboard complet (statistiques, derniers éléments) | ✅ | Terminé |
| 13 | Tests (auth, permissions, CRUD, RLS, validation, responsive) | ✅ | Vérification manuelle (voir détail) |
| 14 | Finalisation (lint, README, déploiement Vercel) | ✅ | Terminé |

## Détail par module

### ✅ Authentification
- Login/logout via Supabase Auth (email + mot de passe)
- Rôles : ADMIN, DOCTOR, SECRETARY
- Protection du dashboard via `app/(dashboard)/layout.tsx` (redirection si non connecté/inactif)
- Protection fine par rôle sur les routes réservées via `requireRole()` — `lib/services/auth.service.ts` (voir section "Vérification globale")

### ✅ Base de données & RLS
- Tables : profiles, doctors, patients, diseases, patient_diseases, appointments, consultations, medical_reports, medical_notes
- RLS activé sur toutes les tables, policies par rôle
- Bucket storage `medical-reports`

### ✅ Patients (`/patients`)
- ✅ Liste avec recherche (nom, prénom, téléphone) — [app/(dashboard)/patients/page.tsx](app/(dashboard)/patients/page.tsx)
- ✅ Création — [app/(dashboard)/patients/new/page.tsx](app/(dashboard)/patients/new/page.tsx)
- ✅ Fiche patient avec onglets — [app/(dashboard)/patients/[id]/page.tsx](app/(dashboard)/patients/[id]/page.tsx) : onglet "Informations" (infos + allergies/antécédents/maladies chroniques) et onglet "Maladies" (voir module Maladies) ; onglets Consultations/Bilans/Notes à ajouter avec les modules correspondants
- ✅ Modification — [app/(dashboard)/patients/[id]/edit/page.tsx](app/(dashboard)/patients/[id]/edit/page.tsx)
- ✅ Suppression (avec confirmation) — `components/patients/delete-patient-button.tsx`
- Validation Zod — `schemas/patient.schema.ts`
- Service de lecture — `lib/services/patients.service.ts`
- Server actions — `app/(dashboard)/patients/actions.ts`
- ⬜ Pas de pagination (liste simple pour l'instant, à ajouter si le volume de patients grandit)

### ✅ Maladies (`/diseases`) + association patient/maladie
- ✅ Référentiel maladies : liste avec recherche (nom) et filtre par catégorie — [app/(dashboard)/diseases/page.tsx](app/(dashboard)/diseases/page.tsx)
- ✅ Création/modification via Dialog (pas de page dédiée, entité simple à 4 champs) — `components/diseases/disease-dialog.tsx`
- ✅ Suppression avec confirmation — `components/diseases/delete-disease-button.tsx`
- ✅ Gestion de l'erreur d'unicité du nom (contrainte SQL `diseases_name_key`, code Postgres `23505`)
- ✅ Association patient/maladie : onglet "Maladies" dans la fiche patient — `components/patients/patient-diseases-tab.tsx`
  - Ajout/modification via Dialog avec sélection de la maladie, date de diagnostic, statut (ACTIVE/RESOLVED/CHRONIC), notes
  - Retrait d'une maladie associée
  - Server actions dédiées — `app/(dashboard)/patients/diseases-actions.ts`
- Validation Zod — `schemas/disease.schema.ts`, `schemas/patient-disease.schema.ts`
- Services — `lib/services/diseases.service.ts`, `lib/services/patient-diseases.service.ts`

### ✅ Médecins (`/doctors`)
- Réservé ADMIN dans la navigation ; RLS : lecture pour tout utilisateur authentifié, écriture (insert/update/delete) réservée ADMIN
- ✅ Liste des médecins (nom, email, spécialité, téléphone) — [app/(dashboard)/doctors/page.tsx](app/(dashboard)/doctors/page.tsx)
- ✅ Création/modification via Dialog — `components/doctors/doctor-dialog.tsx`, `components/doctors/doctor-form.tsx`
  - Un médecin = association à un `profile` existant ayant le rôle `DOCTOR` et non encore lié (`doctors.profile_id` unique) ; le profil ne peut plus être changé une fois la fiche créée
  - Comme le module "Utilisateurs" (création de comptes) n'est pas encore développé, si aucun profil `DOCTOR` disponible n'existe, le formulaire affiche un message explicite et désactive la création
- ✅ Suppression avec confirmation — `components/doctors/delete-doctor-button.tsx` ; gestion de l'erreur de contrainte FK (`23503`, médecin référencé par des rendez-vous/consultations en `on delete restrict`)
- Validation Zod — `schemas/doctor.schema.ts`
- Services — `lib/services/doctors.service.ts` (`listDoctors`, `getDoctorById`, `listAvailableDoctorProfiles`)
- Server actions — `app/(dashboard)/doctors/actions.ts`

### ✅ Rendez-vous (`/appointments`) + Calendrier
- RLS : lecture/écriture pour tout utilisateur authentifié (ADMIN, DOCTOR, SECRETARY), suppression incluse
- ✅ Onglet "Liste" — [app/(dashboard)/appointments/page.tsx](app/(dashboard)/appointments/page.tsx) : tableau avec date/heure, patient, médecin, motif, statut (changement rapide via `AppointmentStatusSelect`), actions modifier/supprimer
  - Filtres URL : recherche (motif/notes), patient, médecin, statut, date — `components/appointments/appointments-filters.tsx`
- ✅ Onglet "Calendrier" — `components/appointments/appointments-calendar.tsx` (FullCalendar : vues mois/semaine/jour/liste, locale FR)
  - Création depuis un clic sur une case du calendrier (pré-remplit début/fin, créneau de 30 min)
  - Modification/consultation des détails depuis un clic sur un événement
  - Couleur de l'événement selon le statut
- ✅ Création/modification via Dialog — `components/appointments/appointment-dialog.tsx`, `appointment-form.tsx` (sélection patient/médecin, début/fin en `datetime-local`, motif, statut, notes ; validation Zod avec règle fin > début)
- ✅ Suppression avec confirmation — `components/appointments/delete-appointment-button.tsx` ; gestion de l'erreur de contrainte FK (`23503`, rendez-vous référencé par une consultation)
- Validation Zod — `schemas/appointment.schema.ts`
- Services — `lib/services/appointments.service.ts` (`listAppointments` avec filtres, `getAppointmentById`, `listTodayAppointments`, `listUpcomingAppointments`)
- Server actions — `app/(dashboard)/appointments/actions.ts` (`createAppointment`, `updateAppointment`, `updateAppointmentStatus`, `deleteAppointment`)
- ⚠️ Fix dépendance : `@fullcalendar/react` était en version majeure 7 alors que tous les autres packages `@fullcalendar/*` (core, daygrid, timegrid, list, interaction) étaient en 6.1.21 → erreurs de typage TS (`PluginDef`/`PluginInput` incompatibles). Corrigé en alignant `@fullcalendar/react` sur `^6.1.21` (`npm install @fullcalendar/react@^6.1.21`)

### ✅ Consultations (`/consultations`)
- RLS : lecture/écriture réservée ADMIN + DOCTOR (la secrétaire n'y a pas accès), policy déjà en place depuis la migration initiale
- ✅ Liste avec filtres (patient, médecin, date) — [app/(dashboard)/consultations/page.tsx](app/(dashboard)/consultations/page.tsx), `components/consultations/consultations-filters.tsx`
- ✅ Création — [app/(dashboard)/consultations/new/page.tsx](app/(dashboard)/consultations/new/page.tsx) : formulaire complet en page dédiée (pas de Dialog, trop de champs), avec deux points d'entrée contextualisés :
  - Depuis un rendez-vous `COMPLETED` : bouton dédié dans `/appointments` → `?appointmentId=...` → patient/médecin/date verrouillés et pré-remplis (`lockedAppointment`)
  - Depuis la fiche patient (onglet Consultations) → `?patientId=...` → patient verrouillé (`lockedPatientId`)
  - Création libre également possible depuis `/consultations` (aucun champ verrouillé)
- ✅ Détail — [app/(dashboard)/consultations/[id]/page.tsx](app/(dashboard)/consultations/[id]/page.tsx) : tous les champs (motif, symptômes, examen clinique, diagnostic, traitement, notes médicales), lien vers le rendez-vous d'origine si applicable
- ✅ Modification — [app/(dashboard)/consultations/[id]/edit/page.tsx](app/(dashboard)/consultations/[id]/edit/page.tsx) (patient/médecin déverrouillés en édition)
- ✅ Suppression avec confirmation — `components/consultations/delete-consultation-button.tsx`
- ✅ Onglet "Consultations" dans la fiche patient — `components/patients/patient-consultations-tab.tsx`, historique trié par date décroissante, lien vers le détail, bouton de création pré-remplie
- Validation Zod — `schemas/consultation.schema.ts`
- Service — `lib/services/consultations.service.ts` (`listConsultations` avec filtres, `getConsultationById`, `listRecentConsultations`, `countConsultationsThisMonth` — ces deux derniers prêts pour le futur dashboard complet)
- Server actions — `app/(dashboard)/consultations/actions.ts` (`createConsultation`, `updateConsultation`, `deleteConsultation`)

### ✅ Bilans médicaux (`/medical-reports`)
- RLS : lecture/écriture réservée ADMIN + DOCTOR (table `medical_reports` et bucket storage `medical-reports`), policies déjà en place depuis les migrations initiales
- ✅ Liste avec filtres (patient, type, date) — [app/(dashboard)/medical-reports/page.tsx](app/(dashboard)/medical-reports/page.tsx), `components/medical-reports/medical-reports-filters.tsx` (filtre côté page pour l'instant, volume attendu faible)
- ✅ Création — [app/(dashboard)/medical-reports/new/page.tsx](app/(dashboard)/medical-reports/new/page.tsx) : formulaire en page dédiée (titre, type libre, description, date, médecin optionnel, document obligatoire), avec deux points d'entrée contextualisés :
  - Depuis la fiche patient (onglet Bilans) → `?patientId=...` → patient verrouillé, liste des consultations du patient proposée pour association optionnelle
  - Depuis le détail d'une consultation → `?patientId=...&consultationId=...` → patient et consultation verrouillés
  - Création libre également possible depuis `/medical-reports`
- ✅ Upload du document vers le bucket privé `medical-reports` (chemin `<patient_id>/<uuid>-<nom fichier>`), rollback du fichier uploadé si l'insertion DB échoue
- ✅ Détail — [app/(dashboard)/medical-reports/[id]/page.tsx](app/(dashboard)/medical-reports/[id]/page.tsx) : téléchargement via URL signée (`createSignedUrl`, 60s, bucket privé), lien vers la consultation associée si présente
- ✅ Modification — [app/(dashboard)/medical-reports/[id]/edit/page.tsx](app/(dashboard)/medical-reports/[id]/edit/page.tsx) : remplacement optionnel du document (l'ancien fichier est supprimé du storage après succès de la mise à jour)
- ✅ Suppression avec confirmation — `components/medical-reports/delete-medical-report-button.tsx` (supprime aussi le fichier associé dans le storage)
- ✅ Onglet "Bilans" dans la fiche patient — `components/patients/patient-medical-reports-tab.tsx`
- Validation Zod — `schemas/medical-report.schema.ts` (le fichier n'est pas dans le schema Zod, géré séparément côté action car c'est un `File`, pas une string)
- Service — `lib/services/medical-reports.service.ts` (`listMedicalReports` avec filtres, `getMedicalReportById`, `listRecentMedicalReports`, `getMedicalReportDownloadUrl`)
- Server actions — `app/(dashboard)/medical-reports/actions.ts` (`createMedicalReport`, `updateMedicalReport`, `deleteMedicalReport` ; acceptent directement un `File` en argument, supporté nativement par les server actions Next.js)

### ✅ Notes médicales (onglet "Notes médicales" dans la fiche patient)
- RLS : lecture/écriture réservée ADMIN + DOCTOR (table `medical_notes`), policy déjà en place depuis la migration initiale
- Pas de page dédiée ni d'entrée dans la navigation (le cahier des charges ne prévoit pas de liste globale, seulement l'historique dans la fiche patient) : gestion entièrement via Dialog, comme le module Maladies
- ✅ Ajout/modification via Dialog — `components/patients/medical-note-dialog.tsx`, `medical-note-form.tsx` (médecin, date, titre optionnel, contenu, consultation associée optionnelle si le patient a des consultations)
  - Le médecin connecté est présélectionné par défaut (association `doctors.profile_id` ↔ utilisateur courant) sans bloquer le choix d'un autre médecin
- ✅ Suppression avec confirmation — `components/patients/delete-medical-note-button.tsx`
- ✅ Historique affiché par ordre chronologique décroissant avec auteur (médecin) et date — `components/patients/patient-medical-notes-tab.tsx`
- Validation Zod — `schemas/medical-note.schema.ts`
- Service — `lib/services/medical-notes.service.ts` (`listMedicalNotesForPatient`, `listRecentMedicalNotes` — prêt pour le futur dashboard/historique global)
- Server actions — `app/(dashboard)/patients/medical-notes-actions.ts` (`addMedicalNote`, `updateMedicalNote`, `deleteMedicalNote`), suivant le même pattern que `diseases-actions.ts`

### ✅ Historique médical chronologique (onglet "Historique" dans la fiche patient — section 14 du cahier des charges)
- Pas de nouvelle table : agrégation applicative pure de 4 sources existantes (consultations, bilans médicaux, notes médicales, maladies du patient) triées par date décroissante — `lib/services/patient-history.service.ts` (`listPatientHistory(patientId)`)
- Types/constantes partagés (`PatientHistoryEvent`, `PatientHistoryEventType`, `PATIENT_HISTORY_EVENT_TYPES`) extraits dans `lib/types/patient-history.ts` (fichier sans `server-only`) pour être importables depuis le composant client sans forcer le bundling du service serveur
- ✅ Onglet "Historique" dans la fiche patient — `components/patients/patient-history-tab.tsx` : timeline verticale (icône + date + type + médecin + titre + description), filtres locaux (type d'événement, médecin, date) en état de composant (pas de filtres URL, car sous-onglet d'une fiche patient et non une page dédiée)
- Chaque événement pointe vers son détail quand une page existe (consultation, bilan) ; pas de lien pour les notes médicales et maladies (pas de page dédiée)
- `npm run build` et `npm run lint` : OK

### ✅ Dashboard complet (`/dashboard`)
- Cartes statistiques : nombre de patients, rendez-vous du jour (tous rôles), consultations du mois (ADMIN + DOCTOR), nombre de médecins (ADMIN)
- Listes récentes : prochains rendez-vous (tous rôles), dernières consultations / derniers bilans médicaux / dernières notes médicales (ADMIN + DOCTOR uniquement, cohérent avec les RLS et la nav qui réservent ces modules)
- Bloc "Liens rapides" (ADMIN) vers Médecins et Maladies
- Rendu conditionnel selon le rôle du profil connecté (`getCurrentUser().profile.role`), pas de nouvelle policy RLS nécessaire (les services existants sont déjà protégés par RLS ; les sections cliniques sont simplement masquées côté UI pour SECRETARY)
- Réutilise entièrement les services déjà écrits pour les modules précédents (`listUpcomingAppointments`, `listTodayAppointments`, `listRecentConsultations`, `countConsultationsThisMonth`, `listRecentMedicalReports`, `listRecentMedicalNotes`, `listDoctors`) — aucune nouvelle fonction de service nécessaire
- `npm run build` et `npm run lint` : OK

### ✅ Vérification globale (section 13 de la roadmap / section 17 du cahier — RLS & permissions)
- Aucun framework de test automatisé n'étant installé, la vérification est faite manuellement + revue de code systématique de chaque policy RLS (`supabase/migrations/20260906000002_rls_policies.sql`) au fil des modules
- Revue RLS confirmée conforme au cahier (section 17) : ADMIN accès complet ; DOCTOR patients/maladies/rendez-vous/consultations/bilans/notes ; SECRETARY limitée à patients + rendez-vous (aucun accès consultations/bilans/notes médicales/maladies, RLS `is_admin() or is_doctor()` sur ces 4 tables)
- Fix de sécurité/UX : ajout de `requireRole(allowedRoles)` dans `lib/services/auth.service.ts`, garde de route complémentaire au filtrage de navigation existant. Appliqué en tête de chaque page réservée : `/consultations`, `/consultations/new`, `/consultations/[id]`, `/consultations/[id]/edit`, `/medical-reports`, `/medical-reports/new`, `/medical-reports/[id]`, `/medical-reports/[id]/edit`, `/diseases` (ADMIN + DOCTOR), `/doctors` (ADMIN uniquement). La sécurité réelle reste assurée par RLS ; ce garde évite simplement qu'un utilisateur non autorisé accède à une page vide/en erreur en tapant l'URL directement
- Fix cohérence rôle : la fiche patient (`/patients/[id]`) masquait déjà les données mais affichait tous les onglets (Maladies/Consultations/Bilans/Notes médicales/Historique) à la SECRETARY ; masqués désormais côté UI (`canSeeClinicalData`) conformément à "la secrétaire ne doit pas pouvoir consulter les notes médicales ni les consultations" (cahier section 17)
- Fix cohérence rôle : le bouton "Créer une consultation" sur un rendez-vous `COMPLETED` (`/appointments`) était visible par tous les rôles ; masqué désormais pour SECRETARY (`canCreateConsultation`)
- Validation Zod confirmée présente sur tous les formulaires (patients, maladies, médecins, rendez-vous, consultations, bilans, notes) en plus des contraintes SQL
- États UI (loading/empty/error) revus : chaque liste a un état vide dédié (icône + message contextuel selon filtres actifs) ; les erreurs Postgres connues (`23505` unicité, `23503` contrainte FK) sont gérées avec des messages explicites (maladies, médecins, rendez-vous)
- `npm run build` et `npm run lint` : OK sur l'ensemble du projet après ces correctifs

### ✅ Finalisation (étape 14)
- `README.md` réécrit : présentation du projet, stack, installation, application des migrations Supabase, création du premier compte ADMIN (manuelle, en attendant le module Utilisateurs), rôles/permissions, notes de déploiement Vercel, structure du projet
- `npm run build` et `npm run lint` : OK sur l'ensemble du projet (dernière vérification avant test complet par l'utilisateur)

### ⬜ Modules non démarrés
Utilisateurs (gestion admin).

## Dette technique / points d'attention connus
- `types/database.types.ts` est écrit à la main (pas encore généré via `supabase gen types typescript`) — nécessite les clés `Relationships`/`Views`/`Functions` pour que `.insert()`/`.update()` typent correctement avec `@supabase/supabase-js`
- Pas encore de tests automatisés (aucun framework de test installé ; vérification faite manuellement, voir section "Vérification globale" ci-dessous)
- Liste des patients sans pagination
- Aucun moyen de créer un profil avec le rôle `DOCTOR` tant que le module Utilisateurs n'est pas développé (le module Médecins ne fait qu'associer une fiche médecin à un profil `DOCTOR` déjà existant) — à créer manuellement via Supabase en attendant

## Journal des sessions

### 2026-09-06
- Inventaire complet de l'existant (voir tableau ci-dessus, étapes 1-4 confirmées faites)
- Module Patients développé et terminé (étape 5) : CRUD complet, recherche, fiche patient
  - Fix connexe : `proxy.ts` utilisait encore l'export `middleware` (ancien nom, Next.js 16 attend `proxy`) — renommé
  - Fix connexe : `types/database.types.ts` complété avec `Relationships`/`Views`/`Functions` pour satisfaire le typage `@supabase/supabase-js` sur `.insert()`/`.update()`
  - `npm run build` et `npm run lint` : OK
- Module Maladies développé et terminé (étape 6) : référentiel CRUD + association patient/maladie intégrée en onglet dans la fiche patient
  - `npm run build` et `npm run lint` : OK
- Module Médecins développé et terminé (étape 7) : CRUD réservé ADMIN, association à un profil existant ayant le rôle DOCTOR
  - `npm run build` et `npm run lint` : OK (npm cache redirigé sur `D:` en cours de session, le disque `C:` étant plein — à surveiller)
- Module Rendez-vous + Calendrier développé et terminé (étapes 8-9) : CRUD, changement de statut, filtres, vue calendrier FullCalendar (mois/semaine/jour/liste)
  - Fix dépendance : `@fullcalendar/react` réaligné sur `^6.1.21` (était en v7, incompatible avec le reste des packages FullCalendar en v6.1.21)
  - `npm run build` et `npm run lint` : OK
- Module Consultations développé et terminé (étape 10) : CRUD complet en pages dédiées, création contextualisée depuis un rendez-vous terminé ou depuis la fiche patient, onglet "Consultations" dans la fiche patient
  - `npm run build` et `npm run lint` : OK
- Module Bilans médicaux développé et terminé (étape 11/12) : CRUD complet, upload/téléchargement de documents vers le bucket privé `medical-reports` (URL signée pour le téléchargement), création contextualisée depuis la fiche patient ou depuis une consultation, onglet "Bilans" dans la fiche patient
  - `npm run build` et `npm run lint` : OK
- Module Notes médicales développé et terminé (étape 11/13) : CRUD via Dialog dans l'onglet "Notes médicales" de la fiche patient (pas de page dédiée, non prévue par le cahier des charges), médecin présélectionné automatiquement si l'utilisateur connecté est un médecin
  - `npm run build` et `npm run lint` : OK
- Onglet "Historique" développé et terminé (section 14 du cahier des charges) : agrégation chronologique des consultations, bilans, notes médicales et maladies dans un nouvel onglet de la fiche patient, avec filtres type/médecin/date
  - Fix connexe : extraction des types/constantes partagés dans `lib/types/patient-history.ts` (sans `server-only`) pour éviter l'erreur de build "`server-only` cannot be imported from a Client Component module" (le composant client importait la constante `PATIENT_HISTORY_EVENT_TYPES` directement depuis le service serveur)
  - `npm run build` et `npm run lint` : OK
- Dashboard complet développé et terminé (étape 12) : cartes statistiques (patients, RDV du jour, consultations du mois, médecins) et listes récentes (prochains RDV, dernières consultations, derniers bilans, dernières notes) avec rendu conditionnel selon le rôle
  - `npm run build` et `npm run lint` : OK
- Vérification globale effectuée (étape 13) : revue des policies RLS (conformes au cahier), ajout d'un garde `requireRole()` au niveau des routes réservées (consultations, bilans médicaux, maladies, médecins) en complément du filtrage de navigation existant, masquage des onglets cliniques (Maladies/Consultations/Bilans/Notes/Historique) et du bouton "Créer une consultation" pour le rôle SECRETARY (non prévus par le cahier pour ce rôle)
  - `npm run build` et `npm run lint` : OK
- Finalisation effectuée (étape 14) : `README.md` réécrit (installation, migrations Supabase, création du premier ADMIN, rôles/permissions, déploiement Vercel, structure du projet)
  - `npm run build` et `npm run lint` : OK
- **Toutes les étapes de la roadmap (1 à 14) sont terminées.** Le projet est prêt pour un test complet de bout en bout par l'utilisateur.
