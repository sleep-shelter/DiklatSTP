import User from "../models/UserModel.js";
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import { Op } from 'sequelize';
import { sendMail, sendResetPasswordMail } from '../services/emailService.js'; // Pastikan Anda memiliki service email yang sudah dibuat
import { dataValid } from "../validation/dataValidation.js"; // Import dataValid

// Fungsi untuk menghasilkan token verifikasi email
const generateEmailToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email }, process.env.EMAIL_TOKEN_SECRET, { expiresIn: '1d' });
};

// Fungsi untuk verifikasi email
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        console.log(`Token received: ${token}`); // Logging untuk debug

        const decoded = jwt.verify(token, process.env.EMAIL_TOKEN_SECRET);
        console.log(`Decoded token: ${JSON.stringify(decoded)}`); // Logging untuk debug

        const user = await User.findOne({ where: { id: decoded.id } });
        console.log(`User found: ${JSON.stringify(user)}`); // Logging untuk debug

        if (!user) {
            es.status(404).json({ msg: "Pengguna tidak ditemukan" });
            return res.status(404).json({ msg: "Pengguna tidak ditemukan" });
        }

        await User.update({ isVerified: true }, { where: { id: user.id } });

        console.log("Email berhasil diverifikasi"); // Logging untuk debug
        res.status(200).json({ msg: "Email berhasil diverifikasi" });
    } catch (error) {
        console.error("Error during email verification:", error.message); // Logging untuk debug
        res.status(400).json({ msg: "Token tidak valid atau sudah kadaluwarsa" });
    }
};

// Fungsi untuk mengirim ulang email verifikasi
export const resendVerificationEmail = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ msg: "Email tidak ditemukan" });
        }

        if (user.isVerified) {
            return res.status(400).json({ msg: "Akun sudah diverifikasi" });
        }

        const emailToken = generateEmailToken(user);
        await sendMail(email, emailToken);

        res.status(200).json({ msg: "Email verifikasi ulang telah dikirim" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

// Fungsi untuk mendapatkan semua pengguna
export const getUsers = async (req, res) => {
    try {
        // Middleware akan memastikan hanya admin yang bisa mengakses endpoint ini
        const response = await User.findAll({
            attributes: ['id', 'username', 'email', 'first_name', 'last_name', 'role']
        });
        res.status(200).json(response);
    } catch (error) {
        console.log(error.message);
    }
};

// Fungsi untuk mendapatkan pengguna berdasarkan ID
export const getUsersById = async (req, res) => {
    try {
        const userId = req.user.userId; // Ambil userId dari token yang terverifikasi
        const response = await User.findOne({
            attributes: ['id', 'username', 'email', 'first_name', 'last_name', 'role'],
            where: {
                id: userId
            }
        });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Fungsi untuk membuat pengguna baru
export const createUser = async (req, res) => {
    const { username, email, password, confPassword, first_name, last_name } = req.body;

    // Validasi data
    const { message, data } = await dataValid(
        {
            username: "required",
            email: "required,isEmail",
            password: "required,isStrongPassword",
            confPassword: "required",
            first_name: "required",
            last_name: "required"
        },
        req.body
    );

    if (message.length > 0) {
        return res.status(400).json({ msg: message.join(", ") });
    }

    if (password !== confPassword) {
        return res.status(400).json({ msg: "Password dan Confirm Password tidak cocok!" });
    };

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            first_name,
            last_name,
        });

        const verificationToken = generateEmailToken(newUser);
        await sendMail(email, verificationToken);

        res.status(201).json({ msg: "Pengguna dibuat. Silakan periksa email Anda untuk verifikasi akun" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: error.message });
    };
};

// Fungsi untuk memperbarui data pengguna
export const updateUser = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    // Validasi data
    const { message, data } = await dataValid(
        {
            username: "required",
            email: "required,isEmail",
            first_name: "required",
            last_name: "required"
        },
        req.body
    );

    if (message.length > 0) {
        return res.status(400).json({ msg: message.join(", ") });
    }

    try {
        const userId = req.user.userId; // Ambil userId dari token yang terverifikasi
        if (parseInt(id) !== userId) {
            return res.status(403).json({ msg: "Akses terlarang" });
        }

        await User.update(updateData, {
            where: { id: userId }
        });

        res.status(200).json({ msg: "Pengguna berhasil diperbarui" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Fungsi untuk memperbarui password pengguna
export const updatePassword = async (req, res) => {
    const { id } = req.params;
    const { currentPassword, newPassword, confNewPassword } = req.body;

    // Validasi data
    const { message, data } = await dataValid(
        {
            currentPassword: "required",
            newPassword: "required,isStrongPassword",
            confNewPassword: "required"
        },
        req.body
    );

    if (message.length > 0) {
        return res.status(400).json({ msg: message.join(", ") });
    }

    if (newPassword !== confNewPassword) {
        return res.status(400).json({ msg: "Password baru dan konfirmasi password baru tidak cocok!" });
    }

    try {
        const user = await User.findOne({ where: { id } });

        if (!user) {
            return res.status(404).json({ msg: "User tidak ditemukan" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: "Password saat ini salah" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await User.update({ password: hashedPassword }, {
            where: { id }
        });

        res.status(200).json({ msg: "Password berhasil diperbarui" });
    } catch (error) {
        console.error("Error updating password:", error.message);
        res.status(500).json({ error: error.message });
    }
};

// Fungsi untuk menghapus pengguna
export const deleteUser = async (req, res) => {
    try {
        await User.destroy({
            where: {
                id: req.params.id
            }
        });
        res.status(201).json({ msg: "Pengguna dihapus" });
    } catch (error) {
        console.log(error.message);
    }
}

// Fungsi untuk login pengguna
export const Login = async (req, res) => {
    try {
        const { identifier, password } = req.body; // Menggunakan identifier untuk email atau username

        // Validasi input
        const { message } = await dataValid(
            {
                identifier: "required",
                password: "required"
            },
            req.body
        );

        if (message.length > 0) {
            return res.status(400).json({ msg: message.join(", ") });
        }

        // Temukan pengguna berdasarkan email atau username
        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { email: identifier },
                    { username: identifier }
                ]
            }
        });

        if (!user) {
            return res.status(404).json({ msg: "Email atau Username tidak ditemukan" });
        }

        // Cek apakah akun telah diverifikasi
        if (!user.isVerified) {
            return res.status(400).json({ msg: "Akun belum diverifikasi. Silakan periksa email Anda untuk verifikasi akun." });
        }

        // Periksa apakah pengguna tidak aktif lebih dari 30 menit
        const thirtyMinutesAgo = new Date(new Date() - 30 * 60 * 1000);
        if (user.last_active && user.last_active < thirtyMinutesAgo) {
            // Logout otomatis jika sudah lebih dari 30 menit
            await User.update({ refresh_token: null, status: false }, { where: { id: user.id } });
            return res.status(400).json({ msg: "Akun telah logout otomatis karena tidak aktif lebih dari 30 menit" });
        }

        // Periksa password
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(400).json({ msg: "Password salah" });
        }

        // Generate token
        const userId = user.id;
        const username = user.username;
        const email = user.email;
        
        const accessToken = jwt.sign({ userId, username, email }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '50s' // Pertimbangkan untuk memperpanjang durasi ini
        });

        const refreshToken = jwt.sign({ userId, username, email }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: '1d'
        });

        // Update data pengguna
        await User.update({
            refresh_token: refreshToken,
            status: true, // Update status to true
            last_login: new Date(), // Set the last login time
            last_active: new Date() // Update last active time
        }, {
            where: {
                id: userId
            }
        });

        // Kirimkan token refresh dalam cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });

        // Kirimkan token akses sebagai respons
        res.json({ accessToken });
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ msg: "Terjadi kesalahan pada server" });
    }
};

// Fungsi untuk logout pengguna
export const Logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(204);

    const user = await User.findOne({
        where: {
            refresh_token: refreshToken
        }
    });

    if (!user) return res.sendStatus(204);

    const userId = user.id;
    await User.update({
        refresh_token: null,
        status: false,
        last_login: new Date()
    }, {
        where: {
            id: userId
        }
    });

    // Menghapus cookie refresh token
    res.clearCookie('refreshToken');
    res.status(200).json({ msg: "Berhasil logout" });
};

// Fungsi untuk meminta reset password
export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ msg: "Email tidak ditemukan" });
        }

        const resetToken = jwt.sign({ id: user.id, email: user.email }, process.env.RESET_PASSWORD_SECRET, { expiresIn: '1h' });

        await sendResetPasswordMail(email, resetToken);

        res.status(200).json({ msg: "Reset password email sent" });
    } catch (error) {
        console.error("Error during password reset request:", error.message);
        res.status(500).json({ error: error.message });
    }
};

// Fungsi untuk mereset password pengguna
export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword, confNewPassword } = req.body;

     // Validasi data
     const { message, data } = await dataValid(
        {
            newPassword: "required,isStrongPassword",
            confNewPassword: "required"
        },
        req.body
    );

    if (message.length > 0) {
        return res.status(400).json({ msg: message.join(", ") });
    }

    if (newPassword !== confNewPassword) {
        return res.status(400).json({ msg: "Password baru dan konfirmasi password baru tidak cocok!" });
    }

    try {
        const decoded = jwt.verify(token, process.env.RESET_PASSWORD_SECRET);

        const user = await User.findOne({ where: { id: decoded.id } });

        if (!user) {
            return res.status(404).json({ msg: "User tidak ditemukan" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await User.update({ password: hashedPassword }, { where: { id: user.id } });

        res.status(200).json({ msg: "Password berhasil diperbarui" });
    } catch (error) {
        console.error("Error resetting password:", error.message);
        res.status(500).json({ error: error.message });
    }
};
