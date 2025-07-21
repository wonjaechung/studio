'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CalculatorPanel() {
  return (
    <Card className="h-full border-0 shadow-none rounded-lg">
      <CardHeader>
        <CardTitle className="text-base">Calculator / Console</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">The calculator will go here.</p>
      </CardContent>
    </Card>
  );
}
