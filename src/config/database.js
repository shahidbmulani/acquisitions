import { neon } from '@neondatabase/serverless';
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';

const sql  = neon(process.env.DATABASE_URL);

const db = drizzle(sql);

export { db, sql };