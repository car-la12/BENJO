import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App, { AppLayout } from './App.jsx'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'

// Le routeur décrit les URL de l'application; AppLayout garde l'état partagé autour des pages.
const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      // URL racine : écran d'introduction.
      { index: true, element: <App screen="intro" /> },
      // Pages de l'application accessibles par leur chemin.
      { path: 'accueil', element: <App screen="accueil" /> },
      { path: 'auth', element: <App screen="auth" /> },
      { path: 'transition', element: <App screen="transition" /> },
      { path: 'dashboard', element: <App screen="dashboard" /> },
      { path: 'collection', element: <App screen="collection" /> },
      { path: 'rituel', element: <App screen="rituel" /> },
      { path: 'panier', element: <App screen="panier" /> },
      { path: 'infusion', element: <App screen="infusion" /> },
      // Les chemins inconnus reviennent à l'introduction.
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
