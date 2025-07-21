
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="main-grid">
      <div id="importer" className="panel">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-base">Importer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Data import controls will go here.</p>
          </CardContent>
        </Card>
      </div>

      <div id="calculator" className="panel">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-base">Calculator / Console</CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-sm text-muted-foreground">The calculator will go here.</p>
          </CardContent>
        </Card>
      </div>

      <div id="graphing" className="panel">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-base">Viewer</CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-sm text-muted-foreground">Graphs and plots will appear here.</p>
          </CardContent>
        </Card>
      </div>

      <div id="spreadsheet" className="panel">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-base">Lists & Spreadsheet</CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-sm text-muted-foreground">The spreadsheet will go here.</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
