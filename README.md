# Catalogue de skins de jeux vidéo

Mini-application Express / Mongoose avec un front HTML, CSS et JavaScript permettant de gérer un catalogue de skins, des joueurs, leurs achats et leurs inventaires.

## Fonctionnalités

* Affichage du catalogue des skins.
* Création de joueurs avec un solde initial.
* Achat de skins par un joueur.
* Déduction du prix sur le solde du joueur.
* Ajout du skin acheté dans l’inventaire.
* Classement des joueurs par fortune totale.
* Connexion à MongoDB Atlas.

## Technologies utilisées

* Node.js
* Express
* Mongoose
* MongoDB Atlas
* dotenv
* cors
* HTML / CSS / JavaScript

## Installation

Installer les dépendances :

```bash
npm install
```

Créer un fichier `.env` à la racine du projet :

```env
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
MONGO_DB_NAME=game_skins_catalog
PORT=3000
```

Le fichier `.env` ne doit pas être envoyé sur GitHub.

## Lancer l’application

Insérer les skins de démonstration :

```bash
npm run seed
```

Lancer le serveur :

```bash
npm run dev
```

Ouvrir ensuite :

```text
http://localhost:3000
```

## Dépendances utilisées

* `express` : création du serveur et des routes API.
* `mongoose` : gestion des modèles, schémas et requêtes MongoDB.
* `dotenv` : chargement des variables d’environnement.
* `cors` : gestion des autorisations de requêtes.
* `nodemon` : redémarrage automatique du serveur en développement.

## Routes API principales

### Skins

```http
GET /api/skins
```

Renvoie tous les skins du catalogue.

```http
POST /api/skins
```

Crée un nouveau skin.

### Players

```http
GET /api/players
```

Renvoie tous les joueurs avec leur inventaire.

```http
POST /api/players
```

Crée un joueur.

```http
POST /api/players/:id/buy
```

Permet à un joueur d’acheter un skin. La route vérifie le solde, déduit le prix du skin et ajoute le skin dans l’inventaire.

### Analytics

```http
GET /api/analytics/wealth
```

Renvoie le classement des joueurs les plus riches.

## Gestion des models

### Skin

Le modèle `Skin` contient :

* `nom` : nom du skin ;
* `rarete` : rareté du skin ;
* `prix` : prix du skin.

Validations principales :

* le nom est obligatoire ;
* la rareté est limitée à `commun`, `Rare`, `Epique`, `Legendaire` ;
* le prix ne peut pas être négatif.

### Player

Le modèle `Player` contient :

* `pseudo` : pseudo du joueur ;
* `solde` : argent disponible ;
* `inventory` : tableau des skins possédés.

Validations principales :

* le pseudo est obligatoire ;
* le pseudo utilise `trim: true` ;
* le pseudo est unique ;
* le solde ne peut pas être négatif.

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

Chaque élément contient l’identifiant du skin acheté et la date d’obtention.

## Validators de schéma

Les schémas Mongoose utilisent plusieurs validators :

```js
prix: {
  type: Number,
  min: 0
}
```

```js
rarete: {
  type: String,
  enum: ['commun', 'Rare', 'Epique', 'Legendaire']
}
```

```js
pseudo: {
  type: String,
  trim: true,
  unique: true
}
```

Les erreurs de validation sont gérées par un middleware global Express et renvoyées avec un statut `400`.

## Queries sur Mongoose

Exemples de requêtes utilisées :

```js
Skin.find().sort({ prix: 1, nom: 1 });
```

Récupère les skins du catalogue.

```js
Player.find().populate('inventory.skin');
```

Récupère les joueurs avec les informations des skins possédés.

```js
Player.findById(req.params.id);
Skin.findById(skinId);
```

Utilisé dans la route d’achat pour récupérer le joueur et le skin.

```js
player.save();
```

Sauvegarde le joueur après modification du solde et de l’inventaire.

## Aggregate

La route suivante utilise un pipeline d’agrégation :

```http
GET /api/analytics/wealth
```

Le pipeline :

1. utilise `$unwind` pour aplatir l’inventaire ;
2. utilise `$lookup` pour faire la jointure avec la collection `skins` ;
3. utilise `$group` pour regrouper par joueur ;
4. calcule la valeur totale de l’inventaire ;
5. ajoute `fortuneTotale` ;
6. trie les joueurs du plus riche au moins riche.

Pipeline simplifié :

```js
Player.aggregate([
  { $unwind: '$inventory' },
  {
    $lookup: {
      from: 'skins',
      localField: 'inventory.skin',
      foreignField: '_id',
      as: 'skinInfo'
    }
  },
  { $unwind: '$skinInfo' },
  {
    $group: {
      _id: '$_id',
      pseudo: { $first: '$pseudo' },
      solde: { $first: '$solde' },
      valeurInventaire: { $sum: '$skinInfo.prix' }
    }
  },
  {
    $addFields: {
      fortuneTotale: { $add: ['$solde', '$valeurInventaire'] }
    }
  },
  { $sort: { fortuneTotale: -1 } }
]);
```

## Sécurité Atlas

Le projet utilise un fichier `.env` pour stocker la chaîne de connexion MongoDB Atlas.

Le fichier `.env` est ignoré par Git et ne doit pas être publié sur GitHub.

La chaîne de connexion Atlas est transmise au correcteur séparément lors du rendu.

## Checklist avant rendu

* [ ] Le projet démarre avec `npm run dev`.
* [ ] Le catalogue des skins s’affiche.
* [ ] La création de joueur fonctionne.
* [ ] L’achat d’un skin fonctionne.
* [ ] L’inventaire est mis à jour.
* [ ] `/api/analytics/wealth` fonctionne.
* [ ] `.env` n’est pas sur GitHub.
* [ ] L’accès MongoDB Atlas est transmis au correcteur.
