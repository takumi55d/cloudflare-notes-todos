import type { Note, Todo, CreateNoteRequest, UpdateNoteRequest, CreateTodoRequest, UpdateTodoRequest, ApiResponse } from '@/types';

const API_BASE = '/api';

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    const data: ApiResponse<T> = await response.json();

    if (!data.success) {
      throw new ApiError(data.error || 'API request failed', response.status);
    }

    return data.data!;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('API request failed:', error);
    throw new ApiError('Network request failed');
  }
}

// Notes API
export const notesApi = {
  getAll: (): Promise<Note[]> => fetchApi('/notes'),
  
  getById: (id: number): Promise<Note> => fetchApi(`/notes/${id}`),
  
  create: (data: CreateNoteRequest): Promise<Note> =>
    fetchApi('/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: number, data: UpdateNoteRequest): Promise<Note> =>
    fetchApi(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: number): Promise<null> =>
    fetchApi(`/notes/${id}`, {
      method: 'DELETE',
    }),
};

// Todos API
export const todosApi = {
  getAll: (): Promise<Todo[]> => fetchApi('/todos'),
  
  getById: (id: number): Promise<Todo> => fetchApi(`/todos/${id}`),
  
  create: (data: CreateTodoRequest): Promise<Todo> =>
    fetchApi('/todos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: number, data: UpdateTodoRequest): Promise<Todo> =>
    fetchApi(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: number): Promise<null> =>
    fetchApi(`/todos/${id}`, {
      method: 'DELETE',
    }),
};

export { ApiError };