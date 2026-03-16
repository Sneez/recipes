import { useEffect, useRef, useState } from 'react';

import { CreateRecipeDialog } from '@/components/CreateRecipeDialog';
import { EditRecipeDialog } from '@/components/EditRecipeDialog';
import { Pagination } from '@/components/Pagination';
import { RecipeCard, RecipeCardSkeleton } from '@/components/RecipeCard';
import { RecipeFilters } from '@/components/RecipeFilters';
import { useCurrentUserId } from '@/hooks/use-auth';
import { useRecipes } from '@/hooks/use-recipes';
import { useRecipeUiStore } from '@/store/recipe-ui.store';

export function RecipesPage() {
  const [page, setPage] = useState(1);
  const { filters } = useRecipeUiStore();
  const { userId } = useCurrentUserId();

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const { data, isLoading, isFetching } = useRecipes({
    page,
    limit: 12,
    search: filters.search || undefined,
    searchMode: filters.searchMode,
    cuisine: filters.cuisine,
    difficulty: filters.difficulty,
    ...(filters.excludeMine && userId ? { excludeAuthorId: userId } : {}),
  });

  const recipes = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1
          className="text-4xl font-bold tracking-tight text-foreground"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          The Cookbook
        </h1>
        <p className="mt-1 text-muted-foreground">
          {isLoading ? 'Loading…' : `${total} recipe${total !== 1 ? 's' : ''}`}
          {isFetching && !isLoading && (
            <span className="ml-2 text-xs text-muted-foreground/60 italic">
              Updating…
            </span>
          )}
        </p>
      </div>

      {/* Filters */}
      <RecipeFilters showExcludeMine />

      {/* Grid — skeletons while loading */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 12 }).map((_, i) => (
            <RecipeCardSkeleton key={i} />
          ))
        ) : recipes.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-20 text-center">
            <p className="font-display text-xl font-semibold">
              No recipes found
            </p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or add a new recipe.
            </p>
          </div>
        ) : (
          recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Dialogs — rendered here so they're always mounted when store opens them */}
      <CreateRecipeDialog />
      <EditRecipeDialog />
    </div>
  );
}
