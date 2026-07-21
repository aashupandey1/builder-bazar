import { Routes, Route, Navigate } from 'react-router-dom';
import Splash from '../pages/Splash';
import OAuthSuccess from '../pages/OAuthSuccess';
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
import AdminRoutes from './AdminRoutes';
import AdminDashboard from '../pages/Admin/AdminDashboard';
import AdminTemplates from '../pages/Admin/AdminTemplates';
import AdminProjects from '../pages/Admin/AdminProjects';
import AdminAddNew from '../pages/Admin/AdminAddNew';
import AdminLayout from '../pages/Admin/AdminLayout';
import ComingSoon from '../pages/Admin/ComingSoon';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/oauth-success" element={<OAuthSuccess />} />
      
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
        <Route element={<AdminRoutes />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="templates" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="templates" element={<AdminTemplates />} />
            <Route path="categories" element={<ComingSoon title="Categories" />} />
            <Route path="media-library" element={<ComingSoon title="Media Library" />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="add-new" element={<AdminAddNew />} />
            <Route path="shared-links" element={<ComingSoon title="Shared Links" />} />
            <Route path="users" element={<ComingSoon title="Users" />} />
            <Route path="roles" element={<ComingSoon title="Roles" />} />
            <Route path="settings" element={<ComingSoon title="Settings" />} />
            <Route path="logs" element={<ComingSoon title="Logs" />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}