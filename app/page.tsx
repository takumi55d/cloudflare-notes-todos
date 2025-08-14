'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, FileText, CheckSquare, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import type { Note, Todo } from '@/types';
import { notesApi, todosApi, ApiError } from '@/lib/api';

export default function HomePage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [isCreatingTodo, setIsCreatingTodo] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [newTodo, setNewTodo] = useState({ task: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [notesData, todosData] = await Promise.all([
        notesApi.getAll(),
        todosApi.getAll()
      ]);
      setNotes(notesData);
      setTodos(todosData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.title.trim()) return;

    try {
      setIsCreatingNote(true);
      const createdNote = await notesApi.create(newNote);
      setNotes(prev => [createdNote, ...prev]);
      setNewNote({ title: '', content: '' });
      toast.success('Note created successfully');
    } catch (error) {
      console.error('Failed to create note:', error);
      toast.error(error instanceof ApiError ? error.message : 'Failed to create note');
    } finally {
      setIsCreatingNote(false);
    }
  };

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.task.trim()) return;

    try {
      setIsCreatingTodo(true);
      const createdTodo = await todosApi.create(newTodo);
      setTodos(prev => [createdTodo, ...prev]);
      setNewTodo({ task: '' });
      toast.success('Todo created successfully');
    } catch (error) {
      console.error('Failed to create todo:', error);
      toast.error(error instanceof ApiError ? error.message : 'Failed to create todo');
    } finally {
      setIsCreatingTodo(false);
    }
  };

  const handleToggleTodo = async (id: number, completed: boolean) => {
    try {
      const updatedTodo = await todosApi.update(id, { completed });
      setTodos(prev => prev.map(todo => 
        todo.id === id ? updatedTodo : todo
      ));
      toast.success(`Todo ${completed ? 'completed' : 'reopened'}`);
    } catch (error) {
      console.error('Failed to update todo:', error);
      toast.error('Failed to update todo');
    }
  };

  const handleDeleteNote = async (id: number) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await notesApi.delete(id);
      setNotes(prev => prev.filter(note => note.id !== id));
      toast.success('Note deleted successfully');
    } catch (error) {
      console.error('Failed to delete note:', error);
      toast.error('Failed to delete note');
    }
  };

  const handleDeleteTodo = async (id: number) => {
    if (!confirm('Are you sure you want to delete this todo?')) return;

    try {
      await todosApi.delete(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));
      toast.success('Todo deleted successfully');
    } catch (error) {
      console.error('Failed to delete todo:', error);
      toast.error('Failed to delete todo');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your notes and todos...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Notes & Todos
        </h1>
        <p className="text-gray-600">
          Organize your thoughts and tasks efficiently
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="todos">Todos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Notes */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recent Notes
                </CardTitle>
                <Badge variant="secondary">{notes.length}</Badge>
              </CardHeader>
              <CardContent>
                {notes.slice(0, 3).map((note) => (
                  <Link key={note.id} href={`/notes/${note.id}`}>
                    <div className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer border-b last:border-b-0">
                      <h4 className="font-medium text-sm text-gray-900 truncate">
                        {note.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(note.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                ))}
                {notes.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No notes yet. Create your first note!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Recent Todos */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" />
                  Todo Progress
                </CardTitle>
                <Badge variant="secondary">{todos.length}</Badge>
              </CardHeader>
              <CardContent>
                {todos.slice(0, 3).map((todo) => (
                  <div key={todo.id} className="flex items-center space-x-3 p-2">
                    <Checkbox
                      checked={todo.completed === 1}
                      onCheckedChange={(checked) => handleToggleTodo(todo.id, !!checked)}
                    />
                    <span className={`text-sm flex-1 ${
                      todo.completed === 1 ? 'line-through text-gray-500' : 'text-gray-900'
                    }`}>
                      {todo.task}
                    </span>
                  </div>
                ))}
                {todos.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No todos yet. Add your first task!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notes">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">All Notes</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Note
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Note</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateNote} className="space-y-4">
                  <Input
                    placeholder="Note title..."
                    value={newNote.title}
                    onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                  <Textarea
                    placeholder="Write your note..."
                    value={newNote.content}
                    onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                    rows={4}
                  />
                  <Button type="submit" disabled={isCreatingNote} className="w-full">
                    {isCreatingNote ? 'Creating...' : 'Create Note'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <Card key={note.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold truncate">
                      {note.title}
                    </CardTitle>
                    <div className="flex space-x-1">
                      <Link href={`/notes/${note.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                    {note.content || 'No content'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(note.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {notes.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No notes yet</p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Create your first note</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Note</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateNote} className="space-y-4">
                    <Input
                      placeholder="Note title..."
                      value={newNote.title}
                      onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                    <Textarea
                      placeholder="Write your note..."
                      value={newNote.content}
                      onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                      rows={4}
                    />
                    <Button type="submit" disabled={isCreatingNote} className="w-full">
                      {isCreatingNote ? 'Creating...' : 'Create Note'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </TabsContent>

        <TabsContent value="todos">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Todo List</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Todo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Todo</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateTodo} className="space-y-4">
                  <Input
                    placeholder="What needs to be done?"
                    value={newTodo.task}
                    onChange={(e) => setNewTodo(prev => ({ ...prev, task: e.target.value }))}
                    required
                  />
                  <Button type="submit" disabled={isCreatingTodo} className="w-full">
                    {isCreatingTodo ? 'Creating...' : 'Create Todo'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {todos.map((todo) => (
              <Card key={todo.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <Checkbox
                      checked={todo.completed === 1}
                      onCheckedChange={(checked) => handleToggleTodo(todo.id, !!checked)}
                    />
                    <span className={`flex-1 ${
                      todo.completed === 1 ? 'line-through text-gray-500' : 'text-gray-900'
                    }`}>
                      {todo.task}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={todo.completed === 1 ? 'secondary' : 'default'}>
                      {todo.completed === 1 ? 'Done' : 'Pending'}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteTodo(todo.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {todos.length === 0 && (
            <div className="text-center py-12">
              <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No todos yet</p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Add your first todo</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Todo</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateTodo} className="space-y-4">
                    <Input
                      placeholder="What needs to be done?"
                      value={newTodo.task}
                      onChange={(e) => setNewTodo(prev => ({ ...prev, task: e.target.value }))}
                      required
                    />
                    <Button type="submit" disabled={isCreatingTodo} className="w-full">
                      {isCreatingTodo ? 'Creating...' : 'Create Todo'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}