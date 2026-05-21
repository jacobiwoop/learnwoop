# Étapes immédiates : Interface et Accès Étudiant

Voici les étapes concrètes que tu vas réaliser pour connecter l'interface de l'étudiant aux données réelles de la base de données et lui ouvrir l'accès aux cours ainsi qu'aux lives.

---

## 🛠️ Étape 1 : Activer la récupération des cours dans `CourseController.php`

Pour commencer, nous devons remplacer le tableau vide temporaire renvoyé aux étudiants par la récupération de leurs vrais cours depuis leurs inscriptions.

1. Ouvre le fichier [CourseController.php](file:///home/aiko/Documents/learning/app/Http/Controllers/CourseController.php).
2. Repère la méthode `index` (autour de la ligne 16 à 26).
3. Modifie la condition `else` pour récupérer dynamiquement les cours de l'étudiant :

```php
// AVANT :
} else {
    // Étudiant: récupérer les cours auxquels il est inscrit
    // $courses = $user->inscriptions()->with('cour')->get()->pluck('cour');
    $courses = []; // Temporaire pour les étudiants
}

// APRÈS :
} else {
    // Étudiant: récupérer les cours auxquels il est inscrit
    $courses = $user->inscriptions()->with('cour.sessions')->get()->pluck('cour');
}
```

*💡 Pourquoi `cour.sessions` ?*  
Nous utilisons `cour.sessions` pour charger à la fois le cours et ses sessions associées, garantissant que l'interface a toutes les cartes en main pour afficher les détails du cours et ses programmations.

---

## 🛠️ Étape 2 : Vérification du formatage des données

Regarde la suite de la méthode `index` (lignes 29 à 38) :
```php
$formattedCourses = $courses->map(function ($cour) {
    return [
        'id' => $cour->id,
        'titre' => $cour->titre,
        'categorie' => 'General',
        'progression' => 0, 
        'image' => $cour->image_couverture ?: 'https://lh3.googleusercontent.com/aida-public/...',
        'color' => '#ffdf9e',
        'textColor' => '#261a00'
    ];
});
```
Grâce à `pluck('cour')`, la variable `$courses` contient une collection d'objets `Cour` exactement de la même manière que pour le professeur. La fonction `.map` fonctionnera donc de façon transparente et uniforme !

---

## 🧪 Étape 3 : Tester l'affichage côté Étudiant

Une fois le code modifié :
1. Connecte-toi sur ton navigateur avec l'adresse **`student@test.com`**.
2. Rends-toi sur la page des cours (`/courses` ou page d'accueil).
3. **Vérifie** :
   - Le ou les cours auxquels l'étudiant est inscrit doivent maintenant apparaître dans son interface avec leur titre et leur design !
   - Clique sur l'un de ces cours pour aller sur sa page de détails.
   - Va dans l'onglet **Calendrier** de l'étudiant. Les séances de cours ou les horaires récurrents doivent s'afficher en s'adaptant à l'heure locale de ton navigateur.

---

## 🧪 Étape 4 : Tester l'accès au Live en temps réel

Pour valider l'entrée de l'étudiant en direct :
1. Crée ou modifie une session active (Flexible) ou un horaire régulier pour le cours de l'étudiant de manière à ce qu'il soit prévu dans la fenêtre actuelle (ex: dans les 5 prochaines minutes).
2. En tant qu'étudiant, accède à la page **Diffusion / Live** de ce cours.
3. **Vérifie dans la console de ton navigateur** :
   - La requête `/live-token` doit aboutir avec un code `200 OK`.
   - L'étudiant doit obtenir son token et se connecter directement à la salle de visioconférence (LiveKit).

---

## 🚀 À toi de jouer !

Tu as toutes les cartes en main. Ouvre [CourseController.php](file:///home/aiko/Documents/learning/app/Http/Controllers/CourseController.php), fais la modification de l'Étape 1, puis fais tes tests dans le navigateur. 

*Si tu rencontres une erreur ou si l'un des affichages se comporte bizarrement, dis-le moi !*
