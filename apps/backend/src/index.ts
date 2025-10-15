import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import dotenv from 'dotenv';
import Fastify from 'fastify';
import mercurius from 'mercurius';

import { DatabaseService } from './infrastructure/database/Database';
import { PlayerRepository } from './infrastructure/repositories/PlayerRepository';
import { BlockchainService } from './infrastructure/services/BlockchainService';
import { resolvers } from './presentation/graphql/resolvers';
import { schema } from './presentation/graphql/schema';

dotenv.config();

const server = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

// Initialize services
const blockchainService = new BlockchainService(
  process.env.SEPOLIA_RPC_URL || '',
  {
    minerToken: process.env.MINER_TOKEN_ADDRESS || '',
    minerNFT: process.env.MINER_NFT_ADDRESS || '',
    minerGame: process.env.MINER_GAME_ADDRESS || '',
  },
  process.env.DEPLOYER_PRIVATE_KEY,
);

const databaseService = new DatabaseService(process.env.DATABASE_PATH || './data/tapforge.db');
const playerRepository = new PlayerRepository(databaseService.getDatabase());

// Register plugins
async function start() {
  try {
    // Security
    await server.register(helmet, {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      global: false,
    });

    // CORS
    await server.register(cors, {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    });

    // Rate limiting
    await server.register(rateLimit, {
      max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
      timeWindow: process.env.RATE_LIMIT_TIME_WINDOW || '1 minute',
    });

    // GraphQL
    await server.register(mercurius, {
      schema,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      resolvers: resolvers as any,
      context: () => ({
        blockchainService,
        playerRepository,
      }),
      graphiql: process.env.NODE_ENV !== 'production',
      path: '/graphql',
    });

    // Health check
    server.get('/health', async () => {
      const blockNumber = await blockchainService.getBlockNumber();
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        blockNumber: blockNumber.toString(),
      };
    });

    // Start server
    const port = parseInt(process.env.PORT || '4000', 10);
    const host = process.env.HOST || '0.0.0.0';

    await server.listen({ port, host });
    server.log.info(`Server listening on ${host}:${port}`);
    server.log.info(`GraphQL endpoint: http://${host}:${port}/graphql`);
    if (process.env.NODE_ENV !== 'production') {
      server.log.info(`GraphiQL IDE: http://${host}:${port}/graphiql`);
    }
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();

// Graceful shutdown
const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
signals.forEach((signal) => {
  process.on(signal, async () => {
    server.log.info(`Received ${signal}, closing server...`);
    await server.close();
    process.exit(0);
  });
});
