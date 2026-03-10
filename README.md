# My App

A full-stack TypeScript monorepo: **Fastify** · **React** · **Tailwind CSS v4** · **shadcn/ui** · **Drizzle ORM** · **CockroachDB** · **ts-rest** · **Clerk** · **Zod** · **Turborepo**

## Stack

| Layer         | Technology                                        |
| ------------- | ------------------------------------------------- |
| Frontend      | React 18 + TypeScript + Vite 6                    |
| Styling       | Tailwind CSS v4 (`@tailwindcss/vite`) + shadcn/ui |
| Backend       | Fastify 4 + TypeScript                            |
| API Contracts | ts-rest + Zod (shared package)                    |
| ORM           | Drizzle ORM                                       |
| Database      | CockroachDB (PostgreSQL wire protocol)            |
| Auth          | Clerk                                             |
| Monorepo      | pnpm workspaces + Turborepo                       |

## Project Structure

```
.
├── apps/
│   ├── api/                  # Fastify API server
│   │   └── src/
│   │       ├── index.ts      # App entry point
│   │       ├── plugins/
│   │       │   └── clerk.ts  # Clerk JWT verification
│   │       └── routes/
│   │           ├── users.ts  # /api/users/* handlers
│   │           └── posts.ts  # /api/posts/* handlers
│   └── web/                  # React + Vite frontend
│       ├── components.json   # shadcn/ui config
│       └── src/
│           ├── components/
│           │   ├── ui/       # shadcn/ui primitives
│           │   ├── Layout.tsx
│           │   └── CreatePostDialog.tsx
│           ├── hooks/
│           │   └── useClerkApiAuth.ts
│           ├── lib/
│           │   ├── api-client.ts  # ts-rest + React Query client
│           │   └── utils.ts       # cn() helper
│           ├── pages/
│           │   ├── HomePage.tsx
│           │   ├── PostsPage.tsx
│           │   └── PostDetailPage.tsx
│           └── globals.css   # Tailwind v4 + CSS variable theme
└── packages/
    ├── contracts/            # ts-rest contracts + Zod schemas
    └── db/                   # Drizzle schema + CockroachDB client
```

## Getting Started

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9
- A [CockroachDB](https://cockroachlabs.com) cluster (serverless free tier works)
- A [Clerk](https://clerk.com) application

### Setup

```bash
pnpm install
cp .env.example .env
```

Fill in `.env`:

```env
DATABASE_URL="postgresql://<user>:<password>@<host>:26257/<db>?sslmode=verify-full"
CLERK_SECRET_KEY="sk_test_..."
VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."
```

### Database

```bash
pnpm db:generate   # generate SQL migrations from Drizzle schema
pnpm db:migrate    # apply migrations to CockroachDB
pnpm db:studio     # open Drizzle Studio (optional)
```

### Development

```bash
pnpm dev
```

- **API** → http://localhost:3000
- **Web** → http://localhost:5173

### Build

```bash
pnpm build
```

## Tailwind CSS v4

This project uses **Tailwind v4** which ships as a Vite plugin — no `tailwind.config.ts` is needed.

```ts
// vite.config.ts
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({ plugins: [react(), tailwindcss()] });
```

The theme (colors, border-radius, etc.) is defined entirely via CSS variables in `src/globals.css`:

```css
@import 'tailwindcss';

@layer base {
  :root {
    --background: 0 0% 100%;
    --primary: 220.9 39.3% 11%;
    /* ... */
  }
}
```

## Adding shadcn/ui Components

`components.json` is already configured. To add more components:

```bash
cd apps/web
pnpx shadcn@latest add <component>
# e.g. pnpx shadcn@latest add toast
# e.g. pnpx shadcn@latest add table
```

Components are placed in `src/components/ui/` and exported from the `index.ts` barrel.

## Key Patterns

### End-to-end type safety (ts-rest)

The `@my-app/contracts` package is imported by both the Fastify server and the React client. A change to a route's schema instantly produces type errors on both sides:

```ts
// ✅ API — fully typed request + response
s.router(contract.posts, {
  create: async ({ body }) => {
    // body: { title: string, content: string }
    return { status: 201, body: newPost };
  },
});

// ✅ Client — fully typed query hook
const { data } = apiClient.posts.list.useQuery(['posts'], {
  query: { page: 1, limit: 10 },
});
// data.body → { items: Post[], totalPages: number, ... }
```

### Auth (Clerk)

Every Fastify route reads the Clerk JWT from `Authorization: Bearer <token>`. Use `requireAuth()` to guard a route:

```ts
const auth = requireAuth(request, reply);
if (!auth) return; // 401 already sent
// auth.userId is the Clerk user ID
```

On the frontend, `useClerkApiAuth()` in `Layout` automatically injects the session token into every `apiClient` call.

### Adding a new resource

1. **Schema** — add a Drizzle table in `packages/db/src/schema/`
2. **Zod schemas** — add input/output shapes in `packages/contracts/src/schemas.ts`
3. **Contract** — add routes to `packages/contracts/src/contract.ts`
4. **Route handler** — add a ts-rest router in `apps/api/src/routes/`
5. **UI** — consume via `apiClient` in `apps/web/src/`
