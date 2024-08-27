
import { Pool } from 'pg';

export function setupDatabase(): Pool {
  return new Pool({
    // database connection details
  });
}