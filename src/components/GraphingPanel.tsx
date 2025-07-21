'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function GraphingPanel() {
  return (
    <Card className="h-full border-0 shadow-none rounded-lg">
      <CardHeader>
        <CardTitle className="text-base">Viewer</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Graphs and plots will appear here.</p>
      </CardContent>
    </Card>
  );
}
