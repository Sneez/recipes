import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import 'dotenv/config';
import Fastify from 'fastify';

import { clerkPlugin } from './plugins/clerk.js';
import { recipesRouter } from './routes/recipes.js';
import { usersRouter } from './routes/users.js';

const HOST = process.env['API_HOST'] ?? '0.0.0.0';
const PORT = Number(process.env['API_PORT'] ?? 3000);

async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env['NODE_ENV'] === 'production' ? 'info' : 'debug',
      transport:
        process.env['NODE_ENV'] !== 'production'
          ? { target: 'pino-pretty' }
          : undefined,
    },
  });

  await app.register(helmet);
  await app.register(cors, {
    origin: process.env['WEB_URL'] ?? 'http://localhost:5173',
    credentials: true,
  });

  await app.register(clerkPlugin);
  await app.register(usersRouter);
  await app.register(recipesRouter);

  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }));

  return app;
}

async function start() {
  const app = await buildApp();
  try {
    await app.listen({ host: HOST, port: PORT });
    console.log(`🍳 Recipes API listening on http://${HOST}:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
