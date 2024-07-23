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
        subject: "Konfirmasi Email",
        html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Konfirmasi Email</h2>
                <p>Untuk mengaktifkan akun, klik link di bawah: </p>
                <a href="${base_url}/verify-email/${token}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #007BFF; text-decoration: none; border-radius: 5px;">Aktifkan Akun</a>
               `,
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
        subject: 'Permintaan Ubah Password',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Permintaan Ubah Password</h2>
                <p>Anda meminta layanan pengubahan password. Klik link di bawah untuk mengubah password</p>
                <a href="${base_url}/reset-password/${token}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #007BFF; text-decoration: none; border-radius: 5px;">Reset Password</a>
                <p>Jika ini bukan permintaan anda, abaikan email</p>
                <p>Terima Kasih, <br>Solo Techno Park</p>
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