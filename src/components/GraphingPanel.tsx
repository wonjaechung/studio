
'use client';

import React, { useState, useEffect } from 'react';
import type { GraphingState, Column } from '@/lib/types';
import * as stats from '@/lib/stats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

// Dynamically import Plotly to avoid SSR issues
const Plot = React.lazy(() => import('react-plotly.js'));

interface GraphingPanelProps {
  graphingState: GraphingState;
  setGraphingState: (updater: (prevState: GraphingState) => GraphingState) => void;
  spreadsheetColumns: Column[];
  getColumnData: (name: string) => number[];
}

export default function GraphingPanel({
  graphingState,
  setGraphingState,
  spreadsheetColumns,
  getColumnData,
}: GraphingPanelProps) {
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setGraphingState(prev => ({...prev, isDragging: false}));
    const indicesStr = e.dataTransfer.getData('application/json');
    if (indicesStr) {
      const indices = JSON.parse(indicesStr);
      if (Array.isArray(indices) && indices.length > 0 && indices.length <= 2) {
        setGraphingState(prev => ({...prev, pendingPlot: { indices }}));
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setGraphingState(prev => ({...prev, isDragging: true}));
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setGraphingState(prev => ({...prev, isDragging: false}));
  };

  const handlePlotSelection = (plotType: 'histogram' | 'boxplot' | 'scatter') => {
      const indices = graphingState.pendingPlot?.indices;
      if (!indices) return;

      if (plotType === 'histogram' && indices.length === 1) {
          const col = spreadsheetColumns[indices[0]];
          const data = getColumnData(col.name);
          setGraphingState(prev => ({
              ...prev,
              plotType: 'histogram',
              plotData: [{ x: data, type: 'histogram', marker: { color: '#5DADE2' } }],
              plotLayout: { title: `Histogram of ${col.name}`, yaxis: { title: 'Frequency' } },
              pendingPlot: null,
          }));
      } else if (plotType === 'boxplot' && indices.length === 1) {
          const col = spreadsheetColumns[indices[0]];
          const data = getColumnData(col.name);
           setGraphingState(prev => ({
              ...prev,
              plotType: 'boxplot',
              plotData: [{ y: data, type: 'box', name: col.name }],
              plotLayout: { title: `Box Plot of ${col.name}` },
              pendingPlot: null,
          }));
      } else if (plotType === 'scatter' && indices.length === 2) {
          const col1 = spreadsheetColumns[indices[0]];
          const col2 = spreadsheetColumns[indices[1]];
          const xData = getColumnData(col1.name);
          const yData = getColumnData(col2.name);
          
          if (xData.length < 2 || yData.length < 2 || xData.length !== yData.length) {
            toast({ title: 'Cannot create scatter plot. X and Y lists must have the same number of numerical data points (at least 2).', variant: "destructive" });
            cancelPlotSelection();
            return;
          }
          const { a, b, r, residuals } = stats.linearRegression(xData, yData);
          const xRange = [Math.min(...xData), Math.max(...xData)];
          const yRange = xRange.map(x => a + b * x);
          
          const scatterTrace = { x: xData, y: yData, mode: 'markers', type: 'scatter', name: 'Data' };
          const lineTrace = { x: xRange, y: yRange, mode: 'lines', type: 'scatter', name: 'Fit' };

           setGraphingState(prev => ({
              ...prev,
              plotType: 'scatter',
              plotData: [scatterTrace, lineTrace],
              plotLayout: { title: `${col1.name} vs. ${col2.name} (r²=${(r*r).toFixed(3)})`, xaxis: {title: col1.name}, yaxis: {title: col2.name} },
              pendingPlot: null,
          }));
      }
  };

  const cancelPlotSelection = () => {
    setGraphingState(prev => ({ ...prev, pendingPlot: null }));
  };

  const plotlyLayout = {
    paper_bgcolor: 'hsl(var(--card))',
    plot_bgcolor: 'hsl(var(--card))',
    font: { color: 'hsl(var(--foreground))' },
    xaxis: { gridcolor: 'hsl(var(--border))' },
    yaxis: { gridcolor: 'hsl(var(--border))' },
    autosize: true,
  };

  const renderPlot = () => {
    if (!isClient) return <div className="flex-grow flex items-center justify-center text-muted-foreground">Loading Plotly...</div>;
    
    if (graphingState.plotType === 'default') {
        return <div className="flex-grow flex items-center justify-center text-muted-foreground">Drop a column here to create a plot.</div>;
    }

    return (
      <React.Suspense fallback={<div>Loading chart...</div>}>
         <Plot
            data={graphingState.plotData}
            layout={{...plotlyLayout, ...graphingState.plotLayout}}
            useResizeHandler={true}
            className="w-full h-full"
        />
      </React.Suspense>
    );
  };
  
  return (
    <div 
        className={`h-full w-full relative transition-all duration-300 ${graphingState.isDragging ? 'bg-primary/10' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
    >
      <Card className="h-full border-0 shadow-none rounded-lg flex flex-col bg-transparent">
        <CardHeader>
          <CardTitle className="text-base">Viewer</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow p-2 relative">
            {graphingState.isDragging && 
              <div className="absolute inset-2 z-10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center">
                  <p className="text-primary font-semibold">Drop here to plot</p>
              </div>
            }
          {graphingState.pendingPlot && (
              <div className="absolute inset-0 z-20 bg-card/80 backdrop-blur-sm flex items-center justify-center">
                  <div className="bg-background border p-6 rounded-lg shadow-lg text-center">
                      <h3 className="font-bold mb-2">Choose Plot Type</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                          {graphingState.pendingPlot.indices.length === 1 ? 
                            `Plot for column: ${spreadsheetColumns[graphingState.pendingPlot.indices[0]].name}` :
                            `Plot for columns: ${spreadsheetColumns[graphingState.pendingPlot.indices[0]].name} & ${spreadsheetColumns[graphingState.pendingPlot.indices[1]].name}`
                          }
                      </p>
                      <div className="flex gap-2 justify-center">
                        {graphingState.pendingPlot.indices.length === 1 && (
                            <>
                                <Button onClick={() => handlePlotSelection('histogram')}>Histogram</Button>
                                <Button onClick={() => handlePlotSelection('boxplot')}>Box Plot</Button>
                            </>
                        )}
                        {graphingState.pendingPlot.indices.length === 2 && (
                            <Button onClick={() => handlePlotSelection('scatter')}>Scatter Plot</Button>
                        )}
                        <Button variant="ghost" onClick={cancelPlotSelection}>Cancel</Button>
                      </div>
                  </div>
              </div>
          )}
          {renderPlot()}
        </CardContent>
      </Card>
    </div>
  );
}
