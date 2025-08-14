import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, executeQuery, executeUpdate, type Env } from '@/lib/db';
import type { Note, UpdateNoteRequest, ApiResponse } from '@/types';

export const runtime = 'edge';

export default async function handler(
  request: NextApiRequest & { env?: Env },
  response: NextApiResponse<ApiResponse<Note | null>>
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
      error: 'Invalid note ID'
    });
  }

  const noteId = parseInt(id, 10);
  if (isNaN(noteId)) {
    return response.status(400).json({
      success: false,
      error: 'Invalid note ID format'
    });
  }

  try {
    switch (method) {
      case 'GET': {
        const notes = await executeQuery<Note>(
          db,
          'SELECT * FROM notes WHERE id = ?',
          [noteId]
        );

        if (notes.length === 0) {
          return response.status(404).json({
            success: false,
            error: 'Note not found'
          });
        }

        return response.status(200).json({
          success: true,
          data: notes[0]
        });
      }

      case 'PUT': {
        const { title, content }: UpdateNoteRequest = request.body;

        if (title !== undefined && !title?.trim()) {
          return response.status(400).json({
            success: false,
            error: 'Title cannot be empty'
          });
        }

        // Check if note exists
        const existingNotes = await executeQuery<Note>(
          db,
          'SELECT id FROM notes WHERE id = ?',
          [noteId]
        );

        if (existingNotes.length === 0) {
          return response.status(404).json({
            success: false,
            error: 'Note not found'
          });
        }

        // Build update query dynamically
        const updates: string[] = [];
        const values: any[] = [];

        if (title !== undefined) {
          updates.push('title = ?');
          values.push(title.trim());
        }

        if (content !== undefined) {
          updates.push('content = ?');
          values.push(content.trim() || '');
        }

        if (updates.length === 0) {
          return response.status(400).json({
            success: false,
            error: 'No fields to update'
          });
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(noteId);

        const result = await executeUpdate(
          db,
          `UPDATE notes SET ${updates.join(', ')} WHERE id = ?`,
          values
        );

        if (!result.success) {
          throw new Error('Failed to update note');
        }

        const updatedNote = await executeQuery<Note>(
          db,
          'SELECT * FROM notes WHERE id = ?',
          [noteId]
        );

        return response.status(200).json({
          success: true,
          data: updatedNote[0]
        });
      }

      case 'DELETE': {
        // Check if note exists
        const existingNotes = await executeQuery<Note>(
          db,
          'SELECT id FROM notes WHERE id = ?',
          [noteId]
        );

        if (existingNotes.length === 0) {
          return response.status(404).json({
            success: false,
            error: 'Note not found'
          });
        }

        const result = await executeUpdate(
          db,
          'DELETE FROM notes WHERE id = ?',
          [noteId]
        );

        if (!result.success) {
          throw new Error('Failed to delete note');
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
    console.error('Note API error:', error);
    return response.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}