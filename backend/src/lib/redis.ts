import { createClient } from 'redis';

// Creating a typed connection
export const redis = createClient({
  url: process.env.REDIS_URL ?? 'redis://localhost:6379',
});

// Connecting to the Redis server
async function connectRedis(): Promise<void> {
  await redis.connect();
  console.log('Successfully connected to Redis');
}
// Error handling
redis.on('error', (err: Error) => {
  console.error('Redis connection error:', err);
});
connectRedis().catch(console.error);