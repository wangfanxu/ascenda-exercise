import { createClient } from "redis";

// Create a Redis client using environment variables
const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST ?? "localhost"}:${
    process.env.REDIS_PORT ?? "6379"
  }`,
});

redisClient.on("error", (err) => {
  console.error("Redis client error:", err);
});

redisClient.connect();

export default redisClient;
