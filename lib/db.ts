export interface Env {
  DB: D1Database;
}

export class DatabaseError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export function getDb(env: Env): D1Database {
  if (!env.DB) {
    throw new DatabaseError('Database binding not found');
  }
  return env.DB;
}

export async function executeQuery<T>(
  db: D1Database,
  query: string,
  params: any[] = []
): Promise<T[]> {
  try {
    const result = await db.prepare(query).bind(...params).all();
    return (result.results as T[]) || [];
  } catch (error) {
    console.error('Database query error:', error);
    throw new DatabaseError(
      'Failed to execute database query',
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

export async function executeUpdate(
  db: D1Database,
  query: string,
  params: any[] = []
): Promise<D1Result> {
  try {
    return await db.prepare(query).bind(...params).run();
  } catch (error) {
    console.error('Database update error:', error);
    throw new DatabaseError(
      'Failed to execute database update',
      error instanceof Error ? error : new Error(String(error))
    );
  }
}