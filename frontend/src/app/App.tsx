import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { ToastProvider } from './context/ToastContext';
import { GlobalToastContainer } from './components/common/GlobalToastContainer';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ToastProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" />
          <GlobalToastContainer />
        </ToastProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;