
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { AppState, ModalConfig, SpreadsheetState, CalculatorEntry, Column, Cell } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { statsQuestions } from '@/lib/questions';
import { getExplanation } from '@/lib/explanations';
import * as stats from '@/lib/stats';

import ImporterPanel from './ImporterPanel';
import CalculatorPanel from './CalculatorPanel';
import GraphingPanel from './GraphingPanel';
import SpreadsheetPanel from './SpreadsheetPanel';
import Modal from './Modal';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


const initialColumns: Column[] = Array.from({ length: 10 }, (_, i) => ({
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
    isDataLoaded: false,
  });

  const { toast } = useToast();
  const appStateRef = useRef(appState);

  useEffect(() => {
    appStateRef.current = appState;
  }, [appState]);

  const updateAppState = (updater: (prevState: AppState) => AppState) => {
    setAppState(updater);
  };

  const showModal = (config: ModalConfig) => {
    const colNames = appState.spreadsheet.columns.map(c => c.name).filter(Boolean);
     if (colNames.length === 0 && config.requiresData) {
        toast({
          title: "Spreadsheet is empty",
          description: "Add data to a named column first.",
          variant: "destructive",
        });
        return;
     }
    updateAppState(prev => ({ ...prev, modal: config }));
  };
  
  const addHistoryEntry = (entry: Omit<CalculatorEntry, 'explanation'>) => {
    const explanation = entry.type ? getExplanation(entry.type, entry.data) : undefined;
    updateAppState(prev => ({
        ...prev,
        calculator: {
            ...prev.calculator,
            history: [{...entry, explanation}, ...prev.calculator.history],
        }
    }));
  };

  const getColumnData = useCallback((name: string) => {
    const col = appState.spreadsheet.columns.find(c => c.name === name);
    return col ? col.data.map(v => parseFloat(String(v))).filter(v => !isNaN(v)) : [];
  }, [appState.spreadsheet.columns]);

  const addDataColumn = (name: string, data: (string | number)[] = [], formula?: string) => {
     updateAppState(prev => {
        const newColumns = [...prev.spreadsheet.columns];
        const existingIndex = newColumns.findIndex(c => c.name === name);
        const fullData = [...data];
        while (fullData.length < 200) {
            fullData.push('');
        }

        if (existingIndex > -1) {
            newColumns[existingIndex] = { ...newColumns[existingIndex], data: fullData, formula };
        } else {
            newColumns.push({ name, data: fullData, formula });
        }
        return { ...prev, spreadsheet: { ...prev.spreadsheet, columns: newColumns } };
     });
  };

  const getNextAvailableColumnIndex = () => appState.spreadsheet.columns.length;

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

  const handleCalculatorSubmit = (expression: string) => {
    const pythonCommand = "df = pd.read_csv('lab_data_1.csv')";
    const sqlCommand = "SELECT study_hours, exam_score FROM student_performance;";

    if (expression === pythonCommand || expression === sqlCommand) {
        const studyHours = [1, 1.5, 1.8, 2, 2.5, 3, 3.2, 3.8, 4, 4.5, 5, 5.5, 6];
        const examScores = [65, 68, 70, 75, 72, 80, 85, 88, 85, 92, 95, 98, 94];
        addDataColumn('hours', studyHours);
        addDataColumn('score', examScores);
        addHistoryEntry({ input: expression, output: "Success: Sample data loaded." });
        updateAppState(prev => ({...prev, isDataLoaded: true}));
    } else {
        try {
            const result = stats.evaluate(expression);
            addHistoryEntry({ input: expression, output: result.toString() });
        } catch (e: any) {
            addHistoryEntry({ input: expression, output: `Error: ${e.message}` });
        }
    }
  };
  
  const run1VarStats = (listName: string) => {
    const data = getColumnData(listName);
    if (data.length === 0) { toast({ title: 'Selected list is empty.', variant: "destructive" }); return; }
    const results = {
        'Title': 'One-Var Stats', 'x̄': stats.mean(data).toFixed(4), 'Σx': stats.sum(data).toFixed(4),
        'Σx²': stats.sum(data.map(x => x*x)).toFixed(4), 'Sx': stats.stddev(data, false).toFixed(4),
        'σx': stats.stddev(data, true).toFixed(4), 'n': data.length, 'MinX': Math.min(...data),
        'Q₁X': stats.quartile(data, 0.25), 'MedianX': stats.median(data),
        'Q₃X': stats.quartile(data, 0.75), 'MaxX': Math.max(...data)
    };
    const resultColIndex = getNextAvailableColumnIndex();
    addDataColumn(String.fromCharCode(65 + resultColIndex), Object.keys(results));
    addDataColumn(String.fromCharCode(65 + resultColIndex + 1), Object.values(results), `OneVar(${listName})`);
    
    addHistoryEntry({ type: '1VarStats', input: `1-Var Stats for ${listName}`, output: `Mean (x̄) = ${results['x̄']}\nSample SD (Sx) = ${results['Sx']}`, data: {results, listName}});
    updateAppState(prev => ({...prev, modal: null}));
  };

  const runLinReg = (xListName: string, yListName: string) => {
    const xData = getColumnData(xListName);
    const yData = getColumnData(yListName);
    if (xData.length < 2 || yData.length < 2 || xData.length !== yData.length) {
      toast({ title: 'X and Y lists must have the same number of numerical data points (at least 2).', variant: "destructive" });
      return;
    }
    const results = stats.linearRegression(xData, yData);

    const resultColIndex = getNextAvailableColumnIndex();
    const resultLabels = { 'Title': 'LinReg (a+bx)', 'RegEqn': 'a+b*x', 'a': results.a.toFixed(4), 'b': results.b.toFixed(4), 'r²': (results.r*results.r).toFixed(4), 'r': results.r.toFixed(4), 'SE Slope': results.seSlope.toFixed(4) };

    addDataColumn(String.fromCharCode(65 + resultColIndex), Object.keys(resultLabels));
    addDataColumn(String.fromCharCode(65 + resultColIndex + 1), Object.values(resultLabels), `LinRegBx(${xListName},${yListName})`);
    addDataColumn('statresid', results.residuals.map(r => r.toFixed(4)));

    addHistoryEntry({type: 'LinReg', input: `LinReg for ${yListName} vs ${xListName}`, output: `y = ${results.a.toFixed(4)} + ${results.b.toFixed(4)}x\nr² = ${(results.r*results.r).toFixed(4)}`, data: {results, xListName, yListName}});
    updateAppState(prev => ({...prev, modal: null}));
  };

  const statsMenu = [
    {
        label: 'One-Variable Statistics',
        action: () => showModal({ 
            id: '1varstats', requiresData: true, title: 'One-Variable Statistics',
            fields: [ { id: 'x1list', label: 'X1 List', type: 'select' } ],
            buttons: [ { label: 'OK', action: 'confirm' }, { label: 'Cancel', action: 'cancel' } ],
            onConfirm: (data) => run1VarStats(data.x1list)
        })
    },
    {
        label: 'Linear Regression (a+bx)',
        action: () => showModal({
            id: 'linreg', requiresData: true, title: 'Linear Regression (a+bx)',
            fields: [ { id: 'xlist', label: 'X List', type: 'select' }, { id: 'ylist', label: 'Y List', type: 'select' } ],
            buttons: [ { label: 'OK', action: 'confirm' }, { label: 'Cancel', action: 'cancel' } ],
            onConfirm: (data) => runLinReg(data.xlist, data.ylist)
        })
    },
  ];

  return (
    <main className="main-grid">
      {appState.modal && (
        <Modal
          config={appState.modal}
          appState={appState}
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
          onExpressionSubmit={handleCalculatorSubmit}
          statsMenu={
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">Menu</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {statsMenu.map(item => (
                        <DropdownMenuItem key={item.label} onSelect={item.action}>
                            {item.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
          }
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
