
"use client";

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { CalculatorState, CalculatorEntry, GameState } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { Gamepad2, FileText } from 'lucide-react';

interface CalculatorPanelProps {
  state: CalculatorState;
  gameState: GameState;
  onRunCommand: (command: string) => void;
  onToggleGameMode: () => void;
}

const ExportToggle = ({ onDragStart }: { onDragStart: (e: React.DragEvent) => void }) => {
    const [checked, setChecked] = React.useState(false);

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex items-center space-x-2" draggable={checked} onDragStart={onDragStart}>
                        <Switch id="export-calc-toggle" checked={checked} onCheckedChange={setChecked} />
                        <Label htmlFor="export-calc-toggle" className="text-xs text-muted-foreground" style={{cursor: checked ? 'grab' : 'default'}}>Export</Label>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Drag to export calculator history as text.</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

const CalcEntry = ({ entry }: { entry: CalculatorEntry }) => (
  <div className="mb-4">
    <div className="text-muted-foreground break-all font-code text-sm">{entry.input}</div>
    <div className="text-right font-bold text-lg text-foreground break-all whitespace-pre-wrap font-code">{entry.output}</div>
    {entry.explanation === undefined && entry.type && (
      <div className="mt-2 space-y-2 p-2 rounded-md bg-secondary/50">
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    )}
    {entry.explanation && (
       <div className="font-sans text-xs text-muted-foreground bg-secondary p-2 rounded-md mt-2 border-l-2 border-primary whitespace-pre-wrap">
         {entry.explanation}
       </div>
    )}
  </div>
);

const GameTimer = ({ timeLeft }: { timeLeft: number }) => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return (
        <div className="text-sm font-mono text-primary animate-pulse">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
    );
};

export function CalculatorPanel({ state, gameState, onRunCommand, onToggleGameMode }: CalculatorPanelProps) {
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

  const handleExportDrag = (e: React.DragEvent) => {
    const historyText = state.history
        .slice()
        .reverse()
        .map(entry => `> ${entry.input}\n${entry.output}${entry.explanation ? `\n// ${entry.explanation.replace(/\n/g, '\n// ')}` : ''}`)
        .join('\n\n');
    e.dataTransfer.setData('text/plain', historyText);
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-row items-center justify-between py-3">
        <CardTitle className="text-base flex items-center gap-2">
            {gameState.isActive ? <Gamepad2 className="text-primary" /> : <FileText />}
            {gameState.isActive ? "Game Mode" : "Calculator / Console"}
        </CardTitle>
        <div className="flex items-center gap-4">
            {gameState.isActive && <GameTimer timeLeft={gameState.timeLeft} />}
            <Button size="sm" variant={gameState.isActive ? "destructive" : "outline"} onClick={onToggleGameMode}>
                {gameState.isActive ? 'End Game' : 'Game Mode'}
            </Button>
            <ExportToggle onDragStart={handleExportDrag} />
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col min-h-0 p-4 pt-2">
        <ScrollArea className="flex-grow pr-4 -mr-4" ref={scrollAreaRef}>
            <div className="flex flex-col-reverse">
              {state.history.map((entry, index) => (
                <CalcEntry key={entry.id || index} entry={entry} />
              ))}
            </div>
        </ScrollArea>
        <div className="flex gap-2 mt-2 flex-shrink-0">
          <Input
            type="text"
            placeholder={gameState.isActive ? "Type your answer..." : "Expression or command..."}
            className="font-code"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button onClick={handleButtonClick} className="w-20 font-code text-lg">{gameState.isActive ? 'Submit' : '='}</Button>
        </div>
      </CardContent>
    </Card>
  );
}

    