import { RecipeForm } from '@/components/RecipeForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useRecipe, useUpdateRecipe } from '@/hooks/use-recipes';
import type { CreateRecipeInput } from '@/hooks/use-recipes';
import { useRecipeUiStore } from '@/store/recipe-ui.store';

export function EditRecipeDialog() {
  const { editingRecipeId, closeDialog } = useRecipeUiStore();
  const { data: recipe, isLoading } = useRecipe(editingRecipeId ?? undefined);
  const updateMutation = useUpdateRecipe();

  async function handleSubmit(data: CreateRecipeInput) {
    if (!editingRecipeId) return;
    await updateMutation.mutateAsync({ id: editingRecipeId, body: data });
    closeDialog();
  }

  return (
    <Dialog
      open={!!editingRecipeId}
      onOpenChange={(open) => !open && closeDialog()}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Recipe</DialogTitle>
          <DialogDescription>
            Update the details of your recipe.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="space-y-4 py-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : recipe ? (
          <RecipeForm
            defaultValues={recipe}
            onSubmit={handleSubmit}
            isPending={updateMutation.isPending}
            submitLabel="Update Recipe"
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
