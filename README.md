# Catalogue de skins de jeux vidéo

Mini-application Express + Mongoose + HTML/JS permettant de gérer :

- un catalogue de skins ;
- des joueurs avec solde ;
- un inventaire sous forme de sous-documents ;
- une route métier d’achat ;
- un dashboard d’analytics basé sur un pipeline d’agrégation MongoDB.

## Stack

- Node.js
- Express
- MongoDB Atlas
- Mongoose
- HTML / CSS / JavaScript avec `fetch`

## Installation

```bash
npm install
```

Créer un fichier `.env` à la racine du projet :

```bash
cp .env.example .env
```

Puis remplacer `MONGO_URI` par la chaîne de connexion MongoDB Atlas.

Exemple :

```env
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
MONGO_DB_NAME=game_skins_catalog
PORT=3000
```

Important : le fichier `.env` ne doit pas être envoyé sur GitHub.

## Lancer le projet

Insérer des skins de démonstration :

```bash
npm run seed
```

Lancer le serveur :

```bash
npm run dev
```

Puis ouvrir :

```text
http://localhost:3000
```

## Routes API

### Skins

```http
GET /api/skins
```

Renvoie tous les skins du catalogue.

```http
POST /api/skins
Content-Type: application/json

{
  "nom": "Dragon Rouge",
  "rarete": "Legendaire",
  "prix": 950
}
```

Crée un skin.

### Players

```http
GET /api/players
```

Renvoie tous les joueurs avec leur inventaire peuplé.

```http
POST /api/players
Content-Type: application/json

{
  "pseudo": "amine",
  "solde": 1500
}
```

Crée un joueur.

```http
POST /api/players/:id/buy
Content-Type: application/json

{
  "skinId": "ID_DU_SKIN"
}
```

Permet à un joueur d’acheter un skin. La route vérifie le solde, déduit le prix du skin et ajoute un sous-document dans `inventory`.

### Analytics

```http
GET /api/analytics/wealth
```

Renvoie le classement des joueurs les plus riches.

## Gestion des models

### Skin

Le modèle `Skin` contient :

- `nom` : chaîne obligatoire, nettoyée avec `trim` ;
- `rarete` : chaîne obligatoire, limitée par enum ;
- `prix` : nombre obligatoire avec minimum `0`.

Des index sont ajoutés sur `rarete` et `prix` pour faciliter l’audit et les recherches.

### Player

Le modèle `Player` contient :

- `pseudo` : chaîne obligatoire, unique, nettoyée avec `trim` ;
- `solde` : nombre obligatoire avec minimum `0` ;
- `inventory` : tableau de sous-documents.

## Gestion des sous-documents

L’inventaire du joueur est un tableau de sous-documents :

```js
inventory: [
  {
    skin: ObjectId,
    obtainedAt: Date
  }
]
```

Chaque item référence un skin via son `ObjectId` et stocke la date d’obtention.

## Validators de schéma

Validations implémentées :

- le prix d’un skin ne peut pas être négatif ;
- la rareté est limitée à `commun`, `Rare`, `Epique`, `Legendaire` ;
- le pseudo du joueur utilise `trim: true` ;
- le solde ne peut pas être négatif ;
- le pseudo est unique.

Les erreurs Mongoose sont centralisées dans le middleware global `errorHandler` et renvoyées au format JSON avec un statut `400`.

## Queries Mongoose

Exemples utilisés dans le projet :

- `Skin.find().sort(...)` pour lister le catalogue ;
- `Player.find().populate(...)` pour afficher les inventaires ;
- `Player.findById(...)` et `Skin.findById(...)` dans la route d’achat ;
- `Player.aggregate(...)` pour le classement de fortune.

## Aggregate

La route `/api/analytics/wealth` utilise un pipeline d’agrégation :

1. `$unwind` sur `inventory` pour aplatir les skins possédés ;
2. `$lookup` avec la collection `skins` pour récupérer la valeur de chaque skin ;
3. second `$unwind` sur le résultat de la jointure ;
4. `$group` par joueur pour calculer la valeur totale de l’inventaire ;
5. `$addFields` pour calculer la fortune totale ;
6. `$sort` pour obtenir le classement.

## Choix de transmission Atlas

Choix recommandé : Option C.

- Le projet utilise `.env` localement.
- Le fichier `.env` n’est pas versionné.
- La chaîne MongoDB Atlas doit être envoyée au correcteur par message privé Teams lors du rendu.

Créer idéalement un utilisateur MongoDB Atlas dédié à ce projet avec accès `readWrite` uniquement sur la base `game_skins_catalog`.

## Checklist avant rendu

- [ ] Le projet démarre avec `npm run dev`.
- [ ] Le fichier `.env` existe localement.
- [ ] Le fichier `.env` n’est pas sur GitHub.
- [ ] `npm run seed` ajoute les skins de démonstration.
- [ ] `GET /api/skins` fonctionne.
- [ ] `POST /api/players` fonctionne.
- [ ] Le bouton acheter fonctionne sur le front.
- [ ] Le classement `/api/analytics/wealth` s’affiche sur le front.
- [ ] Le lien GitHub est fourni.
- [ ] La chaîne MongoDB Atlas est envoyée au correcteur via Teams.
