import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, executeQuery, executeUpdate, type Env } from '@/lib/db';
import type { Todo, UpdateTodoRequest, ApiResponse } from '@/types';

export const runtime = 'edge';

export default async function handler(
  request: NextApiRequest & { env?: Env },
  response: NextApiResponse<ApiResponse<Todo | null>>
) {
  const env = (request as any).env as Env;
  
  if (!env?.DB) {
    return response.status(500).json({
      success: false,
      error: 'Database not available'
    });
  }

  const db = getDb(env);
  const { id } = request.query;
  const method = request.method;

  if (!id || Array.isArray(id)) {
    return response.status(400).json({
      success: false,
      error: 'Invalid todo ID'
    });
  }

  const todoId = parseInt(id, 10);
  if (isNaN(todoId)) {
    return response.status(400).json({
      success: false,
      error: 'Invalid todo ID format'
    });
  }

  try {
    switch (method) {
      case 'GET': {
        const todos = await executeQuery<Todo>(
          db,
          'SELECT * FROM todos WHERE id = ?',
          [todoId]
        );

        if (todos.length === 0) {
          return response.status(404).json({
            success: false,
            error: 'Todo not found'
          });
        }

        return response.status(200).json({
          success: true,
          data: todos[0]
        });
      }

      case 'PUT': {
        const { task, completed }: UpdateTodoRequest = request.body;

        if (task !== undefined && !task?.trim()) {
          return response.status(400).json({
            success: false,
            error: 'Task cannot be empty'
          });
        }

        // Check if todo exists
        const existingTodos = await executeQuery<Todo>(
          db,
          'SELECT id FROM todos WHERE id = ?',
          [todoId]
        );

        if (existingTodos.length === 0) {
          return response.status(404).json({
            success: false,
            error: 'Todo not found'
          });
        }

        // Build update query dynamically
        const updates: string[] = [];
        const values: any[] = [];

        if (task !== undefined) {
          updates.push('task = ?');
          values.push(task.trim());
        }

        if (completed !== undefined) {
          updates.push('completed = ?');
          values.push(completed ? 1 : 0);
        }

        if (updates.length === 0) {
          return response.status(400).json({
            success: false,
            error: 'No fields to update'
          });
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(todoId);

        const result = await executeUpdate(
          db,
          `UPDATE todos SET ${updates.join(', ')} WHERE id = ?`,
          values
        );

        if (!result.success) {
          throw new Error('Failed to update todo');
        }

        const updatedTodo = await executeQuery<Todo>(
          db,
          'SELECT * FROM todos WHERE id = ?',
          [todoId]
        );

        return response.status(200).json({
          success: true,
          data: updatedTodo[0]
        });
      }

      case 'DELETE': {
        // Check if todo exists
        const existingTodos = await executeQuery<Todo>(
          db,
          'SELECT id FROM todos WHERE id = ?',
          [todoId]
        );

        if (existingTodos.length === 0) {
          return response.status(404).json({
            success: false,
            error: 'Todo not found'
          });
        }

        const result = await executeUpdate(
          db,
          'DELETE FROM todos WHERE id = ?',
          [todoId]
        );

        if (!result.success) {
          throw new Error('Failed to delete todo');
        }

        return response.status(200).json({
          success: true,
          data: null
        });
      }

      default:
        return response.status(405).json({
          success: false,
          error: 'Method not allowed'
        });
    }
  } catch (error) {
    console.error('Todo API error:', error);
    return response.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}