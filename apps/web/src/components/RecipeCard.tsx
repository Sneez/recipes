import { Link } from "@tanstack/react-router";
import { Clock, Users, ChefHat } from "lucide-react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMinutes } from "@/lib/utils";
import type { RecipeDto } from "@/hooks/use-recipes";

const difficultyVariant: Record<string, BadgeProps["variant"]> = {
  easy: "easy",
  medium: "medium",
  hard: "hard",
};

interface RecipeCardProps {
  recipe: RecipeDto;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;

  return (
    <Link to="/recipes/$id" params={{ id: recipe.id }} className="block group">
      <Card className="h-full transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md">
        {/* Decorative top stripe */}
        <div className="h-1.5 w-full rounded-t-lg bg-accent opacity-70" />
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-tight group-hover:text-primary transition-colors line-clamp-2">
              {recipe.title}
            </CardTitle>
            <Badge variant={difficultyVariant[recipe.difficulty]} className="shrink-0 capitalize">
              {recipe.difficulty}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {totalTime > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatMinutes(totalTime)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {recipe.servings} servings
            </span>
            <Badge variant="outline" className="capitalize text-xs">
              {recipe.cuisine}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function RecipeCardSkeleton() {
  return (
    <Card className="h-full">
      <div className="h-1.5 w-full rounded-t-lg bg-muted" />
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-5 w-14 shrink-0 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-3.5 w-12" />
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}
