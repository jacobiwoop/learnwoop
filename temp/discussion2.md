Parfait ! Voici le DBML (Database Markup Language) complet de ta plateforme e-learning, basé sur tout ce qu'on a défini ensemble.

```dbml
// ============================================
// Plateforme E-Learning — DBML Complet
// POC 1 centre → Évolutif multi-organisations
// ============================================

// ---- USERS (Tous les utilisateurs) ----
Table users {
  id integer [pk, increment]
  nom varchar(100) [not null]
  prenom varchar(100) [not null]
  email varchar(255) [unique, not null]
  mot_de_passe varchar(255) [not null]
  role enum('etudiant', 'professeur', 'admin_orga', 'super_admin') [not null, default: 'etudiant']
  organisation_id integer [ref: > organisations.id, default: null, note: "null pour le POC, obligatoire en multi-orga"]
  avatar_url varchar(500) [default: null]
  telephone varchar(20) [default: null]
  statut enum('actif', 'suspendu', 'inactif') [not null, default: 'actif']
  derniere_connexion datetime [default: null]
  created_at datetime [default: `now()`]
  updated_at datetime [default: `now()`]

  indexes {
    email [unique]
    organisation_id
    role
    (nom, prenom)
  }
}

// ---- ORGANISATIONS (Pour la version finale multi-tenant) ----
Table organisations {
  id integer [pk, increment]
  nom varchar(255) [not null]
  slug varchar(255) [unique, not null]
  email varchar(255) [unique, not null]
  telephone varchar(20) [default: null]
  adresse text [default: null]
  ville varchar(100) [default: null]
  pays varchar(100) [default: 'Bénin']
  logo_url varchar(500) [default: null]
  statut enum('actif', 'suspendu', 'en_attente') [not null, default: 'actif']
  abonnement_actif boolean [default: true]
  date_expiration_abonnement date [default: null]
  created_at datetime [default: `now()`]
  updated_at datetime [default: `now()`]

  indexes {
    slug [unique]
    email [unique]
    statut
  }
}

// ---- COURS ----
Table cours {
  id integer [pk, increment]
  titre varchar(255) [not null]
  slug varchar(255) [unique, not null]
  description text [default: null]
  image_couverture varchar(500) [default: null]
  prof_id integer [not null, ref: > users.id]
  organisation_id integer [default: null, ref: > organisations.id, note: "null pour POC"]
  statut enum('brouillon', 'publié', 'archivé') [not null, default: 'brouillon']
  created_at datetime [default: `now()`]
  updated_at datetime [default: `now()`]

  indexes {
    slug [unique]
    prof_id
    organisation_id
    statut
  }
}

// ---- INSCRIPTIONS (Étudiants ↔ Cours) ----
Table inscriptions {
  id integer [pk, increment]
  etudiant_id integer [not null, ref: > users.id]
  cours_id integer [not null, ref: > cours.id]
  statut enum('actif', 'terminé', 'abandonné') [not null, default: 'actif']
  progression decimal(5,2) [default: 0, note: "Pourcentage de complétion 0-100"]
  created_at datetime [default: `now()`]
  updated_at datetime [default: `now()`]

  indexes {
    (etudiant_id, cours_id) [unique]
    etudiant_id
    cours_id
  }
}

// ---- SESSIONS (Live ou Rediffusion) ----
Table sessions {
  id integer [pk, increment]
  cours_id integer [not null, ref: > cours.id]
  titre varchar(255) [not null]
  description text [default: null]
  type enum('live', 'rediffusion') [not null]
  date_heure datetime [not null, note: "Date et heure de début pour le live, date de publication pour la rediffusion"]
  duree_minutes integer [default: null, note: "Durée estimée ou réelle en minutes"]
  lien_live varchar(500) [default: null, note: "Lien de la room LiveKit pour les lives"]
  livekit_room_name varchar(255) [default: null]
  lien_video varchar(500) [default: null, note: "Lien de la rediffusion stockée"]
  statut enum('programmé', 'en_cours', 'terminé', 'annulé') [not null, default: 'programmé']
  ordre integer [default: 0, note: "Ordre d'affichage dans le cours"]
  created_at datetime [default: `now()`]
  updated_at datetime [default: `now()`]

  indexes {
    cours_id
    type
    statut
    date_heure
  }
}

// ---- RESSOURCES (Fichiers uploadés par le prof) ----
Table ressources {
  id integer [pk, increment]
  cours_id integer [not null, ref: > cours.id]
  session_id integer [default: null, ref: > sessions.id, note: "Peut être lié à une session spécifique"]
  titre varchar(255) [not null]
  description text [default: null]
  type enum('pdf', 'video', 'slide', 'document', 'image', 'lien', 'autre') [not null]
  url varchar(500) [not null, note: "Chemin du fichier ou lien externe"]
  taille_fichier integer [default: null, note: "Taille en octets"]
  ordre integer [default: 0]
  created_at datetime [default: `now()`]
  updated_at datetime [default: `now()`]

  indexes {
    cours_id
    session_id
    type
  }
}

// ---- NOTES (Prises par les étudiants) ----
Table notes {
  id integer [pk, increment]
  etudiant_id integer [not null, ref: > users.id]
  session_id integer [not null, ref: > sessions.id]
  titre varchar(255) [default: null, note: "Titre optionnel de la note"]
  contenu text [not null, note: "Contenu de la note en texte riche"]
  created_at datetime [default: `now()`]
  updated_at datetime [default: `now()`]

  indexes {
    (etudiant_id, session_id) [unique]
    etudiant_id
    session_id
  }
}

// ---- EMPLOI DU TEMPS (Optionnel — pour gérer la planification) ----
Table emploi_du_temps {
  id integer [pk, increment]
  organisation_id integer [default: null, ref: > organisations.id]
  cours_id integer [not null, ref: > cours.id]
  session_id integer [default: null, ref: > sessions.id]
  jour_semaine enum('lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche') [not null]
  heure_debut time [not null]
  heure_fin time [not null]
  date_specifique date [default: null, note: "Pour un cours ponctuel hors récurrence"]
  created_at datetime [default: `now()`]
  updated_at datetime [default: `now()`]

  indexes {
    organisation_id
    cours_id
    jour_semaine
  }
}

// ============================================
// RELATIONS (Documentation visuelle)
// ============================================
// users (prof_id) ──< cours
// users (etudiant_id) ──< inscriptions
// cours ──< inscriptions
// cours ──< sessions
// cours ──< ressources
// cours ──< emploi_du_temps
// sessions ──< notes (via etudiant)
// sessions ──< ressources
// sessions ──< emploi_du_temps
// organisations ──< users
// organisations ──< cours
// organisations ──< emploi_du_temps
```

## 📊 Résumé visuel des relations

```
┌─────────────┐       ┌──────────────┐
│ ORGANISATIONS│──<────│    USERS      │
│              │       │  (role:       │
│  - nom       │       │   super_admin,│
│  - email     │       │   admin_orga, │
│  - statut    │       │   professeur, │
└─────────────┘       │   etudiant)   │
                      └───────────────┘
                         │         ↑
                         │         │
                    (prof)     (etudiant)
                         │         │
                         ↓         │
                    ┌─────────┐    │
                    │  COURS   │    │
                    │          │    │
                    │ - titre  │    │
                    │ - desc   │    │
                    └─────────┘    │
                         │         │
              ┌──────────┼─────────┘
              │          │
              ↓          ↓
        ┌──────────┐  ┌─────────────┐
        │ SESSIONS │  │ INSCRIPTIONS │
        │          │  │              │
        │ - live   │  │ - etudiant_id│
        │ - rediff │  │ - cours_id   │
        └──────────┘  └─────────────┘
              │
        ┌─────┴─────┐
        ↓           ↓
   ┌────────┐  ┌────────┐
   │ NOTES  │  │RESSOURCES│
   │        │  │         │
   │-contenu│  │-pdf,vid │
   └────────┘  └─────────┘
```

Ce DBML est :
- **Prêt pour le POC** : toutes les tables essentielles sont là
- **Évolutif** : la colonne `organisation_id` est prévue mais nullable pour le moment
- **Compatible** avec dbdiagram.io pour générer un schéma visuel automatiquement
- **Documenté** avec des notes et commentaires

Tu veux qu'on transforme ça en migrations Laravel maintenant ? Ou tu préfères d'abord visualiser le schéma sur dbdiagram.io ?