import { createClient } from "redis";





const redisClient = createClient({
  url: "redis://localhost:6379"
});

redisClient.on("connect", () => {
  console.log("✅ Redis connected");
});

redisClient.on("error", (err) => {
  console.error("❌ Redis error:", err);
});
``
export const connection = {
  host: "127.0.0.1",
  port: 6379,
};


export default redisClient;
