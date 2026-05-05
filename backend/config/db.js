const mysql = require('mysql2/promise');

let pool;

function getDbConfig() {
    return {
        host: process.env.MYSQL_HOST || 'localhost',
        port: Number(process.env.MYSQL_PORT || 3306),
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'delivery_tracking',
        waitForConnections: true,
        connectionLimit: Number(process.env.MYSQL_POOL_SIZE || 10)
    };
}

async function ensureDatabaseExists(config) {
    const adminConnection = await mysql.createConnection({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password
    });

    try {
        const dbName = String(config.database || 'delivery_tracking').replace(/`/g, '``');
        await adminConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    } finally {
        await adminConnection.end();
    }
}

async function initializeSchema() {
    await pool.execute(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(100) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            role ENUM('manager', 'delivery', 'customer') NOT NULL DEFAULT 'customer',
            name VARCHAR(150),
            email VARCHAR(150) UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
    `);

    await pool.execute(`
        CREATE TABLE IF NOT EXISTS orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            tracking_id VARCHAR(120) NOT NULL UNIQUE,
            customer_name VARCHAR(150),
            pickup_address TEXT,
            delivery_address TEXT,
            pickup_lat DOUBLE,
            pickup_lon DOUBLE,
            delivery_lat DOUBLE,
            delivery_lon DOUBLE,
            status VARCHAR(50) NOT NULL DEFAULT 'Pending',
            eta VARCHAR(50),
            delivery_partner VARCHAR(150),
            assigned_to INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            CONSTRAINT fk_orders_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB;
    `);

    await pool.execute(`
        CREATE TABLE IF NOT EXISTS trips (
            id INT AUTO_INCREMENT PRIMARY KEY,
            trip_id VARCHAR(120) NOT NULL UNIQUE,
            driver_id INT NOT NULL,
            status ENUM('pending', 'assigned', 'in-progress', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
            start_time DATETIME NULL,
            end_time DATETIME NULL,
            current_lat DOUBLE NULL,
            current_lng DOUBLE NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            CONSTRAINT fk_trips_driver_id FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB;
    `);

    await pool.execute(`
        CREATE TABLE IF NOT EXISTS trip_orders (
            trip_id INT NOT NULL,
            order_id INT NOT NULL,
            PRIMARY KEY (trip_id, order_id),
            CONSTRAINT fk_trip_orders_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
            CONSTRAINT fk_trip_orders_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        ) ENGINE=InnoDB;
    `);
}

async function connectDB() {
    try {
        const dbConfig = getDbConfig();
        await ensureDatabaseExists(dbConfig);

        pool = mysql.createPool(dbConfig);

        await pool.query('SELECT 1');
        await initializeSchema();
        console.log('MySQL connected');
    } catch (err) {
        console.error('MySQL connection error:', err);
        process.exit(1);
    }
}

function getPool() {
    if (!pool) {
        throw new Error('MySQL pool not initialized. Call connectDB() first.');
    }
    return pool;
}

async function query(sql, params = []) {
    const [rows] = await getPool().execute(sql, params);
    return rows;
}

module.exports = {
    connectDB,
    query,
    getPool
};