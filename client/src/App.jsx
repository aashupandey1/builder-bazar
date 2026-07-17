import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MediaProvider } from './context/MediaContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      {/* AuthProvider mounted above everything so useAuth() (Private/PublicRoutes,
          any page checking login state) has a real context and the /auth/me
          check runs once on load. */}
      <AuthProvider>
        {/* Mounted above the routes so uploaded media (background, logo, any
            future slot) survives navigation between Editor and LivePreview,
            which are sibling routes with no shared parent of their own. */}
        <MediaProvider>
          <AppRoutes />
        </MediaProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}