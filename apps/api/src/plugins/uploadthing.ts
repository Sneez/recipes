import { type FileRouter, createUploadthing } from 'uploadthing/fastify';

const f = createUploadthing();

export const uploadRouter: FileRouter = {
  recipeImage: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    .middleware(async () => {
      return {};
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url };
    }),
};

export type UploadRouter = typeof uploadRouter;
