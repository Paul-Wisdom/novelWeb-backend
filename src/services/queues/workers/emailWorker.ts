import { Worker } from "bullmq";
import { EmailQueueJobData } from "../../../utils/types";
import { sendEmail } from "../../mailService";
import redisConnection from "../config";

console.log('Starting workers')
const emailWorker = new Worker<EmailQueueJobData>('emailQueue', async (job) => {
    console.log(`Processing email to ${job.data.to}`)
    await sendEmail(job.data);
}, {
    connection: redisConnection
})
emailWorker.on('completed', (job) => console.log(`mail to ${job.data.to} sent succeessfully`))
export default emailWorker