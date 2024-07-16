import express from "express";
import { 
    getPendaftar, 
    getPendaftarById,
    registerDiklat,
    updateRegistrasi,
    deleteRegistrasi
} from "../controllers/DaftarDiklatController.js";

const router = express.Router();

router.get('/daftar-diklat', getPendaftar);
router.get('/daftar-diklat/:id', getPendaftarById);
router.post('/daftar-diklat', registerDiklat);
router.patch('/daftar-diklat/:id', updateRegistrasi);
router.delete('/daftar-diklat/:id', deleteRegistrasi);

export default router;
