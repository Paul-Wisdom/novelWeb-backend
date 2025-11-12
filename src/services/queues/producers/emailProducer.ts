import { EmailQueueJobData } from "../../../utils/types";
import emailQueue from "../emailQueue";


export const addEmailToQueue = async (data: EmailQueueJobData) => {
    console.log(`adding email to queue for ${data.to}`)
    await emailQueue.add('send email', data, {
        attempts: 3,
        delay: 1000
    })
    console.log(`added email to queue for ${data.to}`)
}