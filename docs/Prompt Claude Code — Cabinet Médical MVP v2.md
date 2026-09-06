# Projet : Cabinet Médical — MVP

## 1. Objectif

Développer une application web de gestion d'un cabinet médical dans le cadre d'un stage d'initiation.

L'application doit permettre de gérer les patients, les médecins, les rendez-vous, les consultations et l'historique médical.

Le projet doit rester un **MVP pédagogique**, avec une architecture propre, une interface moderne et des fonctionnalités suffisamment complètes pour démontrer les compétences du stagiaire.

---

# 2. Stack technique

Utiliser obligatoirement :

- **Next.js** avec App Router
- **React**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **Supabase**
  - PostgreSQL
  - Authentication
  - Row Level Security (RLS)
  - Storage pour les documents médicaux
- **React Hook Form**
- **Zod**
- **FullCalendar**
- **Lucide React**
- **Git / GitHub**
- **Vercel** pour le déploiement

Ne pas utiliser MongoDB, Express ou Redux pour ce MVP.

---

# 3. Modules fonctionnels

L'application doit contenir les modules suivants :

```text
Dashboard
│
├── Utilisateurs
├── Médecins
├── Patients
├── Maladies
├── Rendez-vous
├── Consultations
├── Historique médical
└── Bilans médicaux
```

---

# 4. Gestion des utilisateurs

Prévoir trois rôles :

```text
ADMIN
DOCTOR
SECRETARY
```

Fonctionnalités :

- Connexion / déconnexion
- Gestion des sessions
- Gestion des utilisateurs
- Gestion des rôles
- Activation / désactivation
- Protection des routes

### Permissions

**ADMIN**
- Accès complet

**DOCTOR**
- Patients
- Rendez-vous
- Consultations
- Maladies
- Historique médical

**SECRETARY**
- Patients
- Rendez-vous
- Informations administratives des patients

La secrétaire ne doit pas pouvoir consulter ou modifier les notes médicales confidentielles.

---

# 5. Gestion des patients

Créer le module `/patients`.

## 5.1 Informations personnelles

La fiche patient doit contenir exactement les champs suivants :

| Champ | Type | Obligatoire |
|---|---|---|
| Nom | Texte | Oui |
| Prénom | Texte | Oui |
| Sexe | Sélection | Non |
| Date de naissance | Date | Non |
| Poids (kg) | Nombre décimal | Non |
| Taille (cm) | Nombre décimal | Non |
| Groupe sanguin | Sélection | Non |
| Téléphone | Texte | Non |
| Allergies | Texte long | Non |
| Antécédents | Texte long | Non |
| Maladies chroniques | Texte long | Non |

### Informations complémentaires recommandées

Ajouter également :

```text
id
email
adresse
created_at
updated_at
```

Ces champs doivent rester simples et adaptés à un MVP.

---

## 5.2 Fonctionnalités patients

- Ajouter un patient
- Modifier un patient
- Supprimer un patient
- Rechercher un patient
- Filtrer les patients
- Consulter la fiche complète
- Consulter l'historique médical
- Consulter les consultations
- Consulter les bilans
- Consulter les notes des médecins

### Recherche

Permettre la recherche par :

- Nom
- Prénom
- Téléphone

---

# 6. Gestion des maladies

Créer le module `/diseases`.

Une maladie doit être un **référentiel médical**, indépendant des patients.

## 6.1 Table diseases

```text
id
name
code
description
category
created_at
updated_at
```

Exemples :

```text
Diabète
Hypertension
Asthme
Grippe
Migraine
Allergie
```

## 6.2 Fonctionnalités

- Ajouter une maladie
- Modifier une maladie
- Supprimer une maladie
- Rechercher une maladie
- Filtrer par catégorie

---

# 7. Association Patient / Maladie

Créer une table :

```text
patient_diseases
```

Cette table permet de conserver les maladies diagnostiquées chez chaque patient.

## 7.1 Champs

```text
id
patient_id
disease_id
diagnosed_at
status
notes
created_at
updated_at
```

### Statuts

```text
ACTIVE
RESOLVED
CHRONIC
```

## 7.2 Fonctionnalités

- Ajouter une maladie à un patient
- Modifier les informations
- Retirer une maladie
- Voir la date de diagnostic
- Ajouter une note
- Voir les maladies actives
- Voir les maladies chroniques

### Exemple

```text
Patient : Ahmed Ben Ali

Maladies
────────────────────────────

Diabète
Date de diagnostic : 2024
Statut : Chronique
Notes : Suivi régulier

Hypertension
Date de diagnostic : 2025
Statut : Active
Notes : Contrôle de la tension
```

---

# 8. Gestion des rendez-vous

Créer `/appointments`.

## 8.1 Table appointments

```text
id
patient_id
doctor_id
start_at
end_at
reason
status
notes
created_at
updated_at
```

## 8.2 Statuts

```text
PLANNED
CONFIRMED
COMPLETED
CANCELLED
ABSENT
```

## 8.3 Fonctionnalités

- Créer un rendez-vous
- Modifier
- Annuler
- Changer le statut
- Rechercher
- Filtrer par médecin
- Filtrer par patient
- Filtrer par date
- Voir les rendez-vous du jour

---

# 9. Calendrier

Utiliser **FullCalendar**.

Prévoir :

- Vue jour
- Vue semaine
- Vue mois
- Création depuis le calendrier
- Modification depuis le calendrier
- Consultation des détails

Chaque rendez-vous doit afficher :

```text
Heure
Patient
Médecin
Statut
```

---

# 10. Gestion des consultations

Créer le module `/consultations`.

Une consultation représente un **acte médical réalisé par un médecin pour un patient**.

Une consultation doit être liée à :

```text
Patient
Médecin
Rendez-vous
```

## 10.1 Table consultations

```text
id
appointment_id
patient_id
doctor_id
consultation_date
reason
symptoms
clinical_examination
diagnosis
treatment
medical_notes
created_at
updated_at
```

### Description des champs

| Champ | Description |
|---|---|
| Motif | Pourquoi le patient consulte |
| Symptômes | Symptômes déclarés |
| Examen clinique | Résultats de l'examen |
| Diagnostic | Diagnostic établi |
| Traitement | Traitement prescrit ou recommandé |
| Notes médicales | Observations complémentaires du médecin |

## 10.2 Fonctionnalités

- Créer une consultation
- Modifier une consultation
- Consulter une consultation
- Associer une consultation à un rendez-vous
- Consulter l'historique des consultations
- Rechercher par patient
- Filtrer par médecin
- Filtrer par date

### Règle importante

Une consultation doit être créée à partir d'un rendez-vous terminé ou directement depuis la fiche patient.

---

# 11. Historique médical du patient

Créer une section dans :

```text
/patients/[id]
```

L'historique doit regrouper toutes les informations médicales du patient.

## 11.1 Structure

```text
Patient
│
├── Informations personnelles
│
├── Allergies
│
├── Antécédents
│
├── Maladies chroniques
│
├── Maladies diagnostiquées
│
├── Rendez-vous
│
├── Consultations
│
├── Bilans médicaux
│
└── Notes des médecins
```

## 11.2 Interface

Créer des onglets :

```text
Informations
Maladies
Consultations
Bilans
Notes médicales
```

### Exemple

```text
Patient : Ahmed Ben Ali

────────────────────────────────────

Informations personnelles

Nom : Ben Ali
Prénom : Ahmed
Date de naissance : 15/03/1990
Poids : 75 kg
Taille : 175 cm
Groupe sanguin : O+
Téléphone : ...

────────────────────────────────────

Maladies

Diabète
Hypertension

────────────────────────────────────

Historique des consultations

06/09/2026
Dr. Ali
Motif : Contrôle
Diagnostic : ...
Traitement : ...

20/08/2026
Dr. Karim
Motif : Douleurs
Diagnostic : ...
Traitement : ...
```

---

# 12. Gestion des bilans médicaux

Ajouter un module permettant de gérer les **bilans et documents médicaux**.

Exemples :

```text
Bilan sanguin
Bilan radiologique
Bilan biologique
Bilan cardiologique
Bilan général
```

## 12.1 Table medical_reports

```text
id
patient_id
consultation_id
doctor_id
title
report_type
description
report_date
file_path
created_at
updated_at
```

### Champs

| Champ | Description |
|---|---|
| Titre | Nom du bilan |
| Type | Type de bilan |
| Description | Résumé du bilan |
| Date | Date du bilan |
| Document | Fichier PDF ou image |
| Consultation | Consultation associée |
| Médecin | Médecin ayant demandé ou ajouté le bilan |

## 12.2 Fonctionnalités

- Ajouter un bilan
- Modifier les informations
- Consulter les détails
- Télécharger le document
- Supprimer un bilan
- Filtrer par type
- Filtrer par date
- Associer à une consultation

### Exemple

```text
Bilan sanguin

Date : 06/09/2026
Médecin : Dr. Ali
Consultation : #CONS-001

Description :
Bilan de contrôle général.

Document :
[ Voir le PDF ]
```

---

# 13. Notes des médecins

Ajouter une fonctionnalité permettant aux médecins d'ajouter des **notes médicales** dans le dossier du patient.

## 13.1 Table medical_notes

```text
id
patient_id
doctor_id
consultation_id
title
content
note_date
created_at
updated_at
```

## 13.2 Fonctionnalités

- Ajouter une note
- Modifier une note
- Consulter une note
- Supprimer une note
- Voir l'auteur
- Voir la date
- Associer à une consultation

### Exemple

```text
Notes médicales

06/09/2026
Dr. Ali

Titre : Suivi du patient

Note :
Le patient doit effectuer un contrôle
dans deux semaines.
```

---

# 14. Historique complet

L'historique médical doit afficher les événements dans l'ordre chronologique.

Exemple :

```text
06/09/2026
│
├── Consultation
│   ├── Motif
│   ├── Diagnostic
│   └── Traitement
│
├── Bilan médical
│   └── Bilan sanguin
│
└── Note du médecin
    └── Suivi du patient
```

Permettre de filtrer par :

```text
Type d'événement
Date
Médecin
```

Types :

```text
CONSULTATION
DISEASE
MEDICAL_REPORT
MEDICAL_NOTE
```

---

# 15. Dashboard

Créer `/dashboard`.

Afficher :

```text
Nombre de patients
Nombre de médecins
Rendez-vous aujourd'hui
Consultations du mois
Bilans ajoutés
```

Ajouter :

- Prochains rendez-vous
- Dernières consultations
- Derniers patients ajoutés
- Derniers bilans

---

# 16. Base de données Supabase

Créer les tables suivantes :

```text
profiles
doctors
patients
diseases
patient_diseases
appointments
consultations
medical_reports
medical_notes
```

## Relations

```text
profiles
    │
    └── doctors

patients
    │
    ├── patient_diseases ── diseases
    │
    ├── appointments ── doctors
    │
    ├── consultations ── doctors
    │
    ├── medical_reports ── consultations
    │
    └── medical_notes ── consultations
```

Utiliser :

- UUID
- Foreign Keys
- Index
- Unique constraints lorsque nécessaire
- `created_at`
- `updated_at`

---

# 17. Row Level Security

Configurer correctement les politiques RLS.

### ADMIN

Accès complet.

### DOCTOR

Accès aux :

- Patients
- Maladies
- Rendez-vous
- Consultations
- Bilans
- Notes médicales

### SECRETARY

Accès aux :

- Patients
- Rendez-vous

La secrétaire ne doit pas pouvoir consulter les notes médicales ni les consultations.

Ne jamais désactiver RLS pour simplifier le développement.

---

# 18. Storage Supabase

Utiliser Supabase Storage pour les documents médicaux.

Créer un bucket :

```text
medical-reports
```

Les fichiers doivent être associés à un patient et à une consultation.

Prévoir :

- Upload PDF
- Upload image
- Consultation du document
- Suppression du document

Ne pas stocker les fichiers directement dans PostgreSQL.

---

# 19. UI / UX

Créer une interface professionnelle, simple et responsive.

Utiliser :

- Tailwind CSS
- shadcn/ui
- Cards
- Tables
- Dialogs
- Forms
- Badges
- Tabs
- Toast notifications
- Loading states
- Empty states
- Error states

### Layout

```text
┌──────────────────────────────────────────────┐
│ Header                                       │
├────────────┬─────────────────────────────────┤
│ Sidebar    │                                 │
│            │       Main Content              │
│ Dashboard  │                                 │
│ Patients   │                                 │
│ Doctors    │                                 │
│ RDV        │                                 │
│ Maladies   │                                 │
│ Consult.   │                                 │
│ Bilans     │                                 │
│ Users      │                                 │
└────────────┴─────────────────────────────────┘
```

---

# 20. Validation

Utiliser :

```text
React Hook Form
+
Zod
```

Tous les formulaires doivent avoir :

- Validation
- Messages d'erreur
- Loading state
- Success notification
- Error notification

Exemples :

```text
Nom obligatoire
Prénom obligatoire
Date de naissance valide
Poids positif
Taille positive
Téléphone valide
Email valide
```

---

# 21. Sécurité

Respecter les bonnes pratiques :

- Ne jamais exposer la `service_role key`
- Utiliser uniquement la clé publique côté frontend
- Utiliser RLS
- Valider les données côté serveur
- Vérifier les permissions
- Ne jamais faire confiance au rôle envoyé depuis le frontend
- Utiliser les sessions Supabase
- Ne pas stocker les mots de passe manuellement

---

# 22. Structure du projet

```text
app/
├── login/
├── dashboard/
├── patients/
├── doctors/
├── appointments/
├── consultations/
├── diseases/
├── medical-reports/
├── medical-notes/
└── users/

components/
├── ui/
├── layout/
├── patients/
├── appointments/
├── consultations/
└── medical/

lib/
├── supabase/
├── services/
└── utils/

types/
schemas/
hooks/
```

Ne pas mettre toute la logique directement dans les pages.

---

# 23. Méthode de développement

Développer progressivement.

## Étape 1

Initialisation :

- Next.js
- TypeScript
- Tailwind
- shadcn/ui
- Supabase
- Git

## Étape 2

Base de données :

- Tables
- Relations
- Migrations
- RLS

## Étape 3

Authentification :

- Login
- Logout
- Sessions
- Roles

## Étape 4

Layout :

- Sidebar
- Header
- Navigation
- Dashboard

## Étape 5

Patients :

- CRUD
- Recherche
- Fiche patient

## Étape 6

Maladies :

- CRUD
- Association patient/maladie

## Étape 7

Médecins :

- CRUD

## Étape 8

Rendez-vous :

- CRUD
- Calendrier
- Statuts

## Étape 9

Consultations :

- Création
- Modification
- Historique

## Étape 10

Bilans médicaux :

- CRUD
- Upload documents
- Consultation

## Étape 11

Notes médicales :

- CRUD
- Historique

## Étape 12

Dashboard :

- Statistiques
- Derniers éléments

## Étape 13

Tests :

- Authentication
- Permissions
- CRUD
- RLS
- Validation
- Responsive

## Étape 14

Finalisation :

- Nettoyage du code
- Correction TypeScript
- Correction ESLint
- README
- Déploiement Vercel

---

# 24. Première mission

Commence maintenant par :

1. Initialiser le projet Next.js avec TypeScript.
2. Installer Tailwind CSS et shadcn/ui.
3. Installer les dépendances nécessaires.
4. Configurer Supabase.
5. Créer la structure du projet.
6. Créer le schéma SQL complet.
7. Créer les migrations.
8. Configurer RLS.
9. Créer l'authentification.
10. Créer le layout principal.
11. Créer le login.
12. Créer un dashboard initial.
13. Créer le README.
14. Vérifier que le projet démarre avec :

```bash
npm run dev
```

Puis vérifier :

```bash
npm run build
```

Ne passe pas aux modules Patients/Rendez-vous/Consultations tant que l'initialisation, l'authentification, la base de données et le layout ne sont pas fonctionnels.

À chaque étape importante, indique :

- Ce qui a été développé
- Les fichiers créés/modifiés
- Les commandes exécutées
- Les éventuelles erreurs
- L'étape suivante

Le code doit être propre, maintenable, pédagogique et suffisamment simple pour être compris par un stagiaire débutant.