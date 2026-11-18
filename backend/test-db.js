
require('dotenv').config();

const pool = require('./config/db');

async function testConnection() {
    try {
        const [rows] = await pool.query(
            'SELECT VERSION() AS mysql_version, DATABASE() AS database_name'
        );

        console.log('DATABASE CONNECTION SUCCESSFUL!');
        console.log(rows[0]);

    } catch (error) {
        console.error('DATABASE CONNECTION FAILED!');
        console.error(error.code || error.message);

    } finally {
        await pool.end();
    }
}

testConnection();

