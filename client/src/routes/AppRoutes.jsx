import { Routes, Route } from 'react-router-dom';
import Splash from '../pages/Splash';
import SignIn from '../pages/Auth/SignIn';
import Dashboard from '../pages/Dashboard';
import Projects from '../pages/Projects';
import Gallery from '../pages/Gallery';
import Preview from '../pages/Preview';
import Upload from '../pages/Upload';
import LivePreview from '../pages/LivePreview';
import Downloads from '../pages/Downloads';
import ShareModal from '../components/share/ShareModal';
import ShareSuccess from '../pages/ShareSuccess';
import MyStudio from '../pages/MyStudio';
import Profile from '../pages/Profile';
import Notifications from '../pages/Notifications';
import PrivateRoutes from './PrivateRoutes';
import PublicRoutes from './PublicRoutes';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />

      {/* Logged-in users get bounced to /dashboard if they hit these */}
      <Route element={<PublicRoutes />}>
        <Route path="/login" element={<SignIn />} />
        <Route path="/register" element={<SignIn />} />
      </Route>

      {/* Logged-out users get bounced to /login for everything below */}
      <Route element={<PrivateRoutes />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/preview" element={<Preview />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/live-preview" element={<LivePreview />} />
        <Route path="/download" element={<Downloads />} />
        <Route path="/share" element={<ShareModal />} />
        <Route path="/share-success" element={<ShareSuccess />} />
        <Route path="/my-studio" element={<MyStudio />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />
      </Route>
    </Routes>
  );
}