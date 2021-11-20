//jshint esversion:6
require("dotenv").config();

const Sequelize = require("sequelize");

const sequelize = new Sequelize("test-db", process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD, {
    host: "127.0.0.1",
    dialect: "mysql",
});

module.exports = sequelize;