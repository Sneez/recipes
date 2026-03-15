import { CreateRecipeDialog } from '@/components/CreateRecipeDialog';
import { EditRecipeDialog } from '@/components/EditRecipeDialog';
import { RecipeCard, RecipeCardSkeleton } from '@/components/RecipeCard';
import { RecipeFilters } from '@/components/RecipeFilters';
import { useMyRecipes } from '@/hooks/use-recipes';
import { useRecipeUiStore } from '@/store/recipe-ui.store';

export function MyRecipesPage() {
  const { filters } = useRecipeUiStore();
  const { data, isLoading } = useMyRecipes(filters);

  const recipes = data?.items ?? [];
  const isEmpty = !isLoading && recipes.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-3xl font-bold"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          My Recipes
        </h1>
        <p className="text-muted-foreground mt-1">Recipes you've created</p>
      </div>

      <RecipeFilters />

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
      )}

      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-muted-foreground text-lg">
            You haven't created any recipes yet.
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            Click{' '}
            <span className="font-medium text-foreground">+ New Recipe</span> to
            get started.
          </p>
        </div>
      )}

      {!isLoading && recipes.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}

      <CreateRecipeDialog />
      <EditRecipeDialog />
    </div>
  );
}
