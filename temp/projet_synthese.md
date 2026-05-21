# 🎓 Projet : Plateforme E-Learning SaaS (Bénin)

## 1. Vision du Projet
L'objectif est de créer une solution de gestion d'apprentissage (LMS) moderne et adaptée au marché béninois. La plateforme permet à des centres de formation privés de digitaliser leurs cours, de gérer leurs étudiants et d'assurer une continuité pédagogique via des cours en direct.

**Modèle final :** SaaS Multi-tenant (une seule plateforme, plusieurs organisations indépendantes).

## 2. Objectif du POC (Proof of Concept)
Pour valider l'idée rapidement, nous développons une version simplifiée :
- **Périmètre :** Gestion pour un seul centre de formation.
- **Priorité :** Fluidité des cours en live et accessibilité des rediffusions.
- **Paiement :** Non inclus dans le POC (gestion manuelle), mais prévu en Mobile Money pour la suite.

## 3. Rôles et Fonctionnalités (Phase 1)

### 🧑‍🏫 Le Professeur
- **Gestion Pédagogique :** Organisation des cours en **Modules** et **Chapitres**.
- **Planification :** Ajout de ses interventions dans l'**Emploi du temps / Calendrier**.
- **Live Interactif :** 
    - Lancement du Live.
    - Gestion des autorisations (micro, caméra, chat) pour les étudiants.
- **Contenus :** Upload des supports et gestion des rediffusions.

### 🧑‍🎓 L'Étudiant
- **Tableau de Bord :** Vue "Programme du jour" pour voir les Lives imminents.
- **Calendrier :** Vue d'ensemble de la semaine avec accès rapide aux options du cours au clic.
- **Espace de Cours :**
    - Navigation par modules et suivi de la progression.
    - **Onglets dédiés :** Ressources, Notes Personnelles, **Notes Partagées** (tableau blanc ou bloc-notes collaboratif durant les sessions Live).
    - Historique des rediffusions.

## 4. User Flow (Parcours Utilisateur)

### Parcours Professeur
1. **Dashboard** -> Créer un Cours.
2. **Gestion de contenu** -> Créer Modules -> Ajouter Chapitres/Ressources.
3. **Planification** -> Assigner une plage horaire dans le Calendrier.
4. **Action** -> Lancer le Live -> Gérer les étudiants -> Clôturer et générer la rediffusion.

### Parcours Étudiant
1. **Dashboard** -> Consulter le "Programme du jour".
2. **Calendrier** -> Cliquer sur un cours -> Voir le détail ou rejoindre le Live.
3. **Apprentissage** -> Entrer dans un cours -> Suivre les modules -> Prendre des notes (perso/partagées).

## 5. Stack Technique
- **Backend :** Laravel (PHP 8+) - Choisi pour sa robustesse et sa gestion native des rôles.
- **Frontend :** React - Pour une interface utilisateur réactive et moderne.
- **Visioconférence :** LiveKit - Solution performante pour le temps réel.
- **Base de données :** MySQL.
- **Hébergement Vidéo :** Cloudflare R2 ou AWS S3 (pour les rediffusions).

## 5. Roadmap Simplifiée
1. **Conception :** Validation du schéma de base de données (Fait ✅).
2. **Backend :** Mise en place des API Laravel et de l'authentification.
3. **Live :** Intégration de LiveKit.
4. **Frontend :** Développement de l'interface React.
5. **Déploiement :** Version test pour un centre pilote.
