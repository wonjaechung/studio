'use client';

import StudyPlanWidget from '@/features/StudyPlan/StudyPlanWidget';
import { AuthProvider } from '@/contexts/AuthContext';

export default function NotesPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Study Notes</h1>
          <StudyPlanWidget />
        </div>
      </div>
    </AuthProvider>
  );
}