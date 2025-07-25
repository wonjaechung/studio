'use client';

import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Edit2, X } from 'lucide-react';
import RichEditor from './RichEditor';
import { saveStudyNote, getStudyNotes, StudyNote } from '@/api/studyPlan';
import { useAuth } from '@/contexts/AuthContext';
import { subjects } from '@/data/subjects';

export default function StudyPlanWidget() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [selectedNote, setSelectedNote] = useState<StudyNote | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    subject: 'ap-statistics',
    tags: [] as string[]
  });

  useEffect(() => {
    if (user) {
      loadNotes();
    }
  }, [user]);

  const loadNotes = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const fetchedNotes = await getStudyNotes(user.uid);
      setNotes(fetchedNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditForm({
      title: '',
      content: '',
      subject: 'ap-statistics',
      tags: []
    });
    setIsCreating(true);
    setIsEditing(true);
    setSelectedNote(null);
  };

  const handleEdit = (note: StudyNote) => {
    setEditForm({
      title: note.title,
      content: note.content,
      subject: note.subject,
      tags: note.tags
    });
    setSelectedNote(note);
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleSave = async () => {
    if (!user || !editForm.title.trim()) return;

    setLoading(true);
    try {
      const noteData: StudyNote = {
        ...selectedNote,
        userId: user.uid,
        title: editForm.title,
        content: editForm.content,
        subject: editForm.subject,
        tags: editForm.tags,
        createdAt: selectedNote?.createdAt || new Date(),
        updatedAt: new Date()
      };

      await saveStudyNote(noteData);
      await loadNotes();
      
      setIsEditing(false);
      setIsCreating(false);
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
    if (!selectedNote && notes.length > 0) {
      setSelectedNote(notes[0]);
    }
  };

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600 text-center">Please log in to manage your study notes.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md h-[600px] flex">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-gray-200 p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Study Notes</h3>
          <button
            onClick={handleCreateNew}
            className="p-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {loading && !notes.length ? (
          <p className="text-gray-500 text-center">Loading...</p>
        ) : notes.length === 0 ? (
          <p className="text-gray-500 text-center">No notes yet. Create your first note!</p>
        ) : (
          <div className="space-y-2">
            {notes.map((note) => (
              <div
                key={note.id}
                onClick={() => !isEditing && setSelectedNote(note)}
                className={`p-3 rounded-md cursor-pointer transition-colors ${
                  selectedNote?.id === note.id
                    ? 'bg-blue-50 border-blue-300'
                    : 'hover:bg-gray-50'
                } border border-gray-200`}
              >
                <h4 className="font-medium truncate">{note.title}</h4>
                <p className="text-sm text-gray-500">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </p>
                <div className="flex gap-1 mt-1">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {subjects.find(s => s.id === note.subject)?.name || note.subject}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {isEditing ? (
          <div className="h-full flex flex-col">
            <div className="mb-4">
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="Note Title"
                className="w-full text-2xl font-bold border-b border-gray-300 pb-2 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select
                value={editForm.subject}
                onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 mb-4">
              <RichEditor
                content={editForm.content}
                onChange={(content) => setEditForm({ ...editForm, content })}
                placeholder="Start writing your notes..."
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!editForm.title.trim() || loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : selectedNote ? (
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold">{selectedNote.title}</h2>
                <p className="text-sm text-gray-500">
                  Last updated: {new Date(selectedNote.updatedAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleEdit(selectedNote)}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4">
              <span className="text-sm bg-gray-100 px-3 py-1 rounded">
                {subjects.find(s => s.id === selectedNote.subject)?.fullName || selectedNote.subject}
              </span>
            </div>

            <div 
              className="flex-1 overflow-y-auto prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: selectedNote.content }}
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 mb-4">Select a note to view or create a new one</p>
              <button
                onClick={handleCreateNew}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Create New Note
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}