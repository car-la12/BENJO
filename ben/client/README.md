# BENDJO

## Catalogue et CMS

Le catalogue des produits est stocké dans PostgreSQL. Au démarrage, le serveur crée la table `products` si nécessaire et insère les produits initiaux sans écraser les fiches déjà modifiées. Les produits publiés sont servis par `GET /api/products`; l’administration permet de créer, modifier et publier/désactiver les fiches.

### Configuration du serveur

Dans `ben/server`, copiez `.env.example` vers `.env`, puis renseignez :

- `DATABASE_URL` : URL de connexion PostgreSQL fournie par votre hébergeur.
- `JWT_SECRET` : clé aléatoire d’au moins 32 caractères.
- `CMS_ADMIN_EMAIL` : adresse de connexion de l’administrateur.
- `CMS_ADMIN_PASSWORD_HASH` : mot de passe haché avec bcrypt (coût 12 ou plus). Vous pouvez le générer localement avec `node --input-type=module -e 'import bcrypt from "bcryptjs"; console.log(await bcrypt.hash(process.argv[1], 12))' 'REMPLACER_PAR_UN_MOT_DE_PASSE'`, puis remplacer le texte entre apostrophes par le mot de passe choisi. Ne publiez ni le mot de passe ni le hachage.

Lancez l’API avec `npm run dev` dans `ben/server`. Le schéma et les données de départ sont initialisés automatiquement; les données modifiées ensuite sont conservées dans PostgreSQL.

### Administration

Ouvrez `/admin` sur le site, puis connectez-vous avec les paramètres CMS configurés. L’écran permet de créer et modifier les fiches (nom, type, description, prix, prix barré, image et préparation), et de les publier ou désactiver. Les images acceptées sont les quatre images intégrées au site ou une URL HTTPS.

Chaque fiche comporte une déclinaison unique avec son nom et son SKU. Le suivi de stock est facultatif; lorsqu’il est désactivé, le produit est considéré comme disponible sans limite. Les champs logistiques enregistrent le poids d’expédition en grammes, les dimensions du colis en millimètres et les consignes de préparation.

Le coffret « Moment » est initialisé comme « Pack de 6 infusions + pot de miel », SKU `BENDJO-MOMENT-6-MIEL`, à stock illimité. Son poids et ses dimensions restent à compléter dans `/admin` à partir des mesures réelles du colis. Le schéma applique automatiquement les nouvelles colonnes à une base existante au redémarrage du serveur.

### Client

Lancez `npm run dev` dans `ben/client`. En développement, Vite transmet `/api` à `http://localhost:5000`. Pour un hébergement où le client et l’API ont des origines distinctes, définissez `VITE_API_URL` dans l’environnement de build du client avec l’origine de l’API, sans `/api` final.

L’authentification des clients existante reste distincte et stockée en mémoire; seul le catalogue produits est persisté en PostgreSQL dans cette première version.
