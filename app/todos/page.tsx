'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { Todo } from '@/types';
import { todosApi, ApiError } from '@/lib/api';

export default function TodosPage() {
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [newTodo, setNewTodo] = useState({ task: '' });
  const [editTask, setEditTask] = useState('');

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      setIsLoading(true);
      const todosData = await todosApi.getAll();
      setTodos(todosData);
    } catch (error) {
      console.error('Failed to load todos:', error);
      toast.error('Failed to load todos. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.task.trim()) return;

    try {
      setIsCreating(true);
      const createdTodo = await todosApi.create(newTodo);
      setTodos(prev => [createdTodo, ...prev]);
      setNewTodo({ task: '' });
      toast.success('Todo created successfully');
    } catch (error) {
      console.error('Failed to create todo:', error);
      toast.error(error instanceof ApiError ? error.message : 'Failed to create todo');
    } finally {
      setIsCreating(false);
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

  const handleEditTodo = async (id: number, newTask: string) => {
    if (!newTask.trim()) {
      toast.error('Task cannot be empty');
      return;
    }

    try {
      const updatedTodo = await todosApi.update(id, { task: newTask });
      setTodos(prev => prev.map(todo => 
        todo.id === id ? updatedTodo : todo
      ));
      setEditingTodo(null);
      setEditTask('');
      toast.success('Todo updated successfully');
    } catch (error) {
      console.error('Failed to update todo:', error);
      toast.error('Failed to update todo');
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

  const startEditing = (todo: Todo) => {
    setEditingTodo(todo);
    setEditTask(todo.task);
  };

  const cancelEditing = () => {
    setEditingTodo(null);
    setEditTask('');
  };

  const pendingTodos = todos.filter(todo => todo.completed === 0);
  const completedTodos = todos.filter(todo => todo.completed === 1);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading todos...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Todo List</h1>
            <p className="text-gray-600">
              {pendingTodos.length} pending • {completedTodos.length} completed
            </p>
          </div>
        </div>
        
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
              <Button type="submit" disabled={isCreating} className="w-full">
                {isCreating ? 'Creating...' : 'Create Todo'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Add Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Quick Add Todo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateTodo} className="flex gap-2">
            <Input
              placeholder="What needs to be done?"
              value={newTodo.task}
              onChange={(e) => setNewTodo(prev => ({ ...prev, task: e.target.value }))}
              className="flex-1"
              required
            />
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Adding...' : 'Add'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Pending Todos */}
      {pendingTodos.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold">
              Pending Tasks
            </CardTitle>
            <Badge variant="secondary">{pendingTodos.length}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingTodos.map((todo) => (
              <div key={todo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3 flex-1">
                  <Checkbox
                    checked={false}
                    onCheckedChange={() => handleToggleTodo(todo.id, true)}
                  />
                  {editingTodo?.id === todo.id ? (
                    <div className="flex items-center space-x-2 flex-1">
                      <Input
                        value={editTask}
                        onChange={(e) => setEditTask(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleEditTodo(todo.id, editTask);
                          } else if (e.key === 'Escape') {
                            cancelEditing();
                          }
                        }}
                        className="flex-1"
                        autoFocus
                      />
                      <Button size="sm" onClick={() => handleEditTodo(todo.id, editTask)}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={cancelEditing}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <span className="flex-1 text-gray-900">{todo.task}</span>
                  )}
                </div>
                {editingTodo?.id !== todo.id && (
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="ghost" onClick={() => startEditing(todo)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteTodo(todo.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Completed Todos */}
      {completedTodos.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold">
              Completed Tasks
            </CardTitle>
            <Badge variant="secondary">{completedTodos.length}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {completedTodos.map((todo) => (
              <div key={todo.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3 flex-1">
                  <Checkbox
                    checked={true}
                    onCheckedChange={() => handleToggleTodo(todo.id, false)}
                  />
                  <span className="flex-1 text-gray-500 line-through">{todo.task}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">Done</Badge>
                  <Button size="sm" variant="ghost" onClick={() => handleDeleteTodo(todo.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {todos.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No todos yet
          </h3>
          <p className="text-gray-600 mb-6">
            Add your first todo to get started with task management
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Todo
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
                <Button type="submit" disabled={isCreating} className="w-full">
                  {isCreating ? 'Creating...' : 'Create Todo'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </main>
  );
}