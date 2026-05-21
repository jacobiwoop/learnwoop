# Mission Globale : Interface et Accès Étudiant

Ce document recense l'intégralité des tâches nécessaires pour rendre l'interface de l'étudiant 100% fonctionnelle, de l'affichage des cours à son entrée autonome en session Live.

---

## 1. Objectifs de la Mission
- Permettre à l'étudiant connecté (`student@test.com`) de visualiser ses cours actifs sur son tableau de bord.
- Rendre le calendrier de l'étudiant dynamique et synchronisé avec ses inscriptions.
- Valider le processus de connexion de l'étudiant aux cours en direct (LiveKit) dès que les conditions horaires (marge de ±10 min) sont satisfaites.

---

## 2. Recensement des Tâches à Réaliser

### 📋 A. Gestion du Tableau de Bord Étudiant (Dashboard)
- [ ] **Activation de la récupération des cours** :
  - Décommenter la logique de récupération des cours via la table des inscriptions dans `CourseController.php` (méthode `index`).
  - Gérer les cas où un étudiant n'a encore aucune inscription active (éviter les erreurs de collection vide).
- [ ] **Formatage des données pour le Frontend** :
  - S'assurer que les données transmises au composant React (`Courses/Index`) contiennent les attributs indispensables (progression, couleur, catégorie, etc.) pour garder la cohérence visuelle.

### 📅 B. Calendrier et Emploi du Temps Étudiant
- [ ] **Affichage des détails du cours** :
  - S'assurer que la route `/courses/{id}` est accessible par l'étudiant et charge correctement le composant `Courses/Show` avec ses informations associées.
- [ ] **Affichage dynamique des événements** :
  - Valider que le calendrier projette correctement :
    - Les **sessions flexibles** (issues de la table `sessions` associées au cours).
    - Les **horaires réguliers** (issus de la table `cour_horaires` projetés sur la semaine).
  - Confirmer que le fuseau horaire du navigateur de l'étudiant convertit bien les heures UTC stockées.

### 🎥 C. Accès au Live (Diffusion)
- [ ] **Autorisation et Génération de Token** :
  - Vérifier que `LiveKitController::getToken` identifie correctement l'étudiant à partir de son rôle et de ses inscriptions.
  - S'assurer que le nom du participant (`setName`) envoyé à LiveKit utilise le vrai nom de l'étudiant stocké en base.
- [ ] **Vérification des conditions de démarrage** :
  - Valider que l'étudiant est redirigé ou connecté à la diffusion si et seulement si le cours a démarré ou commence dans les 10 minutes.
  - Configurer un retour visuel clair côté étudiant si le cours n'est pas encore accessible (message propre à la place de l'écran noir ou de l'erreur 500).

---

## 3. Prochaines Étapes
1. **Validation de ce recensement** : Relis ce document pour confirmer que tous tes besoins et scénarios d'utilisation pour l'étudiant y sont bien décrits.
2. **Création de la mission immédiate** : Dès que tu me donnes ton feu vert ("OK tout est recensé"), je générerai le fichier `mission/immediate.md` qui détaillera les étapes de code pas à pas pour que tu puisses l'implémenter facilement.
