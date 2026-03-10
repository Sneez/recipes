import type { RecipeListQuery } from '@recipes/db/zod';
import { create } from 'zustand';

interface RecipeFilters {
  search: string;
  cuisine: RecipeListQuery['cuisine'];
  difficulty: RecipeListQuery['difficulty'];
}

interface RecipeUiState {
  filters: RecipeFilters;
  setSearch: (search: string) => void;
  setCuisine: (cuisine: RecipeFilters['cuisine']) => void;
  setDifficulty: (difficulty: RecipeFilters['difficulty']) => void;
  resetFilters: () => void;

  // Create/edit dialog
  createDialogOpen: boolean;
  editingRecipeId: string | null;
  openCreateDialog: () => void;
  openEditDialog: (id: string) => void;
  closeDialog: () => void;
}

const defaultFilters: RecipeFilters = {
  search: '',
  cuisine: undefined,
  difficulty: undefined,
};

export const useRecipeUiStore = create<RecipeUiState>((set) => ({
  filters: defaultFilters,
  setSearch: (search) => set((s) => ({ filters: { ...s.filters, search } })),
  setCuisine: (cuisine) => set((s) => ({ filters: { ...s.filters, cuisine } })),
  setDifficulty: (difficulty) =>
    set((s) => ({ filters: { ...s.filters, difficulty } })),
  resetFilters: () => set({ filters: defaultFilters }),

  createDialogOpen: false,
  editingRecipeId: null,
  openCreateDialog: () =>
    set({ createDialogOpen: true, editingRecipeId: null }),
  openEditDialog: (id) => set({ createDialogOpen: false, editingRecipeId: id }),
  closeDialog: () => set({ createDialogOpen: false, editingRecipeId: null }),
}));
