
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { AppState, ModalConfig, SpreadsheetState, CalculatorEntry, Column, Cell } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { statsQuestions } from '@/lib/questions';
import { getExplanation } from '@/lib/explanations';
import * as stats from '@/lib/stats';
import { saveAs } from 'file-saver';
import { toPng } from 'html-to-image';


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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
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
  
  const showModal = (type: string) => {
    const colNames = appState.spreadsheet.columns.map(c => c.name).filter(Boolean);
    const requiresData = ['1varstats', 'linreg', 'tinterval-data', 'ttest-data'].includes(type);

    if (requiresData && colNames.length === 0) {
        toast({
          title: "Spreadsheet is empty",
          description: "Add data to a named column first.",
          variant: "destructive",
        });
        return;
    }

    let config: ModalConfig | null = null;
    switch (type) {
        case '1varstats':
            config = {
                id: '1varstats', title: 'One-Variable Statistics',
                fields: [ { id: 'x1list', label: 'X1 List', type: 'select' } ],
                buttons: [ { label: 'OK', action: 'confirm' }, { label: 'Cancel', action: 'cancel' } ],
                onConfirm: (data) => run1VarStats(data.x1list)
            };
            break;
        case 'linreg':
            config = {
                id: 'linreg', title: 'Linear Regression (a+bx)',
                fields: [ { id: 'xlist', label: 'X List', type: 'select' }, { id: 'ylist', label: 'Y List', type: 'select' } ],
                buttons: [ { label: 'OK', action: 'confirm' }, { label: 'Cancel', action: 'cancel' } ],
                onConfirm: (data) => runLinReg(data.xlist, data.ylist)
            };
            break;
        case 'ttest':
             config = {
                id: 'ttest-chooser', title: 't-Test',
                fields: [{ id: 'inputMethod', label: 'Input Method', type: 'select', options: ['Data', 'Stats'] }],
                buttons: [{ label: 'OK', action: 'confirm' }, { label: 'Cancel', action: 'cancel' }],
                onConfirm: ({ inputMethod }) => {
                    if (inputMethod === 'Data') showModal('ttest-data');
                    else showModal('ttest-stats');
                }
            };
            break;
        case 'ttest-data':
            config = {
                id: 'ttest-data', title: 't-Test (Data)',
                fields: [
                    { id: 'mu0', label: 'μ₀', type: 'number' },
                    { id: 'list', label: 'List', type: 'select' },
                    { id: 'alt', label: 'Alternate Hyp', type: 'select', options: ['μ ≠ μ₀', 'μ < μ₀', 'μ > μ₀'] },
                ],
                buttons: [{ label: 'OK', action: 'confirm' }, { label: 'Cancel', action: 'cancel' }],
                onConfirm: (data) => runTTestFromData(data)
            };
            break;
        case 'ttest-stats':
            config = {
                id: 'ttest-stats', title: 't-Test (Stats)',
                fields: [
                    { id: 'mu0', label: 'μ₀', type: 'number' },
                    { id: 'mean', label: 'x̄', type: 'number' },
                    { id: 'sx', label: 'Sx', type: 'number' },
                    { id: 'n', label: 'n', type: 'number' },
                    { id: 'alt', label: 'Alternate Hyp', type: 'select', options: ['μ ≠ μ₀', 'μ < μ₀', 'μ > μ₀'] },
                ],
                buttons: [{ label: 'OK', action: 'confirm' }, { label: 'Cancel', action: 'cancel' }],
                onConfirm: (data) => runTTestFromStats(data)
            };
            break;
        case 'tinterval':
            config = {
                id: 'tinterval-chooser', title: 't-Interval',
                fields: [{ id: 'inputMethod', label: 'Input Method', type: 'select', options: ['Data', 'Stats'] }],
                buttons: [{ label: 'OK', action: 'confirm' }, { label: 'Cancel', action: 'cancel' }],
                onConfirm: ({ inputMethod }) => {
                    if (inputMethod === 'Data') showModal('tinterval-data');
                    else showModal('tinterval-stats');
                }
            };
            break;
        case 'tinterval-data':
            config = {
                id: 'tinterval-data', title: 't-Interval (Data)',
                fields: [
                    { id: 'list', label: 'List', type: 'select' },
                    { id: 'clevel', label: 'C-Level', type: 'number', value: '0.95' },
                ],
                buttons: [{ label: 'OK', action: 'confirm' }, { label: 'Cancel', action: 'cancel' }],
                onConfirm: (data) => runTIntervalFromData(data)
            };
            break;
        case 'tinterval-stats':
            config = {
                id: 'tinterval-stats', title: 't-Interval (Stats)',
                fields: [
                    { id: 'mean', label: 'x̄', type: 'number' },
                    { id: 'sx', label: 'Sx', type: 'number' },
                    { id: 'n', label: 'n', type: 'number' },
                    { id: 'clevel', label: 'C-Level', type: 'number', value: '0.95' },
                ],
                buttons: [{ label: 'OK', action: 'confirm' }, { label: 'Cancel', action: 'cancel' }],
                onConfirm: (data) => runTIntervalFromStats(data)
            };
            break;
        case 'normalcdf':
            config = {
                id: 'normalcdf', title: 'Normal Cdf',
                fields: [
                    { id: 'lower', label: 'Lower', type: 'number', value: -1e99 },
                    { id: 'upper', label: 'Upper', type: 'number', value: 1e99 },
                    { id: 'mu', label: 'μ', type: 'number', value: 0 },
                    { id: 'sigma', label: 'σ', type: 'number', value: 1 },
                ],
                buttons: [{ label: 'OK', action: 'confirm' }, { label: 'Cancel', action: 'cancel' }],
                onConfirm: (data) => runNormalCdf(data)
            };
            break;
        case 'invnorm':
             config = {
                id: 'invnorm', title: 'Inverse Normal',
                fields: [
                    { id: 'area', label: 'Area', type: 'number' },
                    { id: 'mu', label: 'μ', type: 'number', value: 0 },
                    { id: 'sigma', label: 'σ', type: 'number', value: 1 },
                ],
                buttons: [{ label: 'OK', action: 'confirm' }, { label: 'Cancel', action: 'cancel' }],
                onConfirm: (data) => runInvNorm(data)
            };
            break;
        case 'binompdf':
            config = {
                id: 'binompdf', title: 'Binomial Pdf',
                fields: [
                    { id: 'n', label: 'n', type: 'number' },
                    { id: 'p', label: 'p', type: 'number' },
                    { id: 'x', label: 'x value', type: 'number' },
                ],
                buttons: [{ label: 'OK', action: 'confirm' }, { label: 'Cancel', action: 'cancel' }],
                onConfirm: (data) => runBinomPdf(data)
            };
            break;
        case 'binomcdf':
            config = {
                id: 'binomcdf', title: 'Binomial Cdf',
                fields: [
                    { id: 'n', label: 'n', type: 'number' },
                    { id: 'p', label: 'p', type: 'number' },
                    { id: 'x', label: 'x value', type: 'number' },
                ],
                buttons: [{ label: 'OK', action: 'confirm' }, { label: 'Cancel', action: 'cancel' }],
                onConfirm: (data) => runBinomCdf(data)
            };
            break;
        // ... more cases for other modals
    }
    if (config) {
        updateAppState(prev => ({ ...prev, modal: config }));
    }
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
        const emptyColIndex = newColumns.findIndex(c => c.name === '' || c.name.match(/^[A-Z]$/));
        const targetIndex = emptyColIndex > -1 ? emptyColIndex : newColumns.length;
        
        const fullData = [...data];
        while (fullData.length < 200) {
            fullData.push('');
        }

        newColumns[targetIndex] = { name, data: fullData, formula };
        
        // Ensure there's always a blank column at the end for new data entry
        if (targetIndex >= newColumns.length - 2) {
            newColumns.push({ name: String.fromCharCode(65 + newColumns.length), data: Array(200).fill('') });
        }
        
        return { ...prev, spreadsheet: { ...prev.spreadsheet, columns: newColumns } };
     });
  };

  const getNextAvailableColumnName = () => {
    const colNames = new Set(appState.spreadsheet.columns.map(c => c.name));
    for (let i = 0; i < 26; i++) {
        const name = String.fromCharCode(65 + i);
        if (!colNames.has(name)) return name;
    }
    // Fallback for more than 26 columns
    for (let i = 1; ; i++) {
        const name = `Col${i}`;
        if (!colNames.has(name)) return name;
    }
  };

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
      } else {
        newColumns[col] = { name: value, data: Array(200).fill('') };
      }
       // Ensure there's always a blank column at the end for new data entry
      if (col >= newColumns.length - 2) {
          newColumns.push({ name: String.fromCharCode(65 + newColumns.length), data: Array(200).fill('') });
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
        
        updateAppState(prev => {
            let newColumns = [...prev.spreadsheet.columns].filter(c => c.name !== 'hours' && c.name !== 'score');
            const hoursCol = { name: 'hours', data: Array(200).fill(''), formula: undefined };
            const scoreCol = { name: 'score', data: Array(200).fill(''), formula: undefined };
            studyHours.forEach((val, i) => hoursCol.data[i] = val);
            examScores.forEach((val, i) => scoreCol.data[i] = val);
            newColumns = [hoursCol, scoreCol, ...newColumns.filter(c => c.name !== '')];
            while (newColumns.length < 10) {
                 newColumns.push({ name: String.fromCharCode(65 + newColumns.length), data: Array(200).fill('') });
            }

            return {
                ...prev,
                spreadsheet: { ...prev.spreadsheet, columns: newColumns },
                isDataLoaded: true
            };
        });

        addHistoryEntry({ input: expression, output: "Success: Sample data loaded." });
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
    const resultColName1 = getNextAvailableColumnName();
    const resultColName2 = getNextAvailableColumnName();
    addDataColumn(resultColName1, Object.keys(results));
    addDataColumn(resultColName2, Object.values(results), `OneVar(${listName})`);
    
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

    const resultLabels = { 'Title': 'LinReg (a+bx)', 'RegEqn': 'a+b*x', 'a': results.a.toFixed(4), 'b': results.b.toFixed(4), 'r²': (results.r*results.r).toFixed(4), 'r': results.r.toFixed(4), 'SE Slope': results.seSlope.toFixed(4) };
    
    const resultColName1 = getNextAvailableColumnName();
    const resultColName2 = getNextAvailableColumnName();
    const residColName = 'statresid';
    
    addDataColumn(resultColName1, Object.keys(resultLabels));
    addDataColumn(resultColName2, Object.values(resultLabels), `LinRegBx(${xListName},${yListName})`);
    addDataColumn(residColName, results.residuals.map(r => r.toFixed(4)));

    addHistoryEntry({type: 'LinReg', input: `LinReg for ${yListName} vs ${xListName}`, output: `y = ${results.a.toFixed(4)} + ${results.b.toFixed(4)}x\nr² = ${(results.r*results.r).toFixed(4)}`, data: {results, xListName, yListName}});
    updateAppState(prev => ({...prev, modal: null}));
  };
  
  const runTIntervalFromData = ({ list, clevel }: { list: string, clevel: string }) => {
    const data = getColumnData(list);
    if (data.length < 2) { toast({ title: "Selected list must have at least 2 numbers.", variant: 'destructive' }); return; }
    const mean = stats.mean(data);
    const sx = stats.stddev(data);
    const n = data.length;
    runTInterval(mean, sx, n, parseFloat(clevel));
  };
  
  const runTIntervalFromStats = ({ mean, sx, n, clevel }: { mean: string, sx: string, n: string, clevel: string }) => {
    runTInterval(parseFloat(mean), parseFloat(sx), parseInt(n), parseFloat(clevel));
  };

  const runTInterval = (mean: number, sx: number, n: number, cLevel: number) => {
    if ([mean, sx, n, cLevel].some(isNaN)) { toast({ title: "Invalid input. Please enter numbers.", variant: 'destructive' }); return; }
    const df = n - 1;
    const { lower, upper, me } = stats.tInterval(mean, sx, n, cLevel);
    addHistoryEntry({ type: 'tInterval', input: `${cLevel * 100}% t-Interval`, output: `(${lower.toFixed(4)}, ${upper.toFixed(4)})`, data: { lower, upper, me, df, mean, sx, n } });
    updateAppState(prev => ({ ...prev, modal: null }));
  };
  
  const runTTestFromData = ({ mu0, list, alt }: { mu0: string, list: string, alt: string }) => {
    const data = getColumnData(list);
    if (data.length < 2) { toast({ title: "Selected list must have at least 2 numbers.", variant: 'destructive' }); return; }
    const mean = stats.mean(data);
    const sx = stats.stddev(data);
    const n = data.length;
    runTTest(parseFloat(mu0), mean, sx, n, alt);
  };
  
  const runTTestFromStats = ({ mu0, mean, sx, n, alt }: { mu0: string, mean: string, sx: string, n: string, alt: string }) => {
    runTTest(parseFloat(mu0), parseFloat(mean), parseFloat(sx), parseInt(n), alt);
  };

  const runTTest = (mu0: number, mean: number, sx: number, n: number, alt: string) => {
      if ([mu0, mean, sx, n].some(isNaN)) { toast({ title: "Invalid input. Please enter numbers.", variant: 'destructive' }); return; }
      const { tStat, pVal, df } = stats.tTest(mu0, mean, sx, n, alt);
      addHistoryEntry({ type: 'tTest', input: `t-Test for μ ${alt.replace('μ', mu0)}`, output: `t=${tStat.toFixed(4)}\np=${pVal.toFixed(4)}`, data: { tStat, pVal, df, mu0, mean, sx, n } });
      updateAppState(prev => ({ ...prev, modal: null }));
  };
  
  const runNormalCdf = ({ lower, upper, mu, sigma }: Record<string, string>) => {
    const params = [lower, upper, mu, sigma].map(parseFloat);
    if (params.some(isNaN)) { toast({ title: "Invalid input.", variant: 'destructive' }); return; }
    const result = stats.normalCdf(params[0], params[1], params[2], params[3]);
    addHistoryEntry({ type: 'NormalCdf', input: `normCdf(${params.join(',')})`, output: result.toFixed(6), data: { params, result } });
    updateAppState(prev => ({ ...prev, modal: null }));
  };

  const runInvNorm = ({ area, mu, sigma }: Record<string, string>) => {
    const params = [area, mu, sigma].map(parseFloat);
    if (params.some(isNaN)) { toast({ title: "Invalid input.", variant: 'destructive' }); return; }
    const result = stats.invNorm(params[0], params[1], params[2]);
    addHistoryEntry({ type: 'InvNorm', input: `invNorm(${params.join(',')})`, output: result.toFixed(6), data: { params, result } });
    updateAppState(prev => ({ ...prev, modal: null }));
  };
  
  const runBinomPdf = ({ n, p, x }: Record<string, string>) => {
      const params = { n: parseInt(n), p: parseFloat(p), x: parseInt(x) };
      if (Object.values(params).some(isNaN)) { toast({ title: "Invalid input.", variant: 'destructive' }); return; }
      const result = stats.binomialPdf(params.n, params.p, params.x);
      addHistoryEntry({ type: 'BinomPdf', input: `binomPdf(${n},${p},${x})`, output: result.toFixed(6), data: { ...params, result } });
      updateAppState(prev => ({ ...prev, modal: null }));
  };

  const runBinomCdf = ({ n, p, x }: Record<string, string>) => {
      const params = { n: parseInt(n), p: parseFloat(p), x: parseInt(x) };
      if (Object.values(params).some(isNaN)) { toast({ title: "Invalid input.", variant: 'destructive' }); return; }
      let totalProb = 0;
      for (let i = 0; i <= params.x; i++) {
          totalProb += stats.binomialPdf(params.n, params.p, i);
      }
      addHistoryEntry({ type: 'BinomCdf', input: `binomCdf(${n},${p},${x})`, output: totalProb.toFixed(6), data: { ...params, result: totalProb } });
      updateAppState(prev => ({ ...prev, modal: null }));
  };

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
                    <DropdownMenuSub>
                       <DropdownMenuSubTrigger>Statistics</DropdownMenuSubTrigger>
                       <DropdownMenuPortal>
                           <DropdownMenuSubContent>
                               <DropdownMenuItem onSelect={() => showModal('1varstats')}>One-Variable Statistics</DropdownMenuItem>
                               <DropdownMenuItem onSelect={() => showModal('linreg')}>Linear Regression (a+bx)</DropdownMenuItem>
                           </DropdownMenuSubContent>
                       </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuSub>
                       <DropdownMenuSubTrigger>Tests</DropdownMenuSubTrigger>
                       <DropdownMenuPortal>
                           <DropdownMenuSubContent>
                               <DropdownMenuItem onSelect={() => showModal('ttest')}>t-Test...</DropdownMenuItem>
                           </DropdownMenuSubContent>
                       </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuSub>
                       <DropdownMenuSubTrigger>Intervals</DropdownMenuSubTrigger>
                       <DropdownMenuPortal>
                           <DropdownMenuSubContent>
                               <DropdownMenuItem onSelect={() => showModal('tinterval')}>t-Interval...</DropdownMenuItem>
                           </DropdownMenuSubContent>
                       </DropdownMenuPortal>
                    </DropdownMenuSub>
                     <DropdownMenuSub>
                       <DropdownMenuSubTrigger>Distributions</DropdownMenuSubTrigger>
                       <DropdownMenuPortal>
                           <DropdownMenuSubContent>
                               <DropdownMenuItem onSelect={() => showModal('normalcdf')}>Normal Cdf</DropdownMenuItem>
                               <DropdownMenuItem onSelect={() => showModal('invnorm')}>Inverse Normal</DropdownMenuItem>
                               <DropdownMenuItem onSelect={() => showModal('binompdf')}>Binomial Pdf</DropdownMenuItem>
                               <DropdownMenuItem onSelect={() => showModal('binomcdf')}>Binomial Cdf</DropdownMenuItem>
                           </DropdownMenuSubContent>
                       </DropdownMenuPortal>
                    </DropdownMenuSub>
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
