import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";

// Fungsi untuk refresh token
export const refreshToken = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(401);

    const user = await User.findOne({ where: { refresh_token: refreshToken } });
    if (!user) return res.sendStatus(403);

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err) return res.sendStatus(403);

        const newAccessToken = jwt.sign({ userId: decoded.userId, username: decoded.username, email: decoded.email }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '50s'
        });

        res.json({ accessToken: newAccessToken });
    });
};