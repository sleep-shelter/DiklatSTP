import nodemailer from "nodemailer";
import "dotenv/config";
const base_url = process.env.BASE_URL;

const transporter = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

const createEmail = (email, token) => {
    return {
        from: process.env.MAIL_FROM,
        to: email,
        subject: "Activation Confirmation",
        html: `<h3>For Activate Account, click link below</h3>
               <a href="${base_url}/verify-email/${token}">Link Activasi</a>`,
    };
};

const sendMail = (email, token) => {
    return new Promise((resolve, reject) => {
        transporter.sendMail(createEmail(email, token), (err, info) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log("Email sent: " + info.response);
                resolve(true);
            }
        });
    });
};

const sendResetPasswordMail = (email, token) => {
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Password Reset Request',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Password Reset Request</h2>
                <p>You have requested a password reset. Please click on the link below to reset your password:</p>
                <a href="${process.env.base_url}/reset-password/${token}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #007BFF; text-decoration: none; border-radius: 5px;">Reset Password</a>
                <p>If you did not request a password reset, please ignore this email.</p>
                <p>Thanks,<br>Your Company</p>
            </div>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};

export { sendMail, sendResetPasswordMail };