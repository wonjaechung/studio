'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ImporterPanel() {
  return (
    <Card className="h-full border-0 shadow-none rounded-lg">
      <CardHeader>
        <CardTitle className="text-base">Importer</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Data import controls will go here.</p>
      </CardContent>
    </Card>
  );
}
