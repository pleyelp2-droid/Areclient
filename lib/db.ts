import { Pool } from 'pg';
import { GoogleAuth } from 'google-auth-library';

let pool: Pool | null = null;

export async function getDbPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    const saKeyJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

    if (!connectionString) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }

    let config: any = {
      connectionString,
      ssl: connectionString.includes('127.0.0.1') ? false : {
        rejectUnauthorized: false,
      },
    };

    // If using IAM Authentication with a Service Account Key
    if (saKeyJson) {
      try {
        const auth = new GoogleAuth({
          credentials: JSON.parse(saKeyJson),
          scopes: ['https://www.googleapis.com/auth/sqlservice.admin', 'https://www.googleapis.com/auth/cloud-platform'],
        });
        const client = await auth.getClient();
        const token = await client.getAccessToken();
        
        // Update connection string to use the token as password
        const url = new URL(connectionString);
        url.password = token.token || '';
        config.connectionString = url.toString();
        console.log("Using IAM Token for database authentication");
      } catch (e: any) {
        console.error("Failed to generate IAM token for main pool:", e.message);
      }
    }

    pool = new Pool(config);
  }
  return pool;
}
