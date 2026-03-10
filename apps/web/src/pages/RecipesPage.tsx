import { useState } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { CreateRecipeDialog } from '@/components/CreateRecipeDialog';
import { EditRecipeDialog } from '@/components/EditRecipeDialog';
import { RecipeCard, RecipeCardSkeleton } from '@/components/RecipeCard';
import { RecipeFilters } from '@/components/RecipeFilters';
import { Button } from '@/components/ui/button';
import { useRecipes } from '@/hooks/use-recipes';
import { useRecipeUiStore } from '@/store/recipe-ui.store';

export function RecipesPage() {
  const [page, setPage] = useState(1);
  const { filters } = useRecipeUiStore();

  const { data, isLoading, isFetching } = useRecipes({
    page,
    limit: 12,
    search: filters.search || undefined,
    cuisine: filters.cuisine,
    difficulty: filters.difficulty,
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
      <RecipeFilters />

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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Dialogs — rendered here so they're always mounted when store opens them */}
      <CreateRecipeDialog />
      <EditRecipeDialog />
    </div>
  );
}
