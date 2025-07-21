'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SpreadsheetPanel() {
  return (
    <Card className="h-full border-0 shadow-none rounded-lg">
      <CardHeader>
        <CardTitle className="text-base">Lists & Spreadsheet</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">The spreadsheet will go here.</p>
      </CardContent>
    </Card>
  );
}
