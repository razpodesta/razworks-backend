// apps/web-admin/src/lib/nav-links.ts
/**
 * @fileoverview Configuración de navegación del Panel de Administración.
 * @description Define los ítems del menú lateral.
 */

import {
  LayoutDashboard,
  Users,
  Settings,
  ShieldAlert
} from 'lucide-react';

export type AdminNavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

export const adminNavItems: AdminNavItem[] = [
  {
    label: 'dashboard.welcome_title',
    href: '/',
    icon: LayoutDashboard
  },
  {
    label: 'sidebar.users_freelancers',
    href: '/users',
    icon: Users
  },
  {
    label: 'sidebar.system_settings',
    href: '/settings',
    icon: Settings
  },
  {
    label: 'sidebar.audit_logs',
    href: '/audit',
    icon: ShieldAlert
  }
];
