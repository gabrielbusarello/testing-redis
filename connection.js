const Sequelize = require('sequelize');
const sequelize = new Sequelize('redis_reg', 'root', 'redis', { host: 'db', dialect: 'mysql' });
const DataTypes = Sequelize.DataTypes;

const Notification = sequelize.define('Register', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    channel: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    pub_redis: {
        type: DataTypes.STRING(1, true),
        allowNull: false
    }
}, { tableName: 'registers' });

module.exports.Notification = Notification;