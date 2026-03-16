import { useEffect, useState } from 'react';

import { cuisineEnum, difficultyEnum } from '@recipes/db/enums';
import { TextSearch, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRecipeUiStore } from '@/store/recipe-ui.store';

// Debounce search input to avoid a query per keystroke
function useDebounce<T>(value: T, ms = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

interface RecipeFiltersProps {
  showExcludeMine?: boolean;
}

export function RecipeFilters({ showExcludeMine = false }: RecipeFiltersProps) {
  const {
    filters,
    setSearch,
    setCuisine,
    setDifficulty,
    setExcludeMine,
    setSearchMode,
    resetFilters,
    openCreateDialog,
  } = useRecipeUiStore();

  const [localSearch, setLocalSearch] = useState(filters.search);
  const debouncedSearch = useDebounce(localSearch);

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  useEffect(() => {
    setLocalSearch(filters.search);
  }, [filters.search]);

  const isIngredientMode = filters.searchMode === 'ingredients';
  const hasFilters =
    filters.search ||
    filters.cuisine ||
    filters.difficulty ||
    filters.excludeMine;

  const searchPlaceholder = isIngredientMode
    ? 'e.g. chicken, garlic, lemon…'
    : 'e.g. pasta, soup, salad…';

  return (
    <div className="flex flex-col gap-2">
      {/* Search mode toggle — sits outside the filter row */}
      <div className="flex items-center gap-2">
        <Button
          variant={isIngredientMode ? 'secondary' : 'outline'}
          size="sm"
          onClick={() =>
            setSearchMode(isIngredientMode ? 'title' : 'ingredients')
          }
        >
          {isIngredientMode ? 'Searching ingredients' : 'Search ingredients'}
        </Button>
        {showExcludeMine && (
          <Button
            variant={filters.excludeMine ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setExcludeMine(!filters.excludeMine)}
          >
            {filters.excludeMine
              ? "Showing others' recipes"
              : 'Exclude my recipes'}
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Non-clickable icon indicator + search input */}
          <div className="flex items-stretch flex-1 max-w-sm">
            <div
              className={`
              flex items-center shrink-0 rounded-l-md border border-r-0 px-2.5 py-2
              ${
                isIngredientMode
                  ? 'bg-primary border-primary'
                  : 'bg-muted border-input text-muted-foreground'
              }
            `}
            >
              {isIngredientMode ? (
                <span className="text-sm leading-none">🥕</span>
              ) : (
                <TextSearch className="h-3.5 w-3.5" />
              )}
            </div>
            <Input
              placeholder={searchPlaceholder}
              className="rounded-l-none"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>

          {/* Cuisine */}
          <Select
            value={filters.cuisine ?? 'all'}
            onValueChange={(v) =>
              setCuisine(
                v === 'all' ? undefined : (v as typeof filters.cuisine),
              )
            }
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Cuisine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cuisines</SelectItem>
              {cuisineEnum.enumValues.map((c) => (
                <SelectItem key={c} value={c} className="capitalize">
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Difficulty */}
          <Select
            value={filters.difficulty ?? 'all'}
            onValueChange={(v) =>
              setDifficulty(
                v === 'all' ? undefined : (v as typeof filters.difficulty),
              )
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any level</SelectItem>
              {difficultyEnum.enumValues.map((d) => (
                <SelectItem key={d} value={d} className="capitalize">
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-muted-foreground"
            >
              <X className="mr-1 h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>

        <Button onClick={openCreateDialog} className="shrink-0">
          + New Recipe
        </Button>
      </div>
    </div>
  );
}
