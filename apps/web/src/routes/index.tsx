import { createFileRoute } from "@tanstack/react-router";
import { RecipesPage } from "@/pages/RecipesPage";

export const Route = createFileRoute("/")({
  component: RecipesPage,
});
