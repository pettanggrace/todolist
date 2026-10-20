# Liste de tâches

Application React construite avec Vite. Elle permet d’ajouter, de terminer, de filtrer et de supprimer des tâches.

## Lancer le projet

```sh
npm install
npm run dev
```

## Héberger sur Netlify

La configuration Netlify est dans `netlify.toml`. Pour publier le site :

1. Poussez le projet sur un dépôt GitHub.
2. Dans Netlify, choisissez **Add new site** puis **Import an existing project** et sélectionnez le dépôt.
3. Lancez le déploiement. Netlify utilisera `npm run build` et publiera le dossier `dist`.

Vous pouvez aussi publier depuis votre ordinateur avec la Netlify CLI après vous être connecté à votre compte :

```sh
npm run build
npx netlify-cli deploy --prod --dir=dist
```

## Stockage

Les tâches sont conservées dans IndexedDB, dans le navigateur utilisé. Elles ne sont pas partagées entre appareils. La liste démarre vide : les anciennes tâches ne sont pas importées et l’entrée correspondante dans `localStorage` est supprimée au chargement.
