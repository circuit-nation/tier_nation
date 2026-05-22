import { Navigate, createBrowserRouter } from 'react-router-dom';

import { AppLayout } from '@/app/layout';
import { RootRouteErrorBoundary } from '@/app/route-error';
import { AuthCallbackPage } from '@/pages/auth/callback-page';
import { LoginPage } from '@/pages/auth/login-page';
import { HomePage } from '@/pages/home/home-page';
import { ResultsPage } from '@/pages/voting/results-page';
import { VotingPage } from '@/pages/voting/voting-page';
import { VotingRedirectPage } from '@/pages/voting/voting-redirect-page';
// import { RequireAuth } from '@/components/auth/require-auth';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
    errorElement: <RootRouteErrorBoundary />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallbackPage />,
    errorElement: <RootRouteErrorBoundary />,
  },
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <RootRouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'voting',
        element: <VotingRedirectPage />,
      },
      {
        path: 'voting/:listId',
        element: <VotingPage />,
      },
      {
        path: 'results/:id',
        element: <ResultsPage />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
