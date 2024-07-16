'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('DaftarDiklat', 'daftardiklat_ibfk_1');

    await queryInterface.changeColumn('DaftarDiklat', 'id_user', {
      type: Sequelize.INTEGER,
      allowNull: false
    });

    await queryInterface.addConstraint('DaftarDiklat', {
      fields: ['id_user'],
      type: 'foreign key',
      name: 'daftardiklat_ibfk_1',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('DaftarDiklat', 'daftardiklat_ibfk_1');

    await queryInterface.changeColumn('DaftarDiklat', 'id_user', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addConstraint('DaftarDiklat', {
      fields: ['id_user'],
      type: 'foreign key',
      name: 'daftardiklat_ibfk_1',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  }
};
