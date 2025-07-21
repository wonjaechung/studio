
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

export default function ImporterPanel() {
  const [importerType, setImporterType] = useState('python');

  return (
    <Card className="h-full border-0 shadow-none rounded-lg">
      <CardHeader>
        <CardTitle className="text-base">Import Lab Data (Simulation)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex bg-muted p-1 rounded-md">
          <button 
            onClick={() => setImporterType('python')} 
            className={`flex-1 text-sm p-1 rounded-sm transition-colors ${importerType === 'python' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
          >
            Python (Pandas)
          </button>
          <button 
            onClick={() => setImporterType('sql')} 
            className={`flex-1 text-sm p-1 rounded-sm transition-colors ${importerType === 'sql' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
          >
            SQL
          </button>
        </div>
        
        {importerType === 'python' && (
           <div>
              <p className="text-sm mb-2 text-muted-foreground">Copy and run this command in the console below:</p>
              <code className="text-sm p-2 bg-slate-900 text-sky-300 rounded-md block font-mono">df = pd.read_csv('lab_data_1.csv')</code>
            </div>
        )}

        {importerType === 'sql' && (
           <div>
              <p className="text-sm mb-2 text-muted-foreground">Copy and run this query in the console below:</p>
              <code className="text-sm p-2 bg-slate-900 text-sky-300 rounded-md block font-mono">SELECT study_hours, exam_score FROM student_performance;</code>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
