import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import bcrypt from 'bcryptjs';

const { DataTypes } = Sequelize;

const User = db.define('users', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW,
        onUpdate: Sequelize.NOW,
    },
    last_login: {
        type: DataTypes.DATE,
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'user'
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    refresh_token: {
        type: DataTypes.TEXT
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    freezeTableName: true,
    timestamps: false,
});

User.prototype.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

export default User;

(async () => {
    await db.sync();
})();
