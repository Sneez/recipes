import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { Toaster } from 'sonner';

import { AppNav } from '@/components/AppNav';

export const Route = createRootRoute({
  component: () => (
    <>
      <AppNav />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontFamily: 'var(--font-body)',
            background: 'var(--color-card)',
            color: 'var(--color-foreground)',
            border: '1px solid var(--color-border)',
          },
        }}
      />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  ),
});
