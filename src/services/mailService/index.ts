import { EmailQueueJobData } from "../../utils/types";
import mailTransporter from "./config";

export const sendEmail = async (mailData: EmailQueueJobData) => {

    const mailOptions = {
        to: mailData.to,
        subject: mailData.subject,
        html: mailData.content
        
    }
    try {
        await mailTransporter.sendMail(mailOptions)
    }catch(e){
        console.log(`Error mail could not be sent to ${mailData.to}`)
        console.log(e);
    }
}