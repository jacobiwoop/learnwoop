# Mission détaillée – Gestion des sessions Live avec fuseaux horaires

## Contexte et problème
- Les cours en live sont planifiés via deux mécanismes : sessions flexibles (`sessions` table) et horaires récurrents (`cour_horaires`).
- Le serveur Laravel stocke les dates/heures en **UTC** (configuration `DB_CONNECTION=sqlite` ou MySQL). 
- Le front‑end React utilise `<input type="datetime-local">` qui renvoie une chaîne **sans fuseau** : la date/heure locale du navigateur. 
- Lorsqu’on envoie cette valeur au backend, elle est interprétée comme UTC → décalage d’environ **2 heures** (ou selon le fuseau du client).
- Conséquence : les sessions ne démarre pas/finissent pas au bon moment, les marges de ±10 min ne sont jamais satisfaites, et les erreurs `404 – Aucun cours en direct` apparaissent.

## Principes à respecter
1. **Never trust the client** – ne jamais accepter les dates brutes comme étant en UTC.
2. **Stocker tout en UTC** dans la base de données.
3. **Convertir côté client** : transformer l’entrée locale en string ISO 8601 avec offset (`Z` ou `+hh:mm`).
4. **Backend** : parser la chaîne avec `Carbon::parse($value)` qui reconnait le fuseau et normalise en UTC.
5. **API** : les paramètres d’API (`date_heure`) doivent être documentés comme *ISO‑8601 UTC*.

## Solution proposée – Étapes détaillées
### 1️⃣ Front‑end (React)
- Créer une fonction utilitaire `localToUtc(value: string): string` :
  ```js
  function localToUtc(value) {
    // value au format '2026-05-21T14:30' (sans fuseau)
    const date = new Date(value); // le constructeur utilise le fuseau local du navigateur
    return date.toISOString(); // e.g. '2026-05-21T12:30:00.000Z'
  }
  ```
- Avant d’envoyer le formulaire (création ou mise à jour d’une session), appeler cette fonction sur le champ `date_heure` et remplacer la valeur.
- Mettre à jour les contrôles de formulaire (`onSubmit`) pour inclure cette conversion.
- Ajouter des commentaires explicatifs pour que le développeur comprenne le pourquoi.

### 2️⃣ Backend (Laravel)
- Dans `LiveKitController::getToken` :
  ```php
  $dateHeureInput = $request->input('date_heure');
  $dateHeureUtc   = Carbon::parse($dateHeureInput)->setTimezone('UTC');
  ```
- Utiliser `$dateHeureUtc` partout où la logique actuelle accède à `date_heure` (requêtes, comparaisons).
- Adapter les requêtes SQLite/MySQL déjà présentes : les fonctions `datetime`/`DATE_ADD` travaillent en UTC, donc aucune modification supplémentaire n’est nécessaire.
- Mettre à jour les **validation rules** du `FormRequest` pour accepter le format ISO‑8601.

### 3️⃣ Tests automatisés
- Ajouter un test unitaire qui soumet une date locale (`2026‑05‑21T14:00`) depuis un client en `Europe/Paris` (+02) et vérifie que le serveur enregistre `2026‑05‑21 12:00:00` en UTC.
- Vérifier que la marge de `±10 min` fonctionne : créer une session pour `now + 5 min` et s’assurer que le token est délivré.

### 4️⃣ Documentation
- Mettre à jour le **README** du projet et le fichier `API.md` :
  - Indiquer que `date_heure` doit être envoyé au format ISO‑8601 (`YYYY-MM-DDTHH:mm:ssZ`).
  - Donner un exemple de conversion côté front‑end.
- Créer un petit guide "Gestion des fuseaux" dans le dossier `docs/`.

### 5️⃣ Déploiement
- Aucun changement de configuration serveur n’est requis (la base reste en UTC).
- Après le déploiement, vérifier dans les logs que les nouvelles requêtes contiennent le suffixe `Z`.

## Risques et mitigations
| Risque | Impact | Mitigation |
|--------|--------|------------|
| Oubli de conversion sur une page/formulaire | Sessions hors‑horaire → mauvaise expérience | Ajout de tests end‑to‑end et revue de code obligatoire avant merge |
| Incohérence entre SQLite et MySQL | Bugs de date selon l’environnement | Utiliser la même logique (`Carbon::parse` → UTC) avant la requête, indépendamment du driver |
| Clients avec fuseaux non supportés (ex. IE) | Parsing erroné | Utiliser `date-fns-tz` ou `luxon` si besoin, sinon fallback à `new Date()` qui gère la majorité des navigateurs modernes |

## Planning (estimation)
- **Jour 1** : Implémenter la fonction `localToUtc` et l’intégrer dans les formulaires `Create.jsx` et `Edit.jsx`.
- **Jour 2** : Adapter le contrôleur Laravel, mettre à jour les règles de validation.
- **Jour 3** : Écrire les tests unitaires et d’intégration.
- **Jour 4** : Documentation & revue de code.
- **Jour 5** : Déploiement en staging, validation manuelle avec plusieurs fuseaux (Europe/Paris, America/New_York).

---

*Ce document a été rédigé dans le même style que les autres missions du dossier `mission/` (markdown, sections claires, tableau des risques, planning).*
