import { useCallback, useEffect, useState } from 'react';

import { LogOut, Menu, Moon, Sun, UserCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from '@/i18n';
import { type Theme, getStoredTheme, setTheme } from '@/lib/theme';
import { useAuthStore } from '@/stores/auth.store';
import { type Currency, usePreferencesStore } from '@/stores/preferences.store';

type HeaderProps = {
  onMenuClick: () => void;
};

export function Header({ onMenuClick }: HeaderProps) {
  const { logout } = useAuth();
  const user = useAuthStore((s) => s.user);
  const [theme, setCurrentTheme] = useState<Theme>(getStoredTheme);
  const { t } = useTranslation();
  const { language, currency, setLanguage, setCurrency } = usePreferencesStore();

  const toggleTheme = useCallback(() => {
    // Read applied class to handle 'system' mode correctly
    const currentlyDark = document.documentElement.classList.contains('dark');
    const next: Theme = currentlyDark ? 'light' : 'dark';
    setTheme(next);
    setCurrentTheme(next);
  }, []);

  // Sync icon when OS dark mode changes while in 'system' mode
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setCurrentTheme(getStoredTheme());
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">{t('header.openMenu')}</span>
      </Button>

      <div className="flex-1" />

      <Button variant="ghost" size="icon" onClick={toggleTheme}>
        {/* Check applied class for correct icon in 'system' mode */}
        {theme === 'dark' ||
        (theme === 'system' &&
          typeof document !== 'undefined' &&
          document.documentElement.classList.contains('dark')) ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
        <span className="sr-only">{t('header.toggleTheme')}</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <UserCircle aria-hidden="true" className="h-5 w-5 sm:hidden" />
            <span className="hidden sm:inline-block">{user?.name}</span>
            <span className="sr-only sm:hidden">{t('header.userMenu')}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            {t('header.currency')}
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={currency}
            onValueChange={(v) => setCurrency(v as Currency)}
          >
            <DropdownMenuRadioItem value="RUB">₽ RUB</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="USD">$ USD</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="EUR">€ EUR</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>

          <DropdownMenuSeparator />

          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            {t('header.language')}
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={language}
            onValueChange={(v) => setLanguage(v as 'ru' | 'en')}
          >
            <DropdownMenuRadioItem value="ru">Русский</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => logout()}>
            <LogOut aria-hidden="true" className="mr-2 h-4 w-4" />
            {t('header.logout')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
