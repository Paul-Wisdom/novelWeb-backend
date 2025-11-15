import { createTransport } from "nodemailer";
import { SMTP_EMAIL, SMTP_PASSWORD } from "../../config";

const mailTransporter = createTransport({
    // service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    connectionTimeout: 10000,
    socketTimeout: 15000,
    auth: {
        user: SMTP_EMAIL,
        pass: SMTP_PASSWORD
    }
})

mailTransporter.verify((err) => {
    if(err){
        console.log('Transporter error', err)
    }else{
        console.log('Email transporter ready')
    }
})

export default mailTransporter