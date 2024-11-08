"use strict";

require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');
const winston = require('winston');

// Initialize database connection
const sequelize = new Sequelize(process.env.DB_URL);

// Logger setup
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

// Define the Plugin model
const PluginDB = sequelize.define('Plugin', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    url: {
        type: DataTypes.TEXT,
        allowNull: false
    }
});

/**
 * Install or update a plugin in the database.
 * @param {string} adres - The URL of the plugin.
 * @param {string} file - The name of the plugin file.
 * @returns {Promise<object>} - The created or updated plugin.
 */
async function installPlugin(adres, file) {
    try {
        const plugin = await PluginDB.findOne({ where: { url: adres } });
        if (plugin) {
            return await plugin.update({ url: adres, name: file });
        } else {
            return await PluginDB.create({ url: adres, name: file });
        }
    } catch (error) {
        logger.error('Error installing plugin:', error);
        throw error;
    }
}

/**
 * Get plugins from the database.
 * @param {string} [name] - The name of the plugin to retrieve. If not provided, all plugins will be retrieved.
 * @returns {Promise<Array|object>} - The retrieved plugin(s).
 */
async function getPlugin(name) {
    try {
        if (name) {
            return await PluginDB.findOne({ where: { name } });
        } else {
            return await PluginDB.findAll();
        }
    } catch (error) {
        logger.error('Error retrieving plugin(s):', error);
        throw error;
    }
}

module.exports = { PluginDB, installPlugin, getPlugin };
