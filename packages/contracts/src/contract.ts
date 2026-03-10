/**
 * @recipes/contracts
 *
 * All schemas imported from @recipes/db/zod — never redeclared here.
 * This file is the API surface: path, method, request/response shapes.
 */
import { initContract } from "@ts-rest/core";
import { z } from "zod";
import {
  createRecipeSchema,
  errorSchema,
  paginatedSchema,
  recipeListQuerySchema,
  selectRecipeSchema,
  selectUserSchema,
  updateRecipeSchema,
} from "@recipes/db/zod";

const c = initContract();

// ── Users ─────────────────────────────────────────────────────────────────────

export const usersContract = c.router({
  getMe: {
    method: "GET",
    path: "/users/me",
    responses: { 200: selectUserSchema, 401: errorSchema, 404: errorSchema },
    summary: "Get current authenticated user",
  },
  updateMe: {
    method: "PATCH",
    path: "/users/me",
    body: selectUserSchema.pick({ firstName: true, lastName: true }),
    responses: { 200: selectUserSchema, 401: errorSchema, 422: errorSchema },
    summary: "Update current user profile",
  },
});

// ── Recipes ───────────────────────────────────────────────────────────────────

export const recipesContract = c.router({
  list: {
    method: "GET",
    path: "/recipes",
    query: recipeListQuerySchema,
    responses: { 200: paginatedSchema(selectRecipeSchema), 401: errorSchema },
    summary: "List recipes with pagination + filters",
  },
  getById: {
    method: "GET",
    path: "/recipes/:id",
    pathParams: z.object({ id: z.string().uuid() }),
    responses: { 200: selectRecipeSchema, 401: errorSchema, 404: errorSchema },
    summary: "Get a single recipe",
  },
  create: {
    method: "POST",
    path: "/recipes",
    body: createRecipeSchema,
    responses: { 201: selectRecipeSchema, 401: errorSchema, 422: errorSchema },
    summary: "Create a recipe",
  },
  update: {
    method: "PATCH",
    path: "/recipes/:id",
    pathParams: z.object({ id: z.string().uuid() }),
    body: updateRecipeSchema,
    responses: {
      200: selectRecipeSchema,
      401: errorSchema,
      403: errorSchema,
      404: errorSchema,
      422: errorSchema,
    },
    summary: "Update a recipe",
  },
  delete: {
    method: "DELETE",
    path: "/recipes/:id",
    pathParams: z.object({ id: z.string().uuid() }),
    body: c.noBody(),
    responses: {
      200: z.object({ success: z.boolean() }),
      401: errorSchema,
      403: errorSchema,
      404: errorSchema,
    },
    summary: "Delete a recipe",
  },
});

// ── Root ──────────────────────────────────────────────────────────────────────

export const contract = c.router(
  { users: usersContract, recipes: recipesContract },
  { pathPrefix: "/api", strictStatusCodes: true },
);

export type AppContract = typeof contract;
