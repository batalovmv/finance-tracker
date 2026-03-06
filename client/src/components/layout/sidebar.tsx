import { BarChart3, CreditCard, LayoutDashboard } from 'lucide-react';
import { NavLink } from 'react-router';

import { useTranslation } from '@/i18n';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const { t } = useTranslation();

  const navItems = [
    { to: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/transactions', label: t('nav.transactions'), icon: CreditCard },
    { to: '/statistics', label: t('nav.statistics'), icon: BarChart3 },
  ] as const;

  return (
    <aside className="hidden w-64 border-r bg-sidebar lg:block">
      <div className="flex h-14 items-center border-b px-6">
        <h1 className="text-lg font-semibold text-sidebar-foreground">{t('nav.appName')}</h1>
      </div>
      <nav className="space-y-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
              )
            }
          >
            <item.icon aria-hidden="true" className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
