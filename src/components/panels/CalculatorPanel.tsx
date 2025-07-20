"use client";

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from '@/components/ui/scroll-area';
import type { CalculatorState, CalculatorEntry } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

interface CalculatorPanelProps {
  state: CalculatorState;
  onRunCommand: (command: string) => void;
}

const ExportToggle = () => (
    <div className="flex items-center space-x-2">
      <Switch id="export-calc-toggle" />
      <Label htmlFor="export-calc-toggle" className="text-xs text-muted-foreground">Export</Label>
    </div>
);

const CalcEntry = ({ entry }: { entry: CalculatorEntry }) => (
  <div className="mb-4">
    <div className="text-muted-foreground break-all font-code">{entry.input}</div>
    <div className="text-right font-bold text-lg text-foreground break-all whitespace-pre-wrap font-code">{entry.output}</div>
    {entry.explanation === undefined && entry.output !== 'Error' && (
      <div className="mt-2 space-y-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    )}
    {entry.explanation && (
       <div className="font-sans text-xs text-muted-foreground bg-secondary p-2 rounded-md mt-2 border-l-2 border-primary">
         {entry.explanation}
       </div>
    )}
  </div>
);


export function CalculatorPanel({ state, onRunCommand }: CalculatorPanelProps) {
  const [inputValue, setInputValue] = React.useState('');
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollAreaRef.current) {
        const scrollableView = scrollAreaRef.current.querySelector('div');
        if (scrollableView) {
            scrollableView.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
  }, [state.history]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      onRunCommand(inputValue);
      setInputValue('');
    }
  };

  const handleButtonClick = () => {
    if (inputValue.trim()) {
      onRunCommand(inputValue);
      setInputValue('');
    }
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">Calculator / Console</CardTitle>
        <ExportToggle />
      </CardHeader>
      <CardContent className="flex-grow flex flex-col min-h-0 p-4 pt-0">
        <ScrollArea className="flex-grow pr-4" ref={scrollAreaRef}>
            <div className="flex flex-col-reverse">
              {state.history.map((entry, index) => (
                <CalcEntry key={entry.id || index} entry={entry} />
              ))}
            </div>
        </ScrollArea>
        <div className="flex gap-2 mt-2 flex-shrink-0">
          <Input
            type="text"
            placeholder="Expression or command..."
            className="font-code"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button onClick={handleButtonClick} className="w-16 font-code text-lg">=</Button>
        </div>
      </CardContent>
    </Card>
  );
}
