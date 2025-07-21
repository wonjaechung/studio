'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { AppState } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface CalculatorPanelProps {
  appState: AppState;
  updateAppState: (updater: (prevState: AppState) => AppState) => void;
  toggleGameMode: () => void;
}

export default function CalculatorPanel({ appState, updateAppState, toggleGameMode }: CalculatorPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const [timer, setTimer] = useState(0);
  const { game, calculator } = appState;
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (game.isActive && game.startTime) {
      timerIntervalRef.current = setInterval(() => {
        setTimer(Math.floor((Date.now() - game.startTime!) / 1000));
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      setTimer(0);
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [game.isActive, game.startTime]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleEnterPress = () => {
    // This is a simplified version. The full implementation would involve a math expression parser.
    // For now, it just adds the input to history.
    if (!inputValue) return;

    let output = '';
    try {
        // A safe evaluation environment would be needed here for real use.
        // For now, we just add it to history.
        output = `Executed: ${inputValue}`;
    } catch (e) {
        output = 'Error';
    }

    updateAppState(prev => ({
        ...prev,
        calculator: {
            ...prev.calculator,
            history: [{ input: inputValue, output }, ...prev.calculator.history]
        }
    }));
    setInputValue('');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleEnterPress();
    }
  };

  return (
    <Card className="h-full border-0 shadow-none rounded-lg flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Calculator / Console</CardTitle>
        <div className="flex items-center space-x-2">
            {game.isActive && (
                <span className="text-sm font-mono bg-muted px-2 py-1 rounded-md">
                    {Math.floor(timer / 60).toString().padStart(2, '0')}:
                    {(timer % 60).toString().padStart(2, '0')}
                </span>
            )}
            <Label htmlFor="game-mode" className="text-sm">Game Mode</Label>
            <Switch id="game-mode" checked={game.isActive} onCheckedChange={toggleGameMode} />
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col p-2 pt-0">
        <ScrollArea className="flex-grow h-full mb-2 p-2 border rounded-md">
            {game.isActive && game.question ? (
                 <div className="text-sm mb-4 p-2 bg-muted rounded-md">
                    <p className="font-bold mb-2">Question {game.questionsAnswered + 1}:</p>
                    <p>{game.question.questionText}</p>
                 </div>
            ) : null}
            <div className="flex flex-col-reverse">
                {calculator.history.map((entry, index) => (
                <div key={index} className="mb-2 text-sm">
                    <p className="text-muted-foreground font-mono">&gt; {entry.input}</p>
                    <p className="font-mono text-right">{entry.output}</p>
                    {entry.explanation && <p className="text-xs text-sky-400 mt-1 p-2 bg-sky-950 rounded">{entry.explanation}</p>}
                </div>
                ))}
            </div>
        </ScrollArea>
        <div className="flex w-full items-center space-x-2">
            <Input
              type="text"
              placeholder="Type expression or answer..."
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="font-mono"
            />
            <Button onClick={handleEnterPress}>Enter</Button>
        </div>
      </CardContent>
    </Card>
  );
}
