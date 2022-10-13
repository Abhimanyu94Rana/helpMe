import { config } from 'dotenv';
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

// Send email
const sendEmail = (to,subject,body) => {
    
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    
    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: to,
        subject: subject,
        text: body
    };
    
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            return {status:false,message:error}
        } else {
            return {status:false,message:error,data:info.response}
        }
    });
}

export {
    sendEmail
}