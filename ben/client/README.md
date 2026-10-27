## Authentification

Les formulaires de connexion et d’inscription utilisent les routes `/api/auth/login` et `/api/auth/register` du serveur Express.

En développement, démarrez le serveur avec `npm run dev` dans `server/`; Vite transmet alors `/api` à `http://localhost:5000`.

Pour le déploiement, configurez `VITE_API_URL` dans l’environnement de build Vercel avec l’origine du serveur Express (par exemple `https://api.example.com`, sans `/api` final). Sans cette variable, le client envoie les requêtes à `/api` sur la même origine.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
