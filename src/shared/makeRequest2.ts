import https from 'https';

const targetUrl = 'https://railapp.railway.gov.bd'; // Replace with your target URL
const totalRequests = 10000;
const concurrencyLimit = 20;

let completedRequests = 0;
let running = 0;
const queue: number[] = [];

function makeRequest(): Promise<void> {
  return new Promise((resolve) => {
    https.get(targetUrl, (res) => {
      console.log(`Status: ${res.statusCode}`);
      res.on('data', () => {}); // consume data to avoid memory leaks
      res.on('end', () => {
        completedRequests++;
        resolve();
      });
    }).on('error', (err) => {
      console.error(`❌ Error: ${err.message}`);
      resolve(); // resolve anyway so that we continue processing
    });
  });
}

export async function run(): Promise<void> {
  for (let i = 0; i < totalRequests; i++) {
    queue.push(i);
  }

  async function next(): Promise<void> {
    if (queue.length === 0) return;

    while (running < concurrencyLimit && queue.length > 0) {
      const index = queue.shift()!;
      running++;
      makeRequest().then(() => {
        running--;
        next();
      });
    }
  }

  next();

  // Wait until all requests are done
  while (completedRequests < totalRequests) {
    await new Promise((r) => setTimeout(r, 10));
  }

  console.log(`✅ All ${totalRequests} requests completed.`);
}


