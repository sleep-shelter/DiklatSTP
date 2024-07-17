import express from "express";
import { 
    getUsers, 
    getUsersById,
    createUser,
    updateUser,
    deleteUser,
    Login,
    Logout
} from "../controllers/UserController.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { refreshToken } from "../services/RefreshToken.js";

const router = express.Router();

router.get('/users', verifyToken, getUsers);
router.get('/users/:id', getUsersById);
router.post('/users', createUser);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.post('/login', Login);
router.get('/token', refreshToken);
router.delete('/logout', Logout);

export default router;