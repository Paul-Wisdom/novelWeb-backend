import emailQueue from "../emailQueue";
import emailWorker from "./emailWorker";

async function getPendingJobs() {
    const jobs = await emailQueue.getJobs()

    console.log(jobs)
}

getPendingJobs()
export { emailWorker }