import { Pool } from 'pg';
import { GoogleAuth } from 'google-auth-library';

let pool: Pool | null = null;

export async function getDbPool() {
  if (!pool) {
    // In preview environment, we might want to fallback to source if target is unreachable
    const targetUrl = process.env.DATABASE_URL;
    const sourceUrl = process.env.SOURCE_DATABASE_URL;
    const saKeyJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

    // Determine which URL to try first
    // If we are in the AI Studio preview, the private IP 10.46.0.3 will fail.
    const isPreview = process.env.NEXT_PUBLIC_APP_URL?.includes('run.app');
    const connectionString = (isPreview && sourceUrl) ? sourceUrl : (targetUrl || sourceUrl);

    if (!connectionString) {
      console.error('No database URL defined (DATABASE_URL or SOURCE_DATABASE_URL)');
      return null;
    }

    let config: any = {
      connectionString,
      connectionTimeoutMillis: 5000, // Don't hang forever
      ssl: connectionString.includes('10.46.0.3') || connectionString.includes('127.0.0.1') ? false : {
        rejectUnauthorized: false,
      },
    };

    // IAM Authentication logic for Google Cloud SQL
    if (saKeyJson && connectionString.includes('10.46.0.3')) {
      try {
        const auth = new GoogleAuth({
          credentials: JSON.parse(saKeyJson),
          scopes: ['https://www.googleapis.com/auth/sqlservice.admin', 'https://www.googleapis.com/auth/cloud-platform'],
        });
        const client = await auth.getClient();
        const token = await client.getAccessToken();
        
        // Robust parsing for double-@ connection strings
        // Format: postgresql://USER@PROJECT@HOST:PORT/DB
        const parts = connectionString.split('@');
        if (parts.length >= 3) {
          const user = parts[0].replace('postgresql://', '') + '@' + parts[1];
          const hostPortDb = parts[2];
          const [hostPort, db] = hostPortDb.split('/');
          const [host, port] = hostPort.split(':');
          
          config = {
            user,
            password: token.token || '',
            host,
            port: parseInt(port || '5432'),
            database: db || 'postgres',
            connectionTimeoutMillis: 5000,
            ssl: false
          };
        }
        console.log("Generated IAM Token for database authentication");
      } catch (e: any) {
        console.error("IAM Token generation failed:", e.message);
      }
    }

    try {
      pool = new Pool(config);
      // Test connection briefly
      const client = await pool.connect();
      client.release();
      console.log(`Connected to database: ${connectionString.split('@')[1]?.split('/')[0] || 'unknown'}`);
    } catch (err: any) {
      console.error("Database connection failed, using mock/null pool:", err.message);
      pool = null; // Reset so we can try again or handle null
    }
  }
  return pool;
}
