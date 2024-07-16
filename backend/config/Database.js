import { Sequelize } from "sequelize";

const db = new Sequelize('diklatstp','root','12345678',{
    host: 'localhost',
    dialect: 'mysql',
    timezone: '+07:00', // Zona waktu Asia/Jakarta
    dialectOptions: {
        timezone: '+07:00', // Zona waktu Asia/Jakarta untuk MySQL
    },
});

export default db;
