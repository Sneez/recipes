import 'dotenv/config';

// Dynamic imports ensure dotenv has populated process.env before any
// plugin module is evaluated. Static ESM imports are hoisted and may
// evaluate before dotenv/config runs, causing "X is required" throws.
async function main() {
  const [
    { default: Fastify },
    { default: cors },
    { default: helmet },
    { clerkPlugin },
    { recipesRouter },
    { usersRouter },
    { createRouteHandler },
    { uploadRouter },
  ] = await Promise.all([
    import('fastify'),
    import('@fastify/cors'),
    import('@fastify/helmet'),
    import('./plugins/clerk.js'),
    import('./routes/recipes.js'),
    import('./routes/users.js'),
    import('uploadthing/fastify'),
    import('./plugins/uploadthing.js'),
  ]);

  const HOST = process.env['API_HOST'] ?? '0.0.0.0';
  const PORT = Number(process.env['API_PORT'] ?? 3000);

  const app = Fastify({
    logger: {
      level: process.env['NODE_ENV'] === 'production' ? 'info' : 'debug',
      ...(process.env['NODE_ENV'] !== 'production'
        ? { transport: { target: 'pino-pretty' } }
        : {}),
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
  await app.register(createRouteHandler, {
    router: uploadRouter,
    config: { token: process.env['UPLOADTHING_TOKEN'] ?? '' },
  });

  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }));

  app.setErrorHandler((error, request, reply) => {
    request.log.error({ err: error, body: request.body }, 'request error');
    void reply.status(error.statusCode ?? 500).send({
      message: error.message,
      code: error.code,
    });
  });

  try {
    await app.listen({ host: HOST, port: PORT });
    console.log(`🍳 Recipes API listening on http://${HOST}:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
