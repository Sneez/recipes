import { UserButton } from '@clerk/clerk-react';
import { Link } from '@tanstack/react-router';
import { ChefHat, Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCurrentUser } from '@/hooks/use-auth';
import { useDarkMode } from '@/hooks/use-dark-mode';

export function AppNav() {
  const { clerkUser } = useCurrentUser();
  const { isDark, toggle } = useDarkMode();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <ChefHat className="h-6 w-6 text-accent transition-transform group-hover:rotate-12" />
            <span
              className="text-2xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Recipes
            </span>
          </Link>
          <Separator orientation="vertical" className="h-5" />
          <nav className="flex items-center gap-1">
            <Link
              to="/"
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground [&.active]:bg-secondary [&.active]:font-medium [&.active]:text-foreground"
            >
              Browse
            </Link>
            <Link
              to="/my-recipes"
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground [&.active]:bg-secondary [&.active]:font-medium [&.active]:text-foreground"
            >
              My Recipes
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="text-muted-foreground hover:text-foreground"
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          {clerkUser?.firstName && (
            <span className="hidden text-sm text-muted-foreground sm:block">
              {clerkUser.firstName}
            </span>
          )}
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}
