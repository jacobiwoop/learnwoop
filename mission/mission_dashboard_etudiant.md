# Mission : Dashboard Dynamique, Page "Mes Cours" et Inscription de l'Étudiant

Ce document détaille les spécifications et étapes pour implémenter un tableau de bord et une page "Mes Cours" entièrement sur-mesure pour l'étudiant, avec un système d'inscription via une modal interactive.

---

## 1. Objectifs de l'implémentation

### 🏠 A. Dashboard Dynamique (Accueil)
1. **Les 3 derniers cours** : Afficher uniquement les **3 cours les plus récents** de l'étudiant.
2. **Message d'accueil vide chaleureux** : Si l'étudiant n'a aucun cours inscrit, afficher un message d'encouragement personnalisé et adapté à son apprentissage (pas de message lié à la création de cours).
3. **Bouton dynamique conditionnel** :
   - Le bouton doit afficher **"Voir mes N cours"** (où N est le nombre total de ses cours).
   - Ce bouton doit s'afficher **uniquement si $N \ge 2$**. Si l'étudiant a 0 ou 1 cours, on masque complètement ce bouton.

### 📚 B. Page "Mes Cours" (`Courses/Index.jsx`)
1. **Bouton (+) d'inscription** : Ajouter un bouton **(+) "Rejoindre un cours"** dans le header de la page (ou à côté du titre) visible par les étudiants.
2. **Modal des cours disponibles** :
   - Ce bouton (+) ouvre une modal contenant tous les cours de la plateforme auxquels l'étudiant n'est pas encore inscrit (`availableCourses`).
   - Chaque cours affiché dans la modal propose un bouton d'action rapide **"Rejoindre"** ou **"S'inscrire"**.
3. **Gestion de l'absence de cours (Empty State)** :
   - Si l'étudiant n'a aucun cours (`courses.length === 0`), afficher un message d'absence de cours adapté à un apprenant.
   - Proposer un bouton d'appel à l'action qui **ouvre directement la modal** des cours disponibles pour lui permettre de choisir son premier cours !

---

## 2. Spécifications Techniques

### 🧠 A. Backend & Contrôleur

#### 1. Route `/dashboard` (`routes/web.php`)
Modifier la route pour transmettre :
- `recentCourses` : Les 3 cours les plus récents de l'étudiant (`pluck('cour')`).
- `totalCoursesCount` : Le nombre total de cours de l'utilisateur.
```php
$coursesQuery = $user->inscriptions()->with('cour')->latest();
$recentCourses = $coursesQuery->take(3)->get()->pluck('cour');
$totalCoursesCount = $coursesQuery->count();
```

#### 2. Page des cours (`CourseController@index`)
- **Courses inscrits (`courses`)** : Les cours de l'étudiant via ses inscriptions.
- **Courses disponibles (`availableCourses`)** : Récupérer tous les cours de la plateforme **sauf** ceux auxquels l'étudiant est déjà inscrit.
  *💡 Indice de requête :*
  ```php
  $inscritsIds = $user->inscriptions()->pluck('cours_id');
  $availableCourses = Cour::whereNotIn('id', $inscritsIds)->get();
  ```
- **Nouvelle action d'inscription (`POST /courses/{course}/inscrire`)** :
  Créer une entrée dans la table `inscriptions` pour l'étudiant connecté et le cours spécifié.

---

### 🎨 B. Frontend (React / Inertia)

#### 1. Composant `Dashboard.jsx`
- Récupérer `recentCourses` et `totalCoursesCount`.
- **Condition d'affichage** du bouton de liste complète :
  ```jsx
  {totalCoursesCount >= 2 && (
      <Link href={route('courses.index')} className="text-secondary text-sm font-bold hover:underline">
          Voir mes {totalCoursesCount} cours
      </Link>
  )}
  ```
- **Message en l'absence de cours** :
  ```jsx
  <div className="text-center py-8">
      <p className="text-on-surface-variant font-medium">Vous n'êtes inscrit à aucun cours pour le moment. Rejoignez un cours pour commencer votre aventure d'apprentissage !</p>
  </div>
  ```

#### 2. Composant `Courses/Index.jsx`
- Récupérer les props `courses` (mes cours) et `availableCourses` (cours disponibles).
- **Le bouton (+)** : Afficher un bouton élégant dans le header s'il s'agit d'un étudiant.
- **L'état de la modal** : Gérer un état local React `isEnrollModalOpen` (vrai/faux).
- **Empty State** :
  - Remplacer le message actuel.
  - Le bouton d'appel à l'action doit simplement passer `isEnrollModalOpen` à `true` pour ouvrir la modal de choix !
- **L'inscription** : Lors du clic sur "Rejoindre", appeler `router.post(route('courses.inscrire', courseId))` pour l'inscrire instantanément et rafraîchir la liste.

---

## 🚀 Prochaines Étapes
1. **Validation** : Cette fois, le plan prend-il bien en compte l'ensemble de l'expérience utilisateur pour le Dashboard ET la page "Mes Cours" ?
2. **Action** : Dès ta confirmation, nous écraserons le fichier `mission/immediate.md` avec toutes les instructions détaillées de code pas-à-pas !
