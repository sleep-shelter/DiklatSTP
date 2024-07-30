import DaftarDiklat from '../models/DaftarDiklatModel.js';
import User from "../models/UserModel.js";
import { dataValid } from "../validation/dataValidation.js";
import { createDiklatPDF } from '../services/pdfService.js';
import { uploadToGoogleDrive } from '../services/googleDriveService.js';

export const getPendaftar = async (req, res) => {
    try {
        const response = await DaftarDiklat.findAll();
        res.status(200).json(response);
    } catch (error) {
        console.error(`Error fetching pendaftar: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

export const getPendaftarById = async (req, res) => {
    try {
        const response = await DaftarDiklat.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!response) {
            return res.status(404).json({ msg: "Pendaftar tidak ditemukan" });
        }
        res.status(200).json(response);
    } catch (error) {
        console.error(`Error fetching pendaftar by ID: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

const validationRules = {
    id_user: "required",
    nama: "required",
    tempat_lahir: "required",
    tanggal_lahir: "required",
    nik: "required",
    usia: "required",
    jenis_kelamin: "required",
    status: "required",
    alamat_rumah: "required",
    asal_sekolah_instansi: "required",
    no_wa_aktif: "required",
    no_telepon_orang_tua: "required",
    jalur_pendaftaran: "required",
    jenis_diklat: "required",
    tau_diklat_dari: "required"
};

export const registerDiklat = async (req, res) => {
    const {
        id_user, nama, tempat_lahir, tanggal_lahir, nik, usia, jenis_kelamin,
        status, alamat_rumah, asal_sekolah_instansi, no_wa_aktif,
        no_telepon_orang_tua, jalur_pendaftaran, jalur_pendaftaran_lainnya,
        jenis_diklat, tau_diklat_dari, tau_diklat_dari_lainnya
    } = req.body;

    // Validasi data
    const { message, data } = await dataValid(validationRules, req.body);

    if (message.length > 0) {
        return res.status(400).json({ errors: message });
    }

    try {
        // Cek apakah user ada dan aktif
        const user = await User.findOne({
            where: {
                id: id_user,
                status: true // pastikan status user aktif
            }
        });

        if (!user) {
            console.error("User tidak ditemukan atau tidak aktif");
            return res.status(400).json({ msg: "User tidak ditemukan atau tidak aktif" });
        }

        // Cek apakah user sudah punya satu registrasi diklat
        const existingRegistration = await DaftarDiklat.findOne({
            where: {
                id_user: id_user
            }
        });

        if (existingRegistration) {
            console.error("User sudah terdaftar dalam diklat");
            return res.status(400).json({ msg: "User sudah terdaftar dalam diklat" });
        }

        // Convert id_user and usia to integer if provided
        const idUserInt = parseInt(data.id_user, 10);
        const usiaInt = parseInt(data.usia, 10);

        // Convert jenis_diklat to array if needed
        const jenis_diklatArray = Array.isArray(data.jenis_diklat) ? data.jenis_diklat : data.jenis_diklat.split(',');

        // Convert tanggal_lahir to Date object and format to YYYY-MM-DD
        const tanggalLahirDate = new Date(data.tanggal_lahir.split('T')[0]);
        const formattedTanggalLahir = tanggalLahirDate.toISOString().split('T')[0];

        // Prepare registration data
        const registrationData = {
            id_user: idUserInt,
            nama: data.nama,
            tempat_lahir: data.tempat_lahir,
            tanggal_lahir: formattedTanggalLahir,
            nik: data.nik,
            usia: usiaInt,
            jenis_kelamin: data.jenis_kelamin,
            status: data.status,
            alamat_rumah: data.alamat_rumah,
            asal_sekolah_instansi: data.asal_sekolah_instansi,
            no_wa_aktif: data.no_wa_aktif,
            no_telepon_orang_tua: data.no_telepon_orang_tua,
            jalur_pendaftaran: data.jalur_pendaftaran,
            jalur_pendaftaran_lainnya: data.jalur_pendaftaran_lainnya || null,
            jenis_diklat: jenis_diklatArray,
            tau_diklat_dari: data.tau_diklat_dari,
            tau_diklat_dari_lainnya: data.tau_diklat_dari_lainnya || null
        };

        // Create a new registration
        await DaftarDiklat.create(registrationData);

        // Create PDF and upload
        const pdfBytes = await createDiklatPDF(data);
        const fileName = `${data.nama}_Diklat_Registration.pdf`;
        await uploadToGoogleDrive(pdfBytes, fileName);

        res.status(201).json({ msg: "Registrasi diklat berhasil" });
    } catch (error) {
        console.error(`Error registering diklat: ${error.message}`);
        console.error('Error details:', error); // Log error details
        res.status(500).json({ error: error.message });
    }
};

export const updateRegistrasi = async (req, res) => {
    const { id } = req.params;
    const {
        id_user, nama, tempat_lahir, tanggal_lahir, nik, usia, jenis_kelamin,
        status, alamat_rumah, asal_sekolah_instansi, no_wa_aktif,
        no_telepon_orang_tua, jalur_pendaftaran, jalur_pendaftaran_lainnya,
        jenis_diklat, tau_diklat_dari, tau_diklat_dari_lainnya
    } = req.body;

    // Validasi data
    const { message, data } = await dataValid(validationRules, req.body);

    if (message.length > 0) {
        return res.status(400).json({ errors: message });
    }

    try {
        // Convert id_user and usia to integer if provided
        const idUserInt = data.id_user ? parseInt(data.id_user, 10) : undefined;
        const usiaInt = data.usia ? parseInt(data.usia, 10) : undefined;

        // Convert jenis_diklat to array if needed
        const jenis_diklatArray = data.jenis_diklat ? data.jenis_diklat.split(',') : [];

        // Convert tanggal_lahir to Date object and format to YYYY-MM-DD
        const tanggalLahirDate = data.tanggal_lahir ? new Date(data.tanggal_lahir.split('T')[0]) : undefined;
        const formattedTanggalLahir = tanggalLahirDate ? tanggalLahirDate.toISOString().split('T')[0] : undefined;

        // Prepare update data
        const updateData = {
            id_user: idUserInt,
            nama: data.nama,
            tempat_lahir: data.tempat_lahir,
            tanggal_lahir: formattedTanggalLahir,
            nik: data.nik,
            usia: usiaInt,
            jenis_kelamin: data.jenis_kelamin,
            status: data.status,
            alamat_rumah: data.alamat_rumah,
            asal_sekolah_instansi: data.asal_sekolah_instansi,
            no_wa_aktif: data.no_wa_aktif,
            no_telepon_orang_tua: data.no_telepon_orang_tua,
            jalur_pendaftaran: data.jalur_pendaftaran,
            jalur_pendaftaran_lainnya: data.jalur_pendaftaran_lainnya || null,
            jenis_diklat: jenis_diklatArray,
            tau_diklat_dari: data.tau_diklat_dari,
            tau_diklat_dari_lainnya: data.tau_diklat_dari_lainnya || null
        };

        // Remove undefined properties
        for (const key in updateData) {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        }

        // Update the record
        const [updated] = await DaftarDiklat.update(updateData, {
            where: { id }
        });

        if (updated === 0) {
            return res.status(404).json({ msg: "Data Pendaftaran tidak ditemukan" });
        }

        res.status(200).json({ msg: "Data Pendaftaran berhasil diubah!" });
    } catch (error) {
        console.error(`Error updating data: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

export const deleteRegistrasi = async (req, res) => {
    try {
        const deleted = await DaftarDiklat.destroy({
            where: {
                id: req.params.id
            }
        });
        if (deleted === 0) {
            console.error("Registrasi tidak ditemukan");
            return res.status(404).json({ msg: "Registrasi tidak ditemukan" });
        }
        res.status(200).json({ msg: "Registrasi dibatalkan" });
    } catch (error) {
        console.error(`Error deleting registrasi: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};
