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
| Monorepo      | pnpm workspaces + Turborepo              |

## Project Structure

```
.
├── docker-compose.yml          # Local Postgres
├── apps/
│   ├── api/                    # Fastify server
│   │   └── src/
│   │       ├── index.ts        # tsx watch entry
│   │       ├── plugins/clerk.ts
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
│           │   └── ui/         # shadcn/ui primitives
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

### Setup

```bash
# Install from the root (required for workspace:* links)
pnpm install

# Copy env and fill in Clerk keys
cp .env.example .env
```

### Start Postgres

```bash
pnpm docker:up
# or: docker compose up -d
```

### Database migrations

```bash
pnpm db:generate   # generate SQL from Drizzle schema
pnpm db:migrate    # apply to Postgres
```

### Development

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
