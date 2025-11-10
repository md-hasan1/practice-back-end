import https from 'https';

const targetUrl = 'https://railapp.railway.gov.bd';

let completedRequests = 0;

function makeRequest(): Promise<number> {
  return new Promise((resolve) => {
    https.get(targetUrl, (res) => {
      console.log(`Statusc: ${res.statusCode}`);
      res.on('data', () => {}); // consume data to avoid memory leaks
      res.on('end', () => {
        completedRequests++;
        console.log(`✅ Completed requests: ${completedRequests}`);
        resolve(completedRequests);
      });
    }).on('error', (err) => {
      console.error(`❌ Error: ${err.message}`);
      resolve(completedRequests); // resolve so loop continues even on error
    });
  });
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function runSerialRequests() {
  while (true) {
    await makeRequest();
  //  await delay(1); // delay 100 ms between requests (adjust or remove if you want)
  }
}

// Start the infinite serial requests
// runSerialRequests().catch(console.error);




