'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ubah kolom yang ada
    await queryInterface.changeColumn('users', 'id', {
      type: Sequelize.INTEGER,
      autoIncrement: true,
    });

    // Ubah kolom lainnya
    await queryInterface.changeColumn('users', 'username', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    });

    await queryInterface.changeColumn('users', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    });

    await queryInterface.changeColumn('users', 'password', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('users', 'first_name', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('users', 'last_name', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('users', 'created_at', {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });

    await queryInterface.changeColumn('users', 'updated_at', {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });

    await queryInterface.changeColumn('users', 'last_login', {
      type: Sequelize.DATE
    });

    await queryInterface.changeColumn('users', 'role', {
      type: Sequelize.STRING,
      defaultValue: 'user'
    });

    await queryInterface.changeColumn('users', 'status', {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Jika perlu rollback, misalnya drop tabel users
    await queryInterface.dropTable('users');
  }
};
