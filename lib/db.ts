import mysql, { Pool } from 'mysql2/promise';

declare global {
  var _mysqlPool: Pool | undefined;
}

/**
 * Creates and configures a MySQL connection pool.
 * Supports local MySQL as well as TiDB Cloud with TLS/SSL encryption.
 */
function createDatabasePool(): Pool {
  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'job_portal';

  // Enable SSL if explicitly configured or connecting to TiDB Cloud
  const isSslEnabled =
    process.env.DB_SSL === 'true' ||
    process.env.DB_SSL === '1' ||
    (typeof host === 'string' && host.includes('tidbcloud.com'));

  const poolOptions: mysql.PoolOptions = {
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    ssl: isSslEnabled
      ? {
          minVersion: 'TLSv1.2',
          rejectUnauthorized: true,
        }
      : undefined,
  };

  return mysql.createPool(poolOptions);
}

// Preserve connection pool across hot-reloads and warm serverless invocations
const pool: Pool = globalThis._mysqlPool || createDatabasePool();

if (process.env.NODE_ENV !== 'production') {
  globalThis._mysqlPool = pool;
} else {
  globalThis._mysqlPool = pool;
}

/**
 * Execute a SQL query with parameters.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function query<T = any>(sql: string, params?: any): Promise<T> {
  const [rows] = await pool.execute(sql, params);
  return rows as T;
}

/**
 * Test database connection.
 */
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    console.error('MySQL connection error:', error);
    return false;
  }
}

export default pool;
