import express from "express";
import { 
    getUsers, 
    getUsersById,
    createUser,
    updateUser,
    updatePassword,
    deleteUser,
    Login,
    verifyEmail,
    Logout
} from "../controllers/UserController.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { refreshToken } from "../services/RefreshToken.js";

const router = express.Router();

router.get('/users', verifyToken, getUsers);
router.get('/users/:id', getUsersById);
router.post('/users', createUser);
router.patch('/users/:id', updateUser);
router.patch('/users/:id/password', updatePassword);
router.delete('/users/:id', deleteUser);
router.post('/login', Login);
router.get('/verify-email/:token', verifyEmail); // Rute untuk verifikasi email
router.get('/token', refreshToken);
router.delete('/logout', Logout);

export default router;