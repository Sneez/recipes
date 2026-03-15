import { getMe, updateMe } from '@api/services/users.service';
import { contract } from '@recipes/contracts';
import { initServer } from '@ts-rest/fastify';
import type { FastifyInstance } from 'fastify';

const s = initServer();

const impl = s.router(contract.users, {
  getMe: async (args) => {
    return getMe(args.request.auth?.userId ?? null, args.request.log) as never;
  },

  updateMe: async (args) => {
    return updateMe(args.request.auth?.userId ?? null, args.body) as never;
  },
});

export async function usersRouter(app: FastifyInstance) {
  await app.register(s.plugin(impl));
}
