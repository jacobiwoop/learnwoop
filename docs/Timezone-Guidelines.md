# Gestion des Fuseaux Horaires

## Problème
Le frontend utilise `<input type="datetime-local">` qui renvoie une date **sans fuseau horaire** (ex: `2026-05-21T14:00`).  
Laravel interprète cette chaîne comme **UTC** par défaut, ce qui cause un décalage de 2 heures pour les utilisateurs en Europe/Paris.

## Solution
- **Frontend** : Convertir les dates `datetime-local` en ISO-8601 avec timezone **avant l'envoi** au backend
- **Backend** : Utiliser `Carbon::parse($value)` qui interprète correctement les ISO-8601 avec offset
- **Stockage** : Toutes les dates sont stockées en **UTC** dans la base de données (Laravel default)

## Format attendu
Les APIs backend attendent `date_heure` au format **ISO-8601 UTC** :
```
2026-05-21T14:00:00.000Z  // UTC
```

## Exemple frontend

```javascript
function localToUtc(value) {
  // value est 'YYYY-MM-DDTHH:MM' (sans fuseau)
  const date = new Date(value);
  return date.toISOString(); // 'YYYY-MM-DDTHH:MM:SS.000Z'
}

// Avant soumission
const utcValue = localToUtc('2026-05-21T14:00'); 
// Résultat: '2026-05-21T12:00:00.000Z' (si utilisateur en Paris)
```

## Backend Laravel
Le backend utilise `Carbon::parse()` qui gère automatiquement les ISO-8601 :

```php
$dateHeureUtc = Carbon::parse($request->input('date_heure'))->setTimezone('UTC');
```

## Tests
Voir `tests/Feature/TimezoneConversionTest.php` pour des exemples de tests automatisés.
