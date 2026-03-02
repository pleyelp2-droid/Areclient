import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { GoogleAuth } from 'google-auth-library';

export async function POST() {
  const sourceUrl = process.env.SOURCE_DATABASE_URL;
  const targetUrl = process.env.DATABASE_URL;
  const saKeyJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  if (!sourceUrl || !targetUrl) {
    return NextResponse.json({ error: "Source or Target URL missing" }, { status: 400 });
  }

  let targetConfig: any = { connectionString: targetUrl };

  // If using IAM Authentication with a Service Account Key
  if (saKeyJson) {
    try {
      const auth = new GoogleAuth({
        credentials: JSON.parse(saKeyJson),
        scopes: ['https://www.googleapis.com/auth/sqlservice.admin', 'https://www.googleapis.com/auth/cloud-platform'],
      });
      const client = await auth.getClient();
      const token = await client.getAccessToken();
      
      // Update target URL to use the token as password
      const url = new URL(targetUrl);
      url.password = token.token || '';
      targetConfig.connectionString = url.toString();
      console.log("Using IAM Token for target database authentication");
    } catch (e: any) {
      console.error("Failed to generate IAM token:", e.message);
    }
  }

  const sourcePool = new Pool({ connectionString: sourceUrl, ssl: { rejectUnauthorized: false } });
  const targetPool = new Pool({ 
    ...targetConfig,
    ssl: targetUrl.includes('127.0.0.1') ? false : { rejectUnauthorized: false } 
  });

  try {
    const tables = ['quests', 'npc_profiles', 'lore_entries', 'agents', 'world_state'];
    const results: any = {};

    for (const table of tables) {
      console.log(`Migrating table: ${table}`);
      
      const { rows } = await sourcePool.query(`SELECT * FROM ${table}`);
      
      if (rows.length === 0) {
        results[table] = "Empty";
        continue;
      }

      const keys = Object.keys(rows[0]);
      const columns = keys.join(', ');
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      
      for (const row of rows) {
        const values = keys.map(k => row[k]);
        await targetPool.query(
          `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
          values
        );
      }
      
      results[table] = `Migrated ${rows.length} rows`;
    }

    return NextResponse.json({ status: "Migration Complete", details: results });
  } catch (error: any) {
    console.error("Migration Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await sourcePool.end();
    await targetPool.end();
  }
}
