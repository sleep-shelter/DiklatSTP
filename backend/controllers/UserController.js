import User from "../models/UserModel.js";
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import { Op } from 'sequelize';
import { sendMail } from '../services/emailService.js'; // Pastikan Anda memiliki service email yang sudah dibuat

const generateEmailToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email }, process.env.EMAIL_TOKEN_SECRET, { expiresIn: '1d' });
};

// Fungsi untuk verifikasi email
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        const decoded = jwt.verify(token, process.env.EMAIL_TOKEN_SECRET);
        const user = await User.findOne({ where: { id: decoded.id } });

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        await User.update({ status: true }, { where: { id: user.id } });

        res.status(200).json({ msg: "Email verified successfully" });
    } catch (error) {
        res.status(400).json({ msg: "Invalid or expired token" });
    }
};


export const getUsers = async (req, res) => {
    try {
        const response = await User.findAll({
            attributes: ['id', 'username', 'email', 'first_name', 'last_name']
        });
        res.status(200).json(response);
    } catch (error) {
        console.log(error.message);
    }
}

export const getUsersById = async (req, res) => {
    try {
        const response = await User.findOne({
            where: {
                id: req.params.id
            }
        });
        res.status(200).json(response);
    } catch (error) {
        console.log(error.message);
    }
}

export const createUser = async (req, res) => {
    const { username, email, password, confPassword, first_name, last_name } = req.body;

    if (password !== confPassword) {
        return res.status(400).json({ msg: "Password dan Confirm Password tidak cocok!" });
    };

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const verificationToken = generateEmailToken({ email });

        await User.create({
            username,
            email,
            password: hashedPassword,
            first_name,
            last_name,
            verificationToken
        });

        res.status(201).json({ msg: "User Created. Please check your email to verify your account" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: error.message });
    };
};

export const updateUser = async (req, res) => {
    const { password, confPassword, ...updateData } = req.body;

    if (password && password !== confPassword) {
        return res.status(400).json({ msg: "Password dan Confirm Password tidak cocok!" });
    }

    try {
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        await User.update(updateData, {
            where: { id: req.params.id }
        });

        res.status(200).json({ msg: "User updated successfully" });
    } catch (error) {
        console.error("Error updating user:", error.message);
        res.status(500).json({ error: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        await User.destroy({
            where: {
                id: req.params.id
            }
        });
        res.status(201).json({ msg: "User Deleted" });
    } catch (error) {
        console.log(error.message);
    }
}

export const Login = async (req, res) => {
    try {
        const { identifier, password } = req.body; // Menggunakan identifier untuk email atau username
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

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(400).json({ msg: "Password salah" });
        }

        const userId = user.id;
        const username = user.username;
        const email = user.email;
        
        const accessToken = jwt.sign({ userId, username, email }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '50s' // Pertimbangkan untuk memperpanjang durasi ini
        });

        const refreshToken = jwt.sign({ userId, username, email }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: '1d'
        });

        await User.update({
            refresh_token: refreshToken,
            status: true, // Update status to true
            last_login: new Date() // Set the last login time
        }, {
            where: {
                id: userId
            }
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });

        res.json({ accessToken });
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ msg: "Terjadi kesalahan pada server" });
    };
};

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
        status: false, // Update status to false
        last_login: new Date() // Set the last login time
    }, {
        where: {
            id: userId
        }
    });
    res.clearCookie('refreshToken');
    return res.sendStatus(200);
}
