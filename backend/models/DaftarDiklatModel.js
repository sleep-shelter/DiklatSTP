import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Users from "./UserModel.js"; // Import the Users model

const { DataTypes } = Sequelize;

const DaftarDiklat = db.define('DaftarDiklat', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    id_user: {
        type: DataTypes.INTEGER,
        references: {
            model: Users,
            key: 'id'
        },
        allowNull: false
    },
    nama: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tempat_lahir: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tanggal_lahir: {
        type: DataTypes.DATE,
        allowNull: false
    },
    nik: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    usia: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    jenis_kelamin: {
        type: DataTypes.ENUM('Laki-laki', 'Perempuan'),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('Menikah', 'Belum Menikah'),
        allowNull: false
    },
    alamat_rumah: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    asal_sekolah_instansi: {
        type: DataTypes.STRING,
        allowNull: false
    },
    no_wa_aktif: {
        type: DataTypes.STRING,
        allowNull: false
    },
    no_telepon_orang_tua: {
        type: DataTypes.STRING,
        allowNull: false
    },
    jalur_pendaftaran: {
        type: DataTypes.ENUM('APBN', 'APBD', 'Mandiri', 'Yang Lain'),
        allowNull: false
    },
    jalur_pendaftaran_lainnya: {
        type: DataTypes.STRING,
        allowNull: true
    },
    jenis_diklat: {
        type: DataTypes.TEXT, // Menggunakan TEXT untuk menyimpan array sebagai string
        allowNull: false,
        get() {
            const rawValue = this.getDataValue('jenis_diklat');
            return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
            this.setDataValue('jenis_diklat', JSON.stringify(value));
        }
    },
    tau_diklat_dari: {
        type: DataTypes.ENUM('Instagram', 'Whatsapp', 'Website', 'Sosialisasi', 'Brosur/Pamflet', 'Baliho', 'Sekolah', 'Keluarga', 'Teman', 'Yang Lain'),
        allowNull: false
    },
    tau_diklat_dari_lainnya: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    freezeTableName: true,
    timestamps: false
});

Users.hasMany(DaftarDiklat, { foreignKey: 'id_user' });
DaftarDiklat.belongsTo(Users, { foreignKey: 'id_user' });

export default DaftarDiklat;

(async () => {
    await db.sync();
})();
