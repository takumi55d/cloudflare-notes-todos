import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, executeQuery, executeUpdate, type Env } from '@/lib/db';
import type { Note, CreateNoteRequest, ApiResponse } from '@/types';

export const runtime = 'edge';

export default async function handler(
  request: NextApiRequest & { env?: Env },
  response: NextApiResponse<ApiResponse<Note | Note[]>>
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
        const notes = await executeQuery<Note>(
          db,
          'SELECT * FROM notes ORDER BY created_at DESC'
        );
        return response.status(200).json({
          success: true,
          data: notes
        });
      }

      case 'POST': {
        const { title, content }: CreateNoteRequest = request.body;
        
        if (!title?.trim()) {
          return response.status(400).json({
            success: false,
            error: 'Title is required'
          });
        }

        const result = await executeUpdate(
          db,
          'INSERT INTO notes (title, content, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
          [title.trim(), content?.trim() || '']
        );

        if (!result.success) {
          throw new Error('Failed to create note');
        }

        const newNote = await executeQuery<Note>(
          db,
          'SELECT * FROM notes WHERE id = ?',
          [result.meta.last_row_id]
        );

        return response.status(201).json({
          success: true,
          data: newNote[0]
        });
      }

      default:
        return response.status(405).json({
          success: false,
          error: 'Method not allowed'
        });
    }
  } catch (error) {
    console.error('Notes API error:', error);
    return response.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}