// queues/emailQueue.ts
import { Queue, } from "bullmq";
import { connection } from "../redis";




// Create the queue
export const emailQueue = new Queue("emailQueue", { connection });
