# Recipes

A full-stack TypeScript monorepo for a recipe management app.

## Stack

| Layer         | Technology                               |
| ------------- | ---------------------------------------- |
| Frontend      | React 18 + TypeScript + Vite 6           |
| Routing       | TanStack Router (file-based)             |
| Server state  | TanStack Query v5                        |
| Forms         | React Hook Form + Zod                    |
| UI state      | Zustand                                  |
| Styling       | Tailwind CSS v4 + shadcn/ui              |
| Toasts        | Sonner                                   |
| Backend       | Fastify 4 + TypeScript (`tsx watch`)     |
| API contracts | ts-rest (shared package)                 |
| ORM           | Drizzle ORM                              |
| Zod schemas   | drizzle-zod (auto-generated from schema) |
| Database      | PostgreSQL (Docker)                      |
| Auth          | Clerk                                    |
| File uploads  | UploadThing                              |
| Monorepo      | pnpm workspaces + Turborepo              |

## Project Structure

```
.
├── docker-compose.yml          # Local Postgres
├── apps/
│   ├── api/                    # Fastify server
│   │   └── src/
│   │       ├── index.ts        # tsx watch entry
│   │       ├── plugins/
│   │       │   ├── clerk.ts
│   │       │   └── uploadthing.ts
│   │       └── routes/
│   │           ├── users.ts
│   │           └── recipes.ts
│   └── web/                    # React + Vite
│       └── src/
│           ├── routes/         # TanStack Router file-based routes
│           │   ├── __root.tsx
│           │   ├── index.tsx
│           │   └── recipes.$id.tsx
│           ├── pages/          # Page components (one per route)
│           ├── components/
│           │   ├── ImageUpload.tsx  ← UploadThing upload widget
│           │   └── ui/             # shadcn/ui primitives
│           ├── hooks/
│           │   ├── use-recipes.ts   ← all recipe data logic
│           │   └── use-auth.ts      ← all auth hooks
│           ├── store/
│           │   └── recipe-ui.store.ts  ← Zustand UI state
│           └── lib/
│               ├── api-client.ts    ← ts-rest client factory
│               └── api-context.tsx  ← React Context + useApi()
└── packages/
    ├── db/                     # Drizzle schema + client
    │   └── src/
    │       ├── schema/         # The source of truth
    │       │   ├── users.ts
    │       │   └── recipes.ts
    │       └── zod.ts          # drizzle-zod schemas (generated from schema)
    └── contracts/              # ts-rest contract (imports from db/zod)
```

## Data Flow

```
Drizzle schema
  └─► drizzle-zod  (@recipes/db/zod)
        └─► ts-rest contract  (@recipes/contracts)
              └─► useApi() context
                    └─► use-recipes.ts / use-auth.ts hooks
                          └─► components
```

**The database schema is the single source of truth.** No Zod schemas are
hand-written for entities that exist in the database. All types flow downward:
`drizzle-zod` generates them, `@recipes/contracts` imports them, hooks re-export
them, components import from hooks.

## Getting Started

### Prerequisites

- Node.js ≥ 20, pnpm ≥ 9, Docker

### 1. Install dependencies

```bash
# Install from the root (required for workspace:* links)
pnpm install
```

### 2. Set up Clerk

1. Create an account at [clerk.com](https://clerk.com) and create a new application
2. From the Clerk dashboard, copy your **Publishable Key** and **Secret Key**

### 3. Set up UploadThing

1. Create an account at [uploadthing.com](https://uploadthing.com) and create a new app
2. From the UploadThing dashboard, go to **API Keys** and copy your **Token**

### 4. Configure environment variables

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

**`apps/api/.env`:**

```bash
DATABASE_URL="postgresql://recipes:recipes@localhost:5432/recipes"

# Clerk — from dashboard.clerk.com → API Keys
CLERK_SECRET_KEY="sk_test_..."
CLERK_PUBLISHABLE_KEY="pk_test_..."

# UploadThing — from uploadthing.com → your app → API Keys
UPLOADTHING_TOKEN="eyJhcGlLZXkiOi..."

API_PORT=3000
API_HOST=0.0.0.0
WEB_URL=http://localhost:5173
```

**`apps/web/.env`:**

```bash
# Same value as CLERK_PUBLISHABLE_KEY above — must be VITE_ prefixed for the browser
VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."
VITE_API_URL="http://localhost:3000"
```

### 5. Start Postgres

```bash
pnpm docker:up
# or: docker compose up -d
```

### 6. Run database migrations

```bash
pnpm db:generate   # generate SQL from Drizzle schema
pnpm db:migrate    # apply to Postgres
pnpm db:seed       # optional: populate with 12 dummy recipes
```

### 7. Start development servers

```bash
pnpm dev
# API → http://localhost:3000  (tsx watch, auto-restarts on save)
# Web → http://localhost:5173
```

## Key Patterns

### Hook responsibilities (`src/hooks/`)

Each hook file owns everything for its entity:

```ts
// ✅ use-recipes.ts handles:
export const recipeKeys = { ... }          // query key factory
export function useRecipes(query) { ... }  // list query w/ keepPreviousData
export function useRecipe(id) { ... }      // detail query
export function useCreateRecipe() { ... }  // mutation + cache invalidation + toast
export type { RecipeDto, CreateRecipeInput } from "@recipes/db/zod"; // type re-exports
```

Components never call `useApi()` or `useQueryClient()` directly.

### API client context

```tsx
// Wrap once at app root
<ApiProvider>
  <App />
</ApiProvider>;

// Consume in hooks only — never in components
const api = useApi();
```

### UI state with Zustand

```ts
// Filter state + dialog control live in the store
const { filters, openCreateDialog, setCuisine } = useRecipeUiStore();
```

### Adding a new resource

1. Add a Drizzle table in `packages/db/src/schema/`
2. Export Zod schemas from `packages/db/src/zod.ts` using `createSelectSchema` / `createInsertSchema`
3. Add the route to `packages/contracts/src/contract.ts` (import schemas from step 2)
4. Add route handler in `apps/api/src/routes/`
5. Create `apps/web/src/hooks/use-<entity>.ts` following the pattern above
6. Build pages and components that import types exclusively from the hook file
