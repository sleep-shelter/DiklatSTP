import express from "express";
import { 
    getUsers, 
    getUsersById,
    createUser,
    updateUser,
    updatePassword,
    deleteUser,
    Login,
    Logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerificationEmail
} from "../controllers/UserController.js";
import { verifyToken, adminOnly, isUserOrAdmin } from '../middleware/auth.js';
import { refreshToken } from "../services/RefreshToken.js";

const router = express.Router();

router.get('/users', verifyToken, adminOnly, getUsers);
router.get('/users/:id', verifyToken, isUserOrAdmin, getUsersById);
router.post('/users', createUser);
router.put('/users/:id', verifyToken, isUserOrAdmin, updateUser);
router.delete('/users/:id', verifyToken, adminOnly, deleteUser);
router.put('/users/update-password/:id', verifyToken, isUserOrAdmin, updatePassword);
router.post('/resend-verification-email', resendVerificationEmail); // Endpoint baru

router.post('/login', Login);
router.post('/logout', Logout); // Logout harus terautentikasi untuk mengetahui siapa yang logout

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

router.post('/refresh-token', refreshToken);

router.get('/verify-email/:token', verifyEmail);


export default router;