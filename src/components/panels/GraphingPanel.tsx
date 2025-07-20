"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { GraphingState, SpreadsheetColumn, PlotView } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { ScrollArea } from '../ui/scroll-area';
import { stats } from '@/lib/stats';
import { Skeleton } from '../ui/skeleton';

const PlotlyChart = dynamic(() => import('@/components/PlotlyChart').then(mod => mod.PlotlyChart), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full" />
});


interface GraphingPanelProps {
  state: GraphingState;
  spreadsheetColumns: SpreadsheetColumn[];
  onFunctionInputChange: (value: string) => void;
  onPlotFunction: () => void;
  setGraphingState: (update: Partial<GraphingState>) => void;
  showMessageModal: (message: string) => void;
}

const ExportToggle = () => (
    <div className="flex items-center space-x-2">
      <Switch id="export-viewer-toggle" />
      <Label htmlFor="export-viewer-toggle" className="text-xs text-muted-foreground">Export</Label>
    </div>
);

const DataFrameViewer = ({ columns }: { columns: SpreadsheetColumn[] }) => {
    const rowCount = Math.min(5, columns[0]?.data.length || 0);
    const rows = Array.from({ length: rowCount }, (_, i) => i);

    return (
        <ScrollArea className="h-full">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>#</TableHead>
                        {columns.map(col => <TableHead key={col.name}>{col.name}</TableHead>)}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map(rowIndex => (
                        <TableRow key={rowIndex}>
                            <TableCell>{rowIndex + 1}</TableCell>
                            {columns.map(col => (
                                <TableCell key={col.name}>{col.data[rowIndex]}</TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </ScrollArea>
    );
};

const PlotContextMenu = ({ colIndices, columns, onPlot, onCancel }: { colIndices: number[], columns: SpreadsheetColumn[], onPlot: (type: 'histogram' | 'boxplot' | 'scatter') => void, onCancel: () => void }) => {
    let subtitle, options;
    if (colIndices.length === 1) {
        const colName = columns[colIndices[0]].name;
        subtitle = <>1 Variable Selected: <strong>{colName}</strong></>;
        options = (
            <>
                <Button onClick={() => onPlot('histogram')}>Histogram</Button>
                <Button onClick={() => onPlot('boxplot')}>Box Plot</Button>
            </>
        );
    } else {
        const name1 = columns[colIndices[0]].name;
        const name2 = columns[colIndices[1]].name;
        subtitle = <>2 Variables Selected: <strong>{name1}</strong> vs <strong>{name2}</strong></>;
        options = <Button onClick={() => onPlot('scatter')}>Scatter Plot</Button>;
    }

    return (
        <div className="absolute inset-0 bg-card/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="bg-background border rounded-lg p-6 shadow-xl text-center space-y-4">
                <h3 className="text-lg font-semibold">Choose Plot Type</h3>
                <div className="text-sm text-muted-foreground">{subtitle}</div>
                <div className="flex gap-4 justify-center">{options}</div>
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
            </div>
        </div>
    );
};


export function GraphingPanel({ state, spreadsheetColumns, onFunctionInputChange, onPlotFunction, setGraphingState, showMessageModal }: GraphingPanelProps) {
    const [isDragOver, setIsDragOver] = useState(false);

    const getColumnData = (name: string): number[] => {
        const col = spreadsheetColumns.find(c => c.name === name);
        return col ? col.data.map(v => parseFloat(v as string)).filter(v => !isNaN(v)) : [];
    };

    const handlePlotSelect = (type: 'histogram' | 'boxplot' | 'scatter') => {
        if (state.currentView.type !== 'context-menu') return;
        const { colIndices } = state.currentView;

        let plotView: PlotView = { type: 'default' };

        if (type === 'histogram' && colIndices.length === 1) {
            const col = spreadsheetColumns[colIndices[0]];
            const data = getColumnData(col.name);
            plotView = { type: 'plot', data: [{ x: data, type: 'histogram', marker: { color: '#10B981' } }], layout: { title: `Histogram of ${col.name}` } };
        } else if (type === 'boxplot' && colIndices.length === 1) {
            const col = spreadsheetColumns[colIndices[0]];
            const data = getColumnData(col.name);
            plotView = { type: 'plot', data: [{ y: data, type: 'box', name: col.name }], layout: { title: `Box Plot of ${col.name}` } };
        } else if (type === 'scatter' && colIndices.length === 2) {
            const col1 = spreadsheetColumns[colIndices[0]];
            const col2 = spreadsheetColumns[colIndices[1]];
            const xData = getColumnData(col1.name);
            const yData = getColumnData(col2.name);
            const n = Math.min(xData.length, yData.length);
            if (n < 2) {
                showMessageModal("Need at least 2 data points for a scatter plot.");
                setGraphingState({ currentView: { type: 'default' }});
                return;
            }
            const sumX = stats.sum(xData); const sumY = stats.sum(yData);
            const sumXY = stats.sum(xData.map((x, i) => x * yData[i]));
            const sumX2 = stats.sum(xData.map(x => x * x)); const sumY2 = stats.sum(yData.map(y => y * y));
            const b = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
            const a = (sumY / n) - b * (sumX / n);
            const rNumerator = (n * sumXY - sumX * sumY);
            const rDenominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
            const r = rNumerator / rDenominator;
            const xRange = [Math.min(...xData), Math.max(...xData)];
            const yRange = xRange.map(x => a + b * x);
            const scatterTrace = { x: xData, y: yData, mode: 'markers', type: 'scatter', marker: { color: '#F59E0B' } };
            const lineTrace = { x: xRange, y: yRange, mode: 'lines', type: 'scatter', line: { color: '#EF4444', width: 2 } };
            const layout = { title: `${col1.name} vs. ${col2.name}<br>ŷ = ${a.toFixed(3)} + ${b.toFixed(3)}x | r²=${(r*r).toFixed(3)} | r=${r.toFixed(3)}`, xaxis: {title: col1.name }, yaxis: {title: col2.name }};
            plotView = { type: 'plot', data: [scatterTrace, lineTrace], layout };
        }
        setGraphingState({ currentView: plotView });
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        try {
            const colIndices = JSON.parse(e.dataTransfer.getData('application/json')) as number[];
            if (colIndices.length > 0 && colIndices.length <= 2) {
                setGraphingState({ currentView: { type: 'context-menu', colIndices } });
            } else {
                showMessageModal("Please drag one or two columns to plot.");
            }
        } catch (error) {
            console.error("Drop failed:", error);
            showMessageModal("Failed to read dropped data.");
        }
    };

    return (
        <Card 
            className="h-full flex flex-col"
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
        >
            <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-base">Viewer</CardTitle>
                <ExportToggle />
            </CardHeader>
            <CardContent className={cn("flex-grow flex flex-col gap-4 min-h-0 p-4 pt-0 transition-all", isDragOver && "border-2 border-dashed border-primary")}>
                <div className="flex gap-2">
                    <span className="self-center font-code">f(x) =</span>
                    <Input
                        type="text"
                        placeholder="e.g., sin(x) or drop columns here"
                        className="font-code"
                        value={state.functionInput}
                        onChange={(e) => onFunctionInputChange(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onPlotFunction()}
                    />
                    <Button onClick={onPlotFunction}>Plot</Button>
                </div>
                <div className="flex-grow relative min-h-0">
                    {state.currentView.type === 'default' && (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            Drop columns here to plot data
                        </div>
                    )}
                    {state.currentView.type === 'plot' && (
                        <PlotlyChart data={state.currentView.data} layout={state.currentView.layout} />
                    )}
                    {state.currentView.type === 'dataframe' && (
                        <DataFrameViewer columns={spreadsheetColumns} />
                    )}
                    {state.currentView.type === 'context-menu' && (
                        <PlotContextMenu 
                            colIndices={state.currentView.colIndices}
                            columns={spreadsheetColumns}
                            onPlot={handlePlotSelect}
                            onCancel={() => setGraphingState({ currentView: { type: 'default' } })}
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
