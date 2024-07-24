import DaftarDiklat from '../models/DaftarDiklatModel.js';
import User from "../models/UserModel.js";
import { createDiklatPDF } from '../services/pdfService.js';
import { uploadToGoogleDrive } from '../services/googleDriveService.js';

export const getPendaftar = async(req, res) => {
    try {
        const response = await DaftarDiklat.findAll();
        res.status(200).json(response);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: error.message });
    }
}

export const getPendaftarById = async(req, res) => {
    try {
        const response = await DaftarDiklat.findOne({
            where:{
                id: req.params.id
            }
        });
        if (!response) {
            return res.status(404).json({ msg: "Pendaftar tidak ditemukan" });
        }
        res.status(200).json(response);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: error.message });
    }
}

export const registerDiklat = async (req, res) => {
    const {
        id_user, nama, tempat_lahir, tanggal_lahir, nik, usia, jenis_kelamin,
        status, alamat_rumah, asal_sekolah_instansi, no_wa_aktif,
        no_telepon_orang_tua, jalur_pendaftaran, jalur_pendaftaran_lainnya,
        jenis_diklat, tau_diklat_dari, tau_diklat_dari_lainnya
    } = req.body;

    try {
        // Cek apakah user ada dan aktif
        const user = await User.findOne({
            where: {
                id: id_user,
                status: true // pastikan status user aktif
            }
        });

        if (!user) {
            return res.status(400).json({ msg: "User tidak ditemukan atau tidak aktif" });
        }

        // Cek apakah user sudah punya satu registrasi diklat
        const existingRegistration = await DaftarDiklat.findOne({
            where: {
                id_user: id_user
            }
        });

        if (existingRegistration) {
            return res.status(400).json({ msg: "User sudah terdaftar dalam diklat" });
        }

        // Jika user aktif dan belum terdaftar, buat registrasi diklat baru
        await DaftarDiklat.create({
            id_user,
            nama,
            tempat_lahir,
            tanggal_lahir,
            nik,
            usia,
            jenis_kelamin,
            status,
            alamat_rumah,
            asal_sekolah_instansi,
            no_wa_aktif,
            no_telepon_orang_tua,
            jalur_pendaftaran,
            jalur_pendaftaran_lainnya,
            jenis_diklat,
            tau_diklat_dari,
            tau_diklat_dari_lainnya
        });

        const pdfBytes = await createDiklatPDF(req.body);
        const fileName = `${nama}_Diklat_Registration.pdf`;
        await uploadToGoogleDrive(pdfBytes, fileName);

        res.status(201).json({ msg: "Registrasi diklat berhasil" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: error.message });
    }
};

export const updateRegistrasi = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updated = await DaftarDiklat.update(updateData, {
            where: { id }
        });

        if (updated[0] === 0) {
            return res.status(404).json({ msg: "Data Pendaftaran tidak ditemukan" });
        }

        res.status(200).json({ msg: "Data Pendaftaran berhasil diubah!" });
    } catch (error) {
        console.error("Error updating data:", error.message);
        res.status(500).json({ error: error.message });
    }
};

export const deleteRegistrasi = async(req, res) => {
    try {
        const deleted = await DaftarDiklat.destroy({
            where:{
                id: req.params.id
            }
        });
        if (deleted === 0) {
            return res.status(404).json({ msg: "Registrasi tidak ditemukan" });
        }
        res.status(200).json({ msg: "Registrasi dibatalkan" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: error.message });
    }
}
