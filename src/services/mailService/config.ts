import { createTransport } from "nodemailer";
import { SMTP_EMAIL, SMTP_PASSWORD } from "../../config";

const mailTransporter = createTransport({
    service: 'gmail',
    auth: {
        user: SMTP_EMAIL,
        pass: SMTP_PASSWORD
    }
})

mailTransporter.verify((err) => {
    if(err){
        console.log(err)
    }else{
        console.log('Email transporter ready')
    }
})

export default mailTransporter