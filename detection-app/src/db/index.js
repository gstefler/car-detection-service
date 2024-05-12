import mariadb from 'mariadb'

const pool = mariadb.createPool({
    host: 'mariadb',
    user: 'root',
    password: 'password',
    connectionLimit: 5,
    database: 'history'
});

const tableName = 'detections'

const createTable = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
        id VARCHAR(255) PRIMARY KEY,
        label VARCHAR(255),
        numberOfCars INT,
        annotatedFileName VARCHAR(255),
        uploadedAt TIMESTAMP,
        createdAt TIMESTAMP
    );
`

async function init() {
    console.log('Creating table...')
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query(createTable);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.end();
    }
}

async function insertDetection(detection) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `
            INSERT INTO ${tableName} (id, label, numberOfCars, annotatedFileName, uploadedAt, createdAt)
            VALUES (?, ?, ?, ?, ?, ?)
        `
        await conn.query(query, [detection.id, detection.label, detection.numberOfCars, detection.annotatedFileName, detection.uploadedAt, detection.createdAt]);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.end();
    }
}

export {
    init,
    insertDetection
}