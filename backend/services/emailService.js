import nodemailer from 'nodemailer';

export const sendVerificationEmail = async (email, token) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Email Verification',
        text: `Please verify your email by clicking the link: ${process.env.BASE_URL}/verify-email?token=${token}`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent to:', email);
    } catch (error) {
        console.error('Error sending verification email:', error.message);
    }
};
