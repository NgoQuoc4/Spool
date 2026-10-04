import '@/App.css';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
