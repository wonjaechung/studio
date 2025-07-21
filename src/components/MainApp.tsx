
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { AppState, ModalConfig, SpreadsheetState } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { statsQuestions } from '@/lib/questions';
import { Button } from '@/components/ui/button';

import ImporterPanel from './ImporterPanel';
import CalculatorPanel from './CalculatorPanel';
import GraphingPanel from './GraphingPanel';
import SpreadsheetPanel from './SpreadsheetPanel';
import Modal from './Modal';


const initialColumns = Array.from({ length: 10 }, (_, i) => ({
  name: String.fromCharCode(65 + i),
  data: Array(200).fill(''),
}));

const initialSpreadsheetState: SpreadsheetState = {
  columns: initialColumns,
  activeCell: { col: 0, row: 0 },
  isEditing: false,
  editValue: '',
  isSelecting: false,
  selectionStart: null,
  selectionEnd: null,
};

export default function MainApp() {
  const [appState, setAppState] = useState<AppState>({
    spreadsheet: initialSpreadsheetState,
    calculator: { history: [] },
    game: {
      isActive: false,
      startTime: null,
      question: null,
      questionsAnswered: 0,
      correctAnswers: 0,
    },
    graphing: {
      plotType: 'default',
      plotData: null,
      plotLayout: null,
      isDragging: false,
      pendingPlot: null,
    },
    modal: null,
    activePanel: null,
    exportState: { calculator: false, graphing: false, spreadsheet: false },
  });

  const { toast } = useToast();
  const appStateRef = useRef(appState);

  useEffect(() => {
    appStateRef.current = appState;
  }, [appState]);

  const updateAppState = (updater: (prevState: AppState) => AppState) => {
    setAppState(updater);
  };

  const getColumnData = useCallback((name: string) => {
    const col = appState.spreadsheet.columns.find(c => c.name === name);
    return col ? col.data.map(v => parseFloat(String(v))).filter(v => !isNaN(v)) : [];
  }, [appState.spreadsheet.columns]);

  // Game Mode Logic
  const toggleGameMode = useCallback(() => {
    updateAppState(prev => {
      const isActive = !prev.game.isActive;
      if (isActive) {
        const nextQuestion = statsQuestions[Math.floor(Math.random() * statsQuestions.length)];
        return {
          ...prev,
          game: {
            ...prev.game,
            isActive: true,
            startTime: Date.now(),
            question: nextQuestion,
            questionsAnswered: 0,
            correctAnswers: 0,
          }
        };
      } else {
        return {
          ...prev,
          game: {
            ...prev.game,
            isActive: false,
            startTime: null,
            question: null,
          }
        };
      }
    });
  }, []);

  const handleCellChange = (col: number, row: number, value: string) => {
    updateAppState(prev => {
      const newColumns = [...prev.spreadsheet.columns];
      if (!newColumns[col]) {
        newColumns[col] = { name: String.fromCharCode(65 + col), data: Array(200).fill('') };
      }
      const newData = [...newColumns[col].data];
      newData[row] = value;
      newColumns[col] = { ...newColumns[col], data: newData };
      return { ...prev, spreadsheet: { ...prev.spreadsheet, columns: newColumns } };
    });
  };

  const handleHeaderChange = (col: number, value: string) => {
    updateAppState(prev => {
      const newColumns = [...prev.spreadsheet.columns];
      if (newColumns[col]) {
        newColumns[col] = { ...newColumns[col], name: value };
      }
      return { ...prev, spreadsheet: { ...prev.spreadsheet, columns: newColumns } };
    });
  };

  const handleSetSpreadsheetState = (newState: Partial<SpreadsheetState>) => {
    updateAppState(prev => ({ ...prev, spreadsheet: { ...prev.spreadsheet, ...newState } }));
  };
  
  return (
    <main className="main-grid">
      {appState.modal && (
        <Modal
          config={appState.modal}
          onClose={() => updateAppState(prev => ({ ...prev, modal: null }))}
        />
      )}
      <div id="importer" className="panel">
        <ImporterPanel />
      </div>

      <div id="calculator" className="panel">
        <CalculatorPanel
          appState={appState}
          updateAppState={updateAppState}
          toggleGameMode={toggleGameMode}
        />
      </div>

      <div id="graphing" className="panel">
        <GraphingPanel
          graphingState={appState.graphing}
          setGraphingState={(updater) => updateAppState(prev => ({...prev, graphing: updater(prev.graphing)}))}
          spreadsheetColumns={appState.spreadsheet.columns}
          getColumnData={getColumnData}
        />
      </div>

      <div id="spreadsheet" className="panel">
        <SpreadsheetPanel
          spreadsheetState={appState.spreadsheet}
          setSpreadsheetState={handleSetSpreadsheetState}
          onCellChange={handleCellChange}
          onHeaderChange={handleHeaderChange}
        />
      </div>
    </main>
  );
}
