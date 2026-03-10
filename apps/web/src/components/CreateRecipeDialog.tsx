import { RecipeForm } from '@/components/RecipeForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCreateRecipe } from '@/hooks/use-recipes';
import type { CreateRecipeInput } from '@/hooks/use-recipes';
import { useRecipeUiStore } from '@/store/recipe-ui.store';

export function CreateRecipeDialog() {
  const { createDialogOpen, closeDialog } = useRecipeUiStore();
  const createMutation = useCreateRecipe();

  async function handleSubmit(data: CreateRecipeInput) {
    await createMutation.mutateAsync(data);
    closeDialog();
  }

  return (
    <Dialog
      open={createDialogOpen}
      onOpenChange={(open) => !open && closeDialog()}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add a Recipe</DialogTitle>
          <DialogDescription>
            Share a recipe with the community. All fields marked with
            instructions are required.
          </DialogDescription>
        </DialogHeader>
        <RecipeForm
          onSubmit={handleSubmit}
          isPending={createMutation.isPending}
          submitLabel="Publish Recipe"
        />
      </DialogContent>
    </Dialog>
  );
}
