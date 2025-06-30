import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { PrivateRoute } from './auth/components/PrivateRoute';

import { AuthLayout } from './auth/layout/AuthLayout';
import { LoginPage } from './auth/pages/LoginPage';
import { RegisterPage } from './auth/pages/RegisterPage';

import { sleep } from './lib/sleep';
import { useQuery } from '@tanstack/react-query';
import { checkAuth } from './fake/fake-data';

// import ChatLayout from './chat/layout/ChatLayout';
// import ChatPage from './chat/pages/ChatPage';
const ChatLayout = lazy(async () => {  //carga perezosa
  await sleep(1500);
  return import('./chat/layout/ChatLayout');
});
const ChatPage = lazy(async () => import('./chat/pages/ChatPage')); //carga perezosa
const NoChatSelectedPage = lazy( //carga perezosa
  async () => import('./chat/pages/NoChatSelectedPage')
);

export const AppRouter = () => {
  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['user'],
    queryFn: () => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      return checkAuth(token);
    },
    retry: 0, //para que no reintente. por defecto hace 3 reintentos si falla
  });

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthLayout />}> {/* LAYAOUT */}
          {/* PAGES: */}
          <Route index element={<LoginPage />} /> {/* RUTA POR DEFECTO */}
          <Route path="/auth/register" element={<RegisterPage />} /> {/* los hijos deben mantener la ruta del padre en este caso /auth */}
          {/* <Route path="login" element={<Login />} /> */}
          {/* <Route path="/auth" element={<Navigate to="/auth/login" />} /> */}
        </Route>

        {/* /chat */}
        <Route
          path="/chat"
          element={
            <Suspense /* carga perezosa */
              fallback={ /* componente temporal mientra que carga el componente que necesistamos */
                <div className="flex h-screen w-full items-center justify-center bg-background">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              }
            >
              <PrivateRoute isAuthenticated={!!user}>
                <ChatLayout />
              </PrivateRoute>
            </Suspense>
          }
        >
          <Route index element={<NoChatSelectedPage />} /> {/* RUTA POR DEFECTO */}
          <Route path="/chat/:clientId" element={<ChatPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/auth" />} />
        <Route path="*" element={<Navigate to="/auth" />} /> {/* CUALQUIER RUTA NO ENCONTRADA CAE EN ESE COMODIN, SE PUEDE REDIRIGIR A UN COMPONENT 404 NOT FOUN D */}
      </Routes>
    </BrowserRouter>
  );
};
