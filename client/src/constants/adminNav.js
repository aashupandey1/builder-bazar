import { Layers, Tag, Image, Folder, Share2, Users, Shield, Settings, FileText } from 'lucide-react';

export const ADMIN_NAV = [
  {
    group: 'Content',
    items: [
      { label: 'Templates', path: '/admin/templates', icon: Layers },
      { label: 'Categories', path: '/admin/categories', icon: Tag },
      { label: 'Media Library', path: '/admin/media-library', icon: Image },
    ],
  },
  {
    group: 'Projects',
    items: [
      { label: 'Projects', path: '/admin/projects', icon: Folder },
      { label: 'Shared Links', path: '/admin/shared-links', icon: Share2 },
    ],
  },
  {
    group: 'Users',
    items: [
      { label: 'Users', path: '/admin/users', icon: Users },
      { label: 'Roles', path: '/admin/roles', icon: Shield },
    ],
  },
  {
    group: 'Settings',
    items: [
      { label: 'Settings', path: '/admin/settings', icon: Settings },
      { label: 'Logs', path: '/admin/logs', icon: FileText },
    ],
  },
];