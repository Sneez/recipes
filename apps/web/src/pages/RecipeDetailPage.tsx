import { useUser } from '@clerk/clerk-react';
import { Link, useParams } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Clock, Loader2, Pencil, Trash2, Users } from 'lucide-react';

import { EditRecipeDialog } from '@/components/EditRecipeDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeleteRecipe, useRecipe } from '@/hooks/use-recipes';
import { formatMinutes } from '@/lib/utils';
import { useRecipeUiStore } from '@/store/recipe-ui.store';

function RecipeDetailSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Skeleton className="h-5 w-28" />
      <Skeleton className="w-full aspect-video rounded-xl" />
      <div className="space-y-3">
        <Skeleton className="h-10 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <Separator />
      <div className="space-y-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export function RecipeDetailPage() {
  const { id } = useParams({ from: '/recipes/$id' });
  const { user } = useUser();
  const navigate = useNavigate();
  const { openEditDialog } = useRecipeUiStore();

  const { data: recipe, isLoading } = useRecipe(id);
  const deleteMutation = useDeleteRecipe();

  if (isLoading) return <RecipeDetailSkeleton />;

  if (!recipe) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back
          </Link>
        </Button>
        <p className="text-muted-foreground">Recipe not found.</p>
      </div>
    );
  }

  const isAuthor = user?.id === recipe.authorId;
  const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;

  async function handleDelete() {
    if (!confirm(`Delete "${recipe!.title}"? This cannot be undone.`)) return;
    await deleteMutation.mutateAsync(recipe!.id);
    navigate({ to: '/' });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Back */}
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          All Recipes
        </Link>
      </Button>

      {/* Hero image */}
      {recipe.imageUrl && (
        <div className="w-full aspect-video rounded-xl overflow-hidden">
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <h1
            className="text-4xl font-bold leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {recipe.title}
          </h1>
          {isAuthor && (
            <div className="flex shrink-0 gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openEditDialog(recipe.id)}
                title="Edit recipe"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                title="Delete recipe"
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Meta badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={recipe.difficulty as 'easy' | 'medium' | 'hard'}
            className="capitalize"
          >
            {recipe.difficulty}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {recipe.cuisine}
          </Badge>
          {totalTime > 0 && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {formatMinutes(totalTime)} total
            </span>
          )}
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            {recipe.servings} servings
          </span>
        </div>

        <p className="text-muted-foreground leading-relaxed">
          {recipe.description}
        </p>
      </div>

      <Separator />

      {/* Ingredients */}
      {recipe.ingredients.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold">Ingredients</h2>
          <ul className="space-y-1.5">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {ing}
              </li>
            ))}
          </ul>
        </section>
      )}

      <Separator />

      {/* Instructions */}
      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">Instructions</h2>
        <div className="prose-sm leading-relaxed text-foreground space-y-3">
          {recipe.instructions
            .split('\n')
            .filter(Boolean)
            .map((para, i) => (
              <p key={i}>{para}</p>
            ))}
        </div>
      </section>

      {/* Time breakdown */}
      {(recipe.prepTimeMinutes > 0 || recipe.cookTimeMinutes > 0) && (
        <>
          <Separator />
          <div className="flex gap-8 text-sm">
            {recipe.prepTimeMinutes > 0 && (
              <div>
                <p className="font-medium">Prep time</p>
                <p className="text-muted-foreground">
                  {formatMinutes(recipe.prepTimeMinutes)}
                </p>
              </div>
            )}
            {recipe.cookTimeMinutes > 0 && (
              <div>
                <p className="font-medium">Cook time</p>
                <p className="text-muted-foreground">
                  {formatMinutes(recipe.cookTimeMinutes)}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      <EditRecipeDialog />
    </div>
  );
}
