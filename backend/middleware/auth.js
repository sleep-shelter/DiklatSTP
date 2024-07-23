import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) return res.sendStatus(403);
        req.user = decoded;
        next();
    });
};

export const adminOnly = async (req, res, next) => {
    const user = await User.findOne({ where: { id: req.user.userId } });
    if (!user) return res.status(404).json({ msg: "Pengguna tidak ditemukan" });
    if (user.role !== "admin") return res.status(403).json({ msg: "Akses terlarang" });
    next();
};

// Middleware untuk memverifikasi bahwa ia adalah user pemilik data atau admin
export const isUserOrAdmin = async (req, res, next) => {
    try {
        const userId = req.user.userId; // Ambil userId dari token yang terverifikasi
        const user = await User.findOne({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ msg: "Pengguna tidak ditemukan" });
        }

        if (user.role === "admin" || user.id === parseInt(req.params.id)) {
            next();
        } else {
            return res.status(403).json({ msg: "Akses terlarang" });
        }
    } catch (error) {
        console.error("Error in isUserOrAdmin middleware:", error.message);
        res.status(500).json({ msg: "Terjadi kesalahan pada server" });
    }
};
