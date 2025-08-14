import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, executeQuery, executeUpdate, type Env } from '@/lib/db';
import type { Todo, CreateTodoRequest, ApiResponse } from '@/types';

export const runtime = 'edge';

export default async function handler(
  request: NextApiRequest & { env?: Env },
  response: NextApiResponse<ApiResponse<Todo | Todo[]>>
) {
  const env = (request as any).env as Env;
  
  if (!env?.DB) {
    return response.status(500).json({
      success: false,
      error: 'Database not available'
    });
  }

  const db = getDb(env);
  const method = request.method;

  try {
    switch (method) {
      case 'GET': {
        const todos = await executeQuery<Todo>(
          db,
          'SELECT * FROM todos ORDER BY completed ASC, created_at DESC'
        );
        return response.status(200).json({
          success: true,
          data: todos
        });
      }

      case 'POST': {
        const { task }: CreateTodoRequest = request.body;
        
        if (!task?.trim()) {
          return response.status(400).json({
            success: false,
            error: 'Task is required'
          });
        }

        const result = await executeUpdate(
          db,
          'INSERT INTO todos (task, updated_at) VALUES (?, CURRENT_TIMESTAMP)',
          [task.trim()]
        );

        if (!result.success) {
          throw new Error('Failed to create todo');
        }

        const newTodo = await executeQuery<Todo>(
          db,
          'SELECT * FROM todos WHERE id = ?',
          [result.meta.last_row_id]
        );

        return response.status(201).json({
          success: true,
          data: newTodo[0]
        });
      }

      default:
        return response.status(405).json({
          success: false,
          error: 'Method not allowed'
        });
    }
  } catch (error) {
    console.error('Todos API error:', error);
    return response.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}