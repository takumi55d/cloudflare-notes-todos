'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import type { Note } from '@/types';
import { notesApi, ApiError } from '@/lib/api';

export default function NotePage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string, 10);
  
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });

  useEffect(() => {
    if (!isNaN(id)) {
      loadNote();
    } else {
      toast.error('Invalid note ID');
      router.push('/');
    }
  }, [id, router]);

  const loadNote = async () => {
    try {
      setIsLoading(true);
      const noteData = await notesApi.getById(id);
      setNote(noteData);
      setFormData({
        title: noteData.title,
        content: noteData.content
      });
    } catch (error) {
      console.error('Failed to load note:', error);
      if (error instanceof ApiError && error.status === 404) {
        toast.error('Note not found');
      } else {
        toast.error('Failed to load note');
      }
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: 'title' | 'content', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      setIsSaving(true);
      const updatedNote = await notesApi.update(id, {
        title: formData.title,
        content: formData.content
      });
      setNote(updatedNote);
      setHasChanges(false);
      toast.success('Note saved successfully');
    } catch (error) {
      console.error('Failed to save note:', error);
      toast.error(error instanceof ApiError ? error.message : 'Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return;
    }

    try {
      await notesApi.delete(id);
      toast.success('Note deleted successfully');
      router.push('/');
    } catch (error) {
      console.error('Failed to delete note:', error);
      toast.error('Failed to delete note');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      if (hasChanges) {
        handleSave();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading note...</p>
        </div>
      </div>
    );
  }

  if (!note) {
    return null;
  }

  return (
    <div className="min-h-screen" onKeyDown={handleKeyDown}>
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Notes
          </Button>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Note Editor */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-gray-500">
                Last updated: {new Date(note.updated_at).toLocaleString()}
              </CardTitle>
              {hasChanges && (
                <span className="text-sm text-amber-600 font-medium">
                  Unsaved changes
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter note title..."
                className="text-lg font-semibold"
                required
              />
            </div>
            
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Write your note content here..."
                rows={20}
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Keyboard shortcut hint */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Tip: Press <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl+S</kbd> to save
          </p>
        </div>
      </main>
    </div>
  );
}