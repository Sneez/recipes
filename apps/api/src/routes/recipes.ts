import {
  createRecipe,
  deleteRecipe,
  getRecipeById,
  listRecipes,
  updateRecipe,
} from '@api/services/recipes.service';
import { contract } from '@recipes/contracts';
import { initServer } from '@ts-rest/fastify';
import type { FastifyInstance } from 'fastify';

const s = initServer();

const impl = s.router(contract.recipes, {
  list: async (args) => {
    const auth = args.request.auth;
    return listRecipes(auth?.userId ?? null, args.query) as never;
  },

  getById: async ({ request, params }) => {
    return getRecipeById(request.auth?.userId ?? null, params.id) as never;
  },

  create: async ({ request, body }) => {
    return createRecipe(request.auth?.userId ?? null, body) as never;
  },

  update: async ({ request, params, body }) => {
    return updateRecipe(request.auth?.userId ?? null, params.id, body) as never;
  },

  delete: async ({ request, params }) => {
    return deleteRecipe(request.auth?.userId ?? null, params.id) as never;
  },
});

export async function recipesRouter(app: FastifyInstance) {
  await app.register(s.plugin(impl));
}
