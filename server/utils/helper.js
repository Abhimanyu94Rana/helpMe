import nodemailer from 'nodemailer'

// Send email
const sendEmail = (to,subject,body) => {
    
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'youremail@gmail.com',
            pass: 'yourpassword'
        }
    });
    
    const mailOptions = {
        from: 'youremail@gmail.com',
        to: to,
        subject: subject,
        text: body
    };
    
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

// Upload file
const uploadFile = (req,res) => {
    return res.status(200).json({
        status:false,
        message:"File has been uploaded successfully."
    })
}

export {
    sendEmail,
    uploadFile
}