import User from "../models/UserModel.js";
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";

export const getUsers = async(req, res) => {
    try {
        const response = await User.findAll();
        res.status(200).json(response);
    } catch (error) {
        console.log(error.message);
    }
}

export const getUsersById = async(req, res) => {
    try {
        const response = await User.findOne({
            where:{
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
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create({
            username,
            email,
            password: hashedPassword,
            first_name,
            last_name
        });

        res.status(201).json({ msg: "User Created" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: error.message });
    }
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

export const deleteUser = async(req, res) => {
    try {
        await User.destroy({
            where:{
                id: req.params.id
            }
        });
        res.status(201).json({msg: "User Deleted"});
    } catch (error) {
        console.log(error.message);
    }
}

export const Login = async(req, res) => {
    try {
        const user = await User.findAll({
            where:{
                email: req.body.email
            }
        });
        const match = await bcrypt.compare(req.body.password, user[0].password);
        if(!match) return res.status(400).json({msg: "Wrong Password"});
        const userId = user[0].id;
        const username = user[0].username;
        const email = user[0].email;
        const accessToken = jwt.sign({userId, username, email}, process.env.ACCESS_TOKEN_SECRET,{
            expiresIn: '60s'
        });
        const refreshToken = jwt.sign({userId, username, email}, process.env.REFRESH_TOKEN_SECRET,{
            expiresIn: '1d'
        });
        await User.update({refresh_token: refreshToken},{
            where:{
                id: userId
            }
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });
        res.json({ accessToken });
    } catch (error) {
        res.status(404).json({msg:"Email tidak ditemukan"});
    }
}
