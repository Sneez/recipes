import { createFileRoute } from '@tanstack/react-router';

import { MyRecipesPage } from '@/pages/MyRecipesPage';

export const Route = createFileRoute('/my-recipes')({
  component: MyRecipesPage,
});
