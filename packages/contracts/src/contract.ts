import { initContract } from '@ts-rest/core';
import { z } from 'zod';

import {
  CreatePostSchema,
  ErrorSchema,
  PaginatedSchema,
  PostListQuerySchema,
  PostSchema,
  UpdatePostSchema,
  UserSchema,
} from './schemas';

const c = initContract();

export const usersContract = c.router({
  getMe: {
    method: 'GET',
    path: '/users/me',
    responses: { 200: UserSchema, 401: ErrorSchema, 404: ErrorSchema },
    summary: 'Get current authenticated user',
  },
  updateMe: {
    method: 'PATCH',
    path: '/users/me',
    body: UserSchema.pick({ firstName: true, lastName: true }),
    responses: { 200: UserSchema, 401: ErrorSchema, 422: ErrorSchema },
    summary: 'Update current user profile',
  },
});

export const postsContract = c.router({
  list: {
    method: 'GET',
    path: '/posts',
    query: PostListQuerySchema,
    responses: { 200: PaginatedSchema(PostSchema), 401: ErrorSchema },
    summary: 'List posts with pagination',
  },
  getById: {
    method: 'GET',
    path: '/posts/:id',
    pathParams: z.object({ id: z.string().uuid() }),
    responses: { 200: PostSchema, 401: ErrorSchema, 404: ErrorSchema },
    summary: 'Get a single post by ID',
  },
  create: {
    method: 'POST',
    path: '/posts',
    body: CreatePostSchema,
    responses: { 201: PostSchema, 401: ErrorSchema, 422: ErrorSchema },
    summary: 'Create a new post',
  },
  update: {
    method: 'PATCH',
    path: '/posts/:id',
    pathParams: z.object({ id: z.string().uuid() }),
    body: UpdatePostSchema,
    responses: {
      200: PostSchema,
      401: ErrorSchema,
      403: ErrorSchema,
      404: ErrorSchema,
      422: ErrorSchema,
    },
    summary: 'Update a post',
  },
  delete: {
    method: 'DELETE',
    path: '/posts/:id',
    pathParams: z.object({ id: z.string().uuid() }),
    body: c.noBody(),
    responses: {
      200: z.object({ success: z.boolean() }),
      401: ErrorSchema,
      403: ErrorSchema,
      404: ErrorSchema,
    },
    summary: 'Delete a post',
  },
});

export const contract = c.router(
  { users: usersContract, posts: postsContract },
  { pathPrefix: '/api', strictStatusCodes: true },
);

export type AppContract = typeof contract;
