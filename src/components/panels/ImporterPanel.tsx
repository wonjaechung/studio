"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ImporterPanel() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Import Lab Data (Simulation)</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs defaultValue="python" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="python">Python (Pandas)</TabsTrigger>
            <TabsTrigger value="sql">SQL</TabsTrigger>
          </TabsList>
          <TabsContent value="python" className="mt-4">
            <p className="text-sm mb-2 text-muted-foreground">Copy and run this command in the console below:</p>
            <code className="block bg-black/50 p-3 rounded-md text-primary font-code text-sm">df = pd.read_csv('lab_data_1.csv')</code>
          </TabsContent>
          <TabsContent value="sql" className="mt-4">
            <p className="text-sm mb-2 text-muted-foreground">Copy and run this query in the console below:</p>
            <code className="block bg-black/50 p-3 rounded-md text-primary font-code text-sm">SELECT study_hours, exam_score FROM student_performance;</code>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
