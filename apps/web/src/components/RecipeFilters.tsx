import { useEffect, useState } from 'react';

import { cuisineEnum, difficultyEnum } from '@recipes/db/enums';
import { Search, X } from 'lucide-react';

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
    resetFilters,
    openCreateDialog,
  } = useRecipeUiStore();

  const [localSearch, setLocalSearch] = useState(filters.search);
  const debouncedSearch = useDebounce(localSearch);

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  // Keep localSearch in sync when the store is reset externally
  useEffect(() => {
    setLocalSearch(filters.search);
  }, [filters.search]);

  const hasFilters =
    filters.search ||
    filters.cuisine ||
    filters.difficulty ||
    filters.excludeMine;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search recipes…"
            className="pl-9"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>

        {/* Cuisine */}
        <Select
          value={filters.cuisine ?? 'all'}
          onValueChange={(v) =>
            setCuisine(v === 'all' ? undefined : (v as typeof filters.cuisine))
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

        {/* Exclude mine toggle — only shown on browse page */}
        {showExcludeMine && (
          <Button
            variant={filters.excludeMine ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setExcludeMine(!filters.excludeMine)}
            className="shrink-0"
          >
            {filters.excludeMine
              ? "Showing others' recipes"
              : 'Exclude my recipes'}
          </Button>
        )}

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
  );
}
