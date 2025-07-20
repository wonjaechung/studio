"use client";

import * as React from 'react';
import { ImporterPanel } from '@/components/panels/ImporterPanel';
import { CalculatorPanel } from '@/components/panels/CalculatorPanel';
import { GraphingPanel } from '@/components/panels/GraphingPanel';
import { SpreadsheetPanel } from '@/components/panels/SpreadsheetPanel';
import { ActionModal } from '@/components/ActionModal';
import { StatisticsMenu } from '@/components/StatisticsMenu';
import { useToast } from '@/hooks/use-toast';
import type { AppState, CalculatorEntry, ModalConfig, PlotView, SpreadsheetColumn } from '@/lib/types';
import { stats } from '@/lib/stats';
import { generateExplanation } from '@/ai/flows/generate-explanation';
import * as math from 'mathjs';

const initialAppState: AppState = {
  spreadsheet: {
    columns: [],
    activeCell: { col: 0, row: 0 },
    isEditing: false,
    editValue: '',
    selectionStart: null,
    selectionEnd: null,
    isSelecting: false,
    isDataLoaded: false,
  },
  calculator: {
    history: [],
  },
  graphing: {
    currentView: { type: 'default' },
    functionInput: '',
    pendingPlot: null,
  },
  modal: null,
  isStatsMenuOpen: false,
};

export default function Home() {
  const [appState, setAppState] = React.useState<AppState>(initialAppState);
  const { toast } = useToast();

  const setSpreadsheetState = (update: Partial<AppState['spreadsheet']>) => {
    setAppState(prev => ({ ...prev, spreadsheet: { ...prev.spreadsheet, ...update } }));
  };

  const setGraphingState = (update: Partial<AppState['graphing']>) => {
    setAppState(prev => ({ ...prev, graphing: { ...prev.graphing, ...update } }));
  };
  
  const getColumnByName = (name: string) => appState.spreadsheet.columns.find(c => c.name === name);
  const getColumnData = (name: string | undefined): number[] => {
    if (!name) return [];
    const col = getColumnByName(name);
    return col ? col.data.map(v => parseFloat(v as string)).filter(v => !isNaN(v)) : [];
  };

  const addDataColumn = (name: string, data: (string | number)[] = [], formula?: string) => {
    setAppState(prev => {
      const newColumns = [...prev.spreadsheet.columns];
      const existingIndex = newColumns.findIndex(c => c.name === name);
      const newCol = { name, data, formula };
      if (existingIndex > -1) {
        newColumns[existingIndex] = newCol;
      } else {
        newColumns.push(newCol);
      }
      return { ...prev, spreadsheet: { ...prev.spreadsheet, columns: newColumns } };
    });
  };

  const getNextAvailableColumnIndex = () => appState.spreadsheet.columns.length;

  const showMessageModal = (message: string) => {
    setAppState(prev => ({ ...prev, modal: {
      id: 'info',
      title: 'Info',
      fields: [{ type: 'static', label: message }],
      buttons: [{ label: 'OK', action: 'closeModal' }]
    }}));
  };
  
  const handleRunCommand = async (expression: string) => {
    const pythonCommand = "df = pd.read_csv('lab_data_1.csv')";
    const sqlCommand = "SELECT study_hours, exam_score FROM student_performance;";
    let commandHandled = false;
    let newHistoryEntry: CalculatorEntry | null = null;
  
    if (expression === pythonCommand || expression === sqlCommand) {
        const studyHours = [1, 1.5, 1.8, 2, 2.5, 3, 3.2, 3.8, 4, 4.5, 5, 5.5, 6];
        const examScores = [65, 68, 70, 75, 72, 80, 85, 88, 85, 92, 95, 98, 94];
        setSpreadsheetState({ columns: [], isDataLoaded: true });
        addDataColumn('hours', studyHours);
        addDataColumn('score', examScores);
        newHistoryEntry = { input: expression, output: "Success", explanation: "Sample dataset 'lab_data_1.csv' loaded into the spreadsheet." };
        commandHandled = true;
    } else if (expression.toLowerCase().includes('read_csv') || expression.toLowerCase().includes('select')) {
        newHistoryEntry = { input: expression, output: "Import Failed", explanation: "Incorrect query. Please copy the command from the 'Import Lab Data' panel exactly." };
        commandHandled = true;
    } else if (expression === 'df.head()') {
        if (appState.spreadsheet.isDataLoaded) {
          setGraphingState({ currentView: { type: 'dataframe' }});
          newHistoryEntry = { input: expression, output: "DataFrame head displayed in Viewer." };
        } else {
          newHistoryEntry = { input: expression, output: "Error", explanation: "NameError: name 'df' is not defined. Load data first." };
        }
        commandHandled = true;
    }
  
    if (!commandHandled) {
        try {
            const result = math.evaluate(expression);
            const output = math.format(result, { precision: 14 });
            newHistoryEntry = { input: expression, output };
        } catch (err: any) {
            newHistoryEntry = { input: expression, output: 'Error', explanation: err.message };
        }
    }

    if (newHistoryEntry) {
      const entryWithId = { ...newHistoryEntry, id: Date.now().toString() };
      setAppState(prev => ({
        ...prev,
        calculator: {
          history: [entryWithId, ...prev.calculator.history]
        }
      }));

      if (!entryWithId.explanation && entryWithId.output !== 'Error') {
        try {
          const explanation = await generateExplanation({
            input: entryWithId.input,
            output: entryWithId.output,
            type: entryWithId.type,
            data: entryWithId.data,
          });
          setAppState(prev => ({
            ...prev,
            calculator: {
              history: prev.calculator.history.map(h => 
                h.id === entryWithId.id ? { ...h, explanation } : h
              ),
            }
          }));
        } catch (error) {
          console.error("Failed to generate explanation", error);
        }
      }
    }
  };

  const handlePlotFunction = () => {
    const expression = appState.graphing.functionInput;
    if (!expression) {
      setGraphingState({ currentView: { type: 'default' } });
      return;
    }
    try {
      const node = math.parse(expression);
      const code = node.compile();
      const xValues = math.range(-10, 10, 0.2).toArray();
      const yValues = xValues.map((x: number) => code.evaluate({ x: x }));
      const trace = { x: xValues, y: yValues, type: 'scatter', mode: 'lines', line: { color: '#5DADE2', width: 3 } };
      const layout = { title: `Plot of f(x) = ${expression}` };
      setGraphingState({ currentView: { type: 'plot', data: [trace], layout } });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Plotting Error', description: err.message });
    }
  };

  return (
    <>
      <div className="grid grid-cols-[1fr_1.5fr] grid-rows-[auto_minmax(0,1fr)_minmax(0,1.2fr)] gap-4 p-4 h-screen max-h-screen">
        <div className="col-span-2"><ImporterPanel /></div>
        
        <div className="min-h-0"><CalculatorPanel state={appState.calculator} onRunCommand={handleRunCommand}/></div>
        <div className="min-h-0"><GraphingPanel 
          state={appState.graphing} 
          spreadsheetColumns={appState.spreadsheet.columns}
          onFunctionInputChange={(value) => setGraphingState({ functionInput: value })}
          onPlotFunction={handlePlotFunction}
          setGraphingState={setGraphingState}
          showMessageModal={showMessageModal}
        /></div>
        
        <div className="col-span-2 min-h-0"><SpreadsheetPanel
          state={appState.spreadsheet} 
          setState={setSpreadsheetState}
          onMenuClick={() => setAppState(p => ({...p, isStatsMenuOpen: true}))}
          onClearClick={() => setAppState(p => ({...p, modal: {
            id: 'clear',
            title: 'Confirm Clear',
            fields: [{ type: 'static', label: 'Clear all spreadsheet data?' }],
            buttons: [
              { label: 'OK', action: 'clearSpreadsheet' },
              { label: 'Cancel', action: 'closeModal' }
            ]
          }}))}
        /></div>
      </div>
      
      {appState.modal && <ActionModal 
        modalConfig={appState.modal}
        columns={appState.spreadsheet.columns}
        onClose={() => setAppState(p => ({...p, modal: null}))}
        onAction={(action, data) => {
            if (action === 'clearSpreadsheet') {
              setSpreadsheetState({ columns: [], activeCell: { col: 0, row: 0 }, selectionStart: null, selectionEnd: null, isDataLoaded: false });
            } else {
              // Handle other actions here based on modal data
              console.log("Action:", action, "Data:", data);
            }
            setAppState(p => ({...p, modal: null}));
        }}
      />}
      
      {appState.isStatsMenuOpen && <StatisticsMenu 
        onClose={() => setAppState(p => ({...p, isStatsMenuOpen: false}))}
        onMenuAction={(modalConfig) => setAppState(p => ({...p, isStatsMenuOpen: false, modal: modalConfig}))}
        hasData={appState.spreadsheet.columns.length > 0}
        showMessageModal={showMessageModal}
      />}
    </>
  );
}
