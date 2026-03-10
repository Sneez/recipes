/**
 * use-recipes.ts
 *
 * Single file for every recipe query and mutation.
 *
 * Responsibilities:
 *  - Calls the API via useApi() — never fetches directly
 *  - Owns all query key definitions
 *  - Handles cache invalidation after mutations
 *  - Extracts error messages and fires sonner toasts
 *  - Re-exports all types from @recipes/db/zod
 *
 * Data flow:
 *   Drizzle schema → drizzle-zod (@recipes/db/zod) → contract → useApi() → these hooks → components
 */
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApi } from "@/lib/api-context";
import type { RecipeListQuery } from "@recipes/db/zod";

// ── Type re-exports ───────────────────────────────────────────────────────────
// Components import types from this hook file, not from @recipes/db/zod directly.

export type {
  RecipeDto,
  CreateRecipeInput,
  UpdateRecipeInput,
  RecipeListQuery,
} from "@recipes/db/zod";

// ── Query keys ────────────────────────────────────────────────────────────────

export const recipeKeys = {
  all: ["recipes"] as const,
  lists: () => [...recipeKeys.all, "list"] as const,
  list: (filters: Partial<RecipeListQuery>) => [...recipeKeys.lists(), filters] as const,
  details: () => [...recipeKeys.all, "detail"] as const,
  detail: (id: string) => [...recipeKeys.details(), id] as const,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractError(body: unknown): string {
  if (
    body !== null &&
    typeof body === "object" &&
    "message" in body &&
    typeof (body as { message: unknown }).message === "string"
  ) {
    return (body as { message: string }).message;
  }
  return "Something went wrong";
}

// ── Queries ───────────────────────────────────────────────────────────────────

/**
 * Paginated + filtered recipe list.
 * Uses keepPreviousData so search/filter changes don't flash blank.
 */
export function useRecipes(query: Partial<RecipeListQuery> = {}) {
  const api = useApi();

  return useQuery({
    queryKey: recipeKeys.list(query),
    queryFn: async () => {
      const res = await api.recipes.list({ query });
      if (res.status !== 200) throw new Error(extractError(res.body));
      return res.body;
    },
    placeholderData: keepPreviousData,
  });
}

/**
 * Single recipe by ID.
 */
export function useRecipe(id: string | undefined) {
  const api = useApi();

  return useQuery({
    queryKey: recipeKeys.detail(id ?? ""),
    queryFn: async () => {
      const res = await api.recipes.getById({ params: { id: id! } });
      if (res.status === 404) throw new Error("Recipe not found");
      if (res.status !== 200) throw new Error(extractError(res.body));
      return res.body;
    },
    enabled: !!id,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useCreateRecipe() {
  const api = useApi();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: Parameters<typeof api.recipes.create>[0]["body"]) => {
      const res = await api.recipes.create({ body });
      if (res.status !== 201) throw new Error(extractError(res.body));
      return res.body;
    },
    onSuccess: (recipe) => {
      // Invalidate all list queries so any active list refetches
      void qc.invalidateQueries({ queryKey: recipeKeys.lists() });
      toast.success(`"${recipe.title}" added to your cookbook!`);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to create recipe");
    },
  });
}

export function useUpdateRecipe() {
  const api = useApi();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string;
      body: Parameters<typeof api.recipes.update>[0]["body"];
    }) => {
      const res = await api.recipes.update({ params: { id }, body });
      if (res.status !== 200) throw new Error(extractError(res.body));
      return res.body;
    },
    onSuccess: (recipe) => {
      void qc.invalidateQueries({ queryKey: recipeKeys.lists() });
      // Update the detail cache immediately
      qc.setQueryData(recipeKeys.detail(recipe.id), recipe);
      toast.success(`"${recipe.title}" updated!`);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update recipe");
    },
  });
}

export function useDeleteRecipe() {
  const api = useApi();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.recipes.delete({ params: { id } });
      if (res.status !== 200) throw new Error(extractError(res.body));
      return id;
    },
    onSuccess: (id) => {
      void qc.invalidateQueries({ queryKey: recipeKeys.lists() });
      qc.removeQueries({ queryKey: recipeKeys.detail(id) });
      toast.success("Recipe deleted.");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete recipe");
    },
  });
}
