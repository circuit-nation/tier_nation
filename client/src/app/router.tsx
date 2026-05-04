import { Navigate, createBrowserRouter } from 'react-router-dom';

import { AppLayout } from '@/app/layout';
import { RootRouteErrorBoundary } from '@/app/route-error';
import { LIVE_LIST_ID } from '@/lib/constants';
import { AuthCallbackPage } from '@/pages/auth/callback-page';
import { LoginPage } from '@/pages/auth/login-page';
import { HomePage } from '@/pages/home/home-page';
import { VotingPage } from '@/pages/voting/voting-page';
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
        element: <Navigate to={`/voting/${LIVE_LIST_ID}`} replace />,
      },
      {
        path: 'voting/:listId',
        element: <VotingPage />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
