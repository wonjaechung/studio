
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { AppState, ModalConfig, SpreadsheetColumn, Question } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { generateExplanation } from '@/ai/flows/generate-explanation';
import { statsQuestions } from '@/lib/questions';
import * as math from 'mathjs';
import { stats } from '@/lib/stats';
import { ImporterPanel } from './panels/ImporterPanel';
import { CalculatorPanel } from './panels/CalculatorPanel';
import { GraphingPanel } from './panels/GraphingPanel';
import { SpreadsheetPanel } from './panels/SpreadsheetPanel';
import { ActionModal } from './ActionModal';
import { StatisticsMenu } from './StatisticsMenu';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from './ui/alert-dialog';

const initialState: AppState = {
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
  game: {
    isActive: false,
    question: null,
    timeLeft: 600,
  },
};

export function MainApp() {
  const [appState, setAppState] = useState<AppState>(initialState);
  const { toast } = useToast();
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);

  const setState = (updater: (prevState: AppState) => AppState) => {
    setAppState(updater);
  };
  
  const addHistoryEntry = useCallback(async (entry: Omit<import('@/lib/types').CalculatorEntry, 'id'>, explain = false) => {
    const newEntry = { ...entry, id: crypto.randomUUID() };
    
    setState(prev => ({
      ...prev,
      calculator: {
        ...prev.calculator,
        history: [newEntry, ...prev.calculator.history]
      }
    }));

    if (explain) {
      try {
        const explanation = await generateExplanation({ input: newEntry.input, output: newEntry.output, type: newEntry.type, data: newEntry.data });
        setState(prev => ({
          ...prev,
          calculator: {
            ...prev.calculator,
            history: prev.calculator.history.map(h => h.id === newEntry.id ? { ...h, explanation } : h)
          }
        }));
      } catch (error) {
        console.error("Failed to generate explanation:", error);
        setState(prev => ({
          ...prev,
          calculator: {
            ...prev.calculator,
            history: prev.calculator.history.map(h => h.id === newEntry.id ? { ...h, explanation: "Could not generate an explanation." } : h)
          }
        }));
      }
    }
  }, []);

    const handleNewGameQuestion = useCallback(() => {
        const questionData = statsQuestions[Math.floor(Math.random() * statsQuestions.length)];
        const answerOptionsText = questionData.answerOptions.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt.text}`).join('\n');
        setState(prev => ({
            ...prev,
            game: { ...prev.game, question: questionData }
        }));
        addHistoryEntry({
            input: `New Question (${questionData.tags.join(', ')})`,
            output: `${questionData.questionText}\n\n${answerOptionsText}`,
            explanation: "Select the correct letter (A, B, C, D, or E) and type it in the console below."
        });
    }, [addHistoryEntry]);
  
  const toggleGameMode = useCallback(() => {
    setState(prev => {
        const willBeActive = !prev.game.isActive;
        if (willBeActive) {
            handleNewGameQuestion();
            if (gameTimerRef.current) clearInterval(gameTimerRef.current);
            gameTimerRef.current = setInterval(() => {
                setState(p => {
                    if (p.game.timeLeft <= 1) {
                        if (gameTimerRef.current) clearInterval(gameTimerRef.current);
                        addHistoryEntry({ input: "Time's Up!", output: "Game Over.", explanation: "Click Game Mode to play again." });
                        return { ...p, game: { ...p.game, isActive: false, timeLeft: 0 } };
                    }
                    return { ...p, game: { ...p.game, timeLeft: p.game.timeLeft - 1 } };
                });
            }, 1000);
            return { ...prev, game: { ...prev.game, isActive: true, timeLeft: 600 } };
        } else {
            if (gameTimerRef.current) clearInterval(gameTimerRef.current);
            return { ...prev, game: { ...prev.game, isActive: false, question: null } };
        }
    });
  }, [handleNewGameQuestion, addHistoryEntry]);


  useEffect(() => {
    return () => {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
      }
    };
  }, []);

  const getColumnData = useCallback((name: string): number[] => {
    const col = appState.spreadsheet.columns.find(c => c.name === name);
    return col ? col.data.map(v => parseFloat(v as string)).filter(v => !isNaN(v)) : [];
  }, [appState.spreadsheet.columns]);

  const showMessageModal = (message: string, title = "Info") => {
    setState(prev => ({ ...prev, modal: {
      id: 'message',
      title,
      fields: [{type: 'static', label: message}],
      buttons: [{label: 'OK', action: 'closeModal'}]
    }}));
  };
  
  const addDataColumn = (name: string, data: any[] = [], formula?: string) => {
    setState(prev => {
        const newColumns = [...prev.spreadsheet.columns];
        const existingIndex = newColumns.findIndex(c => c.name === name);
        if (existingIndex > -1) {
            newColumns[existingIndex] = { ...newColumns[existingIndex], data };
            if (formula) newColumns[existingIndex].formula = formula;
        } else {
            newColumns.push({ name, data, formula });
        }
        return { ...prev, spreadsheet: { ...prev.spreadsheet, columns: newColumns }};
    });
  };

    const handleRunCommand = async (command: string) => {
        if (appState.game.isActive && appState.game.question) {
            const answerLetter = command.trim().toUpperCase();
            const { question } = appState.game;
            const choiceIndex = answerLetter.charCodeAt(0) - 65; // A=0, B=1, etc.
            
            if (choiceIndex >= 0 && choiceIndex < question.answerOptions.length) {
                const selectedOption = question.answerOptions[choiceIndex];
                const isCorrect = selectedOption.isCorrect;
                const feedback = isCorrect ? "Correct! Well done." : `Not quite. The correct answer was ${question.answerOptions.find(o => o.isCorrect)!.text.charAt(0)}.`;
                addHistoryEntry({ input: `Answer: ${answerLetter}`, output: feedback });

                if (isCorrect) {
                    toast({ title: "Correct!", description: "Generating next question..." });
                    handleNewGameQuestion();
                }
            } else {
                addHistoryEntry({ input: `Answer: ${command}`, output: "Invalid answer. Please enter a letter (A-E)." });
            }
            return;
        }
    
    const pythonCommand = "df = pd.read_csv('lab_data_1.csv')";
    const sqlCommand = "SELECT study_hours, exam_score FROM student_performance;";

    if (command === pythonCommand || command === sqlCommand) {
        const studyHours = [1, 1.5, 1.8, 2, 2.5, 3, 3.2, 3.8, 4, 4.5, 5, 5.5, 6];
        const examScores = [65, 68, 70, 75, 72, 80, 85, 88, 85, 92, 95, 98, 94];
        setState(prev => ({...prev, spreadsheet: {...initialState.spreadsheet, columns: [], isDataLoaded: true}}));
        addDataColumn('hours', studyHours);
        addDataColumn('score', examScores);
        addHistoryEntry({ input: command, output: "Success", explanation: "Sample dataset loaded into the spreadsheet." });
    } else if (command.toLowerCase().includes('read_csv') || command.toLowerCase().includes('select')) {
        addHistoryEntry({ input: command, output: "Error", explanation: "Incorrect query. Please copy the command from the 'Import Lab Data' panel exactly." });
    } else if (command === 'df.head()') {
        if (appState.spreadsheet.isDataLoaded) {
            setState(prev => ({...prev, graphing: {...prev.graphing, currentView: { type: 'dataframe' }}}));
            addHistoryEntry({ input: command, output: "DataFrame head displayed in Viewer." });
        } else {
            addHistoryEntry({ input: command, output: "Error", explanation: "NameError: name 'df' is not defined. Load data first." });
        }
    } else {
        try {
            const result = math.evaluate(command);
            addHistoryEntry({ input: command, output: math.format(result, { precision: 14 }) });
        } catch (err: any) {
            addHistoryEntry({ input: command, output: 'Error', explanation: err.message });
        }
    }
  };
  
  const handlePlotFunction = () => {
    const expression = appState.graphing.functionInput;
    if (!expression) {
        setState(prev => ({...prev, graphing: {...prev.graphing, currentView: { type: 'default' }}}));
        return;
    }
    try {
        const node = math.parse(expression);
        const code = node.compile();
        const xValues = math.range(-10, 10, 0.2).toArray() as number[];
        const yValues = xValues.map((x: number) => code.evaluate({ x: x }));
        const trace = { x: xValues, y: yValues, type: 'scatter', mode: 'lines', line: { color: 'hsl(var(--primary))', width: 2 } };
        setState(prev => ({...prev, graphing: {...prev.graphing, currentView: { type: 'plot', data: [trace], layout: { title: `f(x) = ${expression}` } }}}));
    } catch (err: any) {
        showMessageModal(err.message, "Plotting Error");
    }
  };

  const setSpreadsheetState = (update: Partial<import('@/lib/types').SpreadsheetState> | ((prevState: import('@/lib/types').SpreadsheetState) => Partial<import('@/lib/types').SpreadsheetState>)) => {
      setState(prev => ({
          ...prev,
          spreadsheet: typeof update === 'function' 
              ? { ...prev.spreadsheet, ...update(prev.spreadsheet) }
              : { ...prev.spreadsheet, ...update }
      }));
  };
  
  const setGraphingState = (update: Partial<import('@/lib/types').GraphingState>) => {
      setState(prev => ({...prev, graphing: {...prev.graphing, ...update}}));
  };
  
  const handleModalAction = (action: string, data: Record<string, any>) => {
    const getNextAvailableColumnIndex = () => appState.spreadsheet.columns.length;

    const modalActions: Record<string, Function> = {
        closeModal: () => setState(prev => ({ ...prev, modal: null })),
        run1VarStats: () => {
          const { x1list } = data;
          const colData = getColumnData(x1list);
          if (colData.length === 0) return showMessageModal('Selected list is empty.');
          const results = { 'Title': 'One-Var Stats', 'x̄': stats.mean(colData), 'Σx': stats.sum(colData), 'Σx²': stats.sum(colData.map(x => x * x)), 'Sx': stats.stddev(colData, false), 'σx': stats.stddev(colData, true), n: colData.length, minX: Math.min(...colData), q1: stats.quartile(colData, 0.25), median: stats.median(colData), q3: stats.quartile(colData, 0.75), maxX: Math.max(...colData)};
          
          const resultColIndex = getNextAvailableColumnIndex();
          addDataColumn(String.fromCharCode(65 + resultColIndex), Object.keys(results).map(k => `${k}:`));
          addDataColumn(String.fromCharCode(65 + resultColIndex + 1), Object.values(results).map(v => typeof v === 'number' ? v.toFixed(4) : v), `=OneVar(${x1list})`);
          
          addHistoryEntry({ type: '1VarStats', input: `1-Var Stats for ${x1list}`, output: `Mean: ${results.x̄.toFixed(4)}, Sx: ${results.Sx.toFixed(4)}`, data: { results, listName: x1list }}, true);
        },
        runLinReg: () => {
          const { xlist, ylist } = data;
          const xData = getColumnData(xlist);
          const yData = getColumnData(ylist);
          if (xData.length < 2 || xData.length !== yData.length) return showMessageModal("X and Y lists must have the same number of data points (at least 2).");
          
          const { a, b, r } = stats.linReg(xData, yData);
          const residuals = xData.map((x, i) => yData[i] - (a + b * x));
          const results = { 'Title': 'LinReg(a+bx)', 'RegEqn': 'a+bx', 'a': a, 'b': b, 'r²': r*r, 'r': r };
          
          const resultColIndex = getNextAvailableColumnIndex();
          addDataColumn(String.fromCharCode(65 + resultColIndex), Object.keys(results).map(k => `${k}:`));
          addDataColumn(String.fromCharCode(65 + resultColIndex + 1), Object.values(results).map(v => typeof v === 'number' ? v.toFixed(4) : v), `=LinReg(${xlist},${ylist})`);
          addDataColumn('statresid', residuals.map(res => res.toFixed(4)));

          addHistoryEntry({ type: 'LinReg', input: `LinReg for ${ylist} vs ${xlist}`, output: `y = ${a.toFixed(4)} + ${b.toFixed(4)}x\nr² = ${(r*r).toFixed(4)}`, data: { y: ylist, x: xlist, a, b, r, r2: r*r } }, true);
        },
        runTIntervalFromData: () => {
          const { list, clevel } = data;
          const cLevelNum = parseFloat(clevel);
          const colData = getColumnData(list);
          if (colData.length < 2) return showMessageModal("List must have at least 2 numbers.");
          const mean = stats.mean(colData); const sx = stats.stddev(colData); const n = colData.length; const df = n - 1;
          const tStar = stats.invT(1 - (1 - cLevelNum) / 2, df);
          const me = tStar * (sx / Math.sqrt(n));
          const lower = mean - me; const upper = mean + me;
          addHistoryEntry({ type: 'tInterval', input: `t-Interval for ${list}`, output: `(${lower.toFixed(4)}, ${upper.toFixed(4)})`, data: { listName: list, cLevel: cLevelNum, mean, sx, n, df, lower, upper } }, true);
        },
        runTTest: () => {
            const mu0 = parseFloat(data.mu0);
            const mean = parseFloat(data.mean);
            const sx = parseFloat(data.sx);
            const n = parseInt(data.n);
            const alt = data.alt;
            if (isNaN(mu0) || isNaN(mean) || isNaN(sx) || isNaN(n)) return showMessageModal("Invalid numeric input for t-Test.");
            const df = n - 1;
            const tStat = (mean - mu0) / (sx / Math.sqrt(n));
            let pVal;
            if (alt === 'μ &lt; μ₀') pVal = stats.tCdf(tStat, df);
            else if (alt === 'μ &gt; μ₀') pVal = 1 - stats.tCdf(tStat, df);
            else pVal = 2 * (1 - stats.tCdf(Math.abs(tStat), df));
            addHistoryEntry({ type: 'tTest', input: `t-Test: μ ${alt.replace('μ', '')} ${mu0}`, output: `t=${tStat.toFixed(4)}, p=${pVal.toFixed(4)}`, data: { mu0, mean, sx, n, alt, df, tStat, pVal } }, true);
        },
        run2PropZInt: () => {
            const { x1, n1, x2, n2, clevel } = data;
            const nums = [x1, n1, x2, n2, clevel].map(parseFloat);
            if (nums.some(isNaN)) return showMessageModal('All inputs must be valid numbers.');
            const [nx1, nn1, nx2, nn2, nclevel] = nums;
            const p1 = nx1 / nn1; const p2 = nx2 / nn2;
            const zStar = stats.invNorm(1 - (1-nclevel)/2, 0, 1);
            const se = Math.sqrt(p1 * (1 - p1) / nn1 + p2 * (1 - p2) / nn2);
            const diff = p1 - p2;
            const lower = diff - zStar * se; const upper = diff + zStar * se;
            addHistoryEntry({ type: '2PropZInt', input: `2-Prop Z-Int`, output: `(${lower.toFixed(4)}, ${upper.toFixed(4)})`, data: { x1: nx1, n1: nn1, x2: nx2, n2: nn2, p1, p2, diff, lower, upper, clevel: nclevel } }, true);
        },
        run2PropZTest: () => {
            const { x1, n1, x2, n2, alt } = data;
            const nums = [x1, n1, x2, n2].map(parseFloat);
            if (nums.some(isNaN)) return showMessageModal('All inputs must be valid numbers.');
            const [nx1, nn1, nx2, nn2] = nums;
            const p1 = nx1 / nn1; const p2 = nx2 / nn2;
            const pPooled = (nx1 + nx2) / (nn1 + nn2);
            const se = Math.sqrt(pPooled * (1 - pPooled) * (1 / nn1 + 1 / nn2));
            const zStat = (p1 - p2) / se;
            let pVal;
            if (alt === '&lt; p2') pVal = stats.normalCdf(-Infinity, zStat, 0, 1);
            else if (alt === '&gt; p2') pVal = 1 - stats.normalCdf(-Infinity, zStat, 0, 1);
            else pVal = 2 * (1 - stats.normalCdf(-Infinity, Math.abs(zStat), 0, 1));
            addHistoryEntry({ type: '2PropZTest', input: `2-Prop Z-Test`, output: `z=${zStat.toFixed(4)}, p=${pVal.toFixed(4)}`, data: { x1: nx1, n1: nn1, x2: nx2, n2: nn2, alt, p1, p2, pPooled, zStat, pVal } }, true);
        },
        runChi2GOF: () => {
            const { observed, expected, df } = data;
            const dfNum = parseInt(df);
            if(isNaN(dfNum)) return showMessageModal("Degrees of freedom must be a number.");
            const obsData = getColumnData(observed);
            const expData = getColumnData(expected);
            if (obsData.length !== expData.length || obsData.length === 0) return showMessageModal("Observed and Expected lists must be of the same length.");
            const chi2Stat = stats.sum(obsData.map((obs, i) => Math.pow(obs - expData[i], 2) / expData[i]));
            const pVal = 1 - stats.chi2cdf(chi2Stat, dfNum);
            addHistoryEntry({ type: 'chi2GOF', input: `χ² GOF-Test`, output: `χ²=${chi2Stat.toFixed(4)}, p=${pVal.toFixed(4)}`, data: { obsListName: observed, expListName: expected, df: dfNum, chi2Stat, pVal } }, true);
        },
        runChi2Test: () => {
            const selectedCols = data.observed || [];
            if(selectedCols.length < 2) return showMessageModal("Please select at least two columns for the matrix.");
            const matrix = selectedCols.map((name: string) => getColumnData(name));
            const numRows = matrix[0].length;
            const numCols = matrix.length;
            if (numRows < 2 || numCols < 2 || !matrix.every(col => col.length === numRows)) return showMessageModal("Requires a valid matrix (at least 2x2) with all columns having the same length.");

            const rowTotals = Array(numRows).fill(0);
            const colTotals = Array(numCols).fill(0);
            let total = 0;
            for (let r = 0; r < numRows; r++) { for (let c = 0; c < numCols; c++) { rowTotals[r] += matrix[c][r]; colTotals[c] += matrix[c][r]; total += matrix[c][r]; } }
            
            let chi2Stat = 0;
            for (let r = 0; r < numRows; r++) { for (let c = 0; c < numCols; c++) { const expected = (rowTotals[r] * colTotals[c]) / total; chi2Stat += Math.pow(matrix[c][r] - expected, 2) / expected; } }

            const df = (numRows - 1) * (numCols - 1);
            const pVal = 1 - stats.chi2cdf(chi2Stat, df);
            addHistoryEntry({ type: 'chi2Test', input: `χ² 2-Way Test`, output: `χ²=${chi2Stat.toFixed(4)}, p=${pVal.toFixed(4)}`, data: { selectedCols, df, chi2Stat, pVal } }, true);
        },
        runNormalCdf: () => {
            const [lower, upper, mu, sigma] = [data.lower, data.upper, data.mu, data.sigma].map(parseFloat);
            const result = stats.normalCdf(lower, upper, mu, sigma);
            addHistoryEntry({type: 'NormalCdf', input: `normCdf(${lower},${upper},${mu},${sigma})`, output: result.toFixed(6), data: {lower, upper, mu, sigma}}, true);
        },
        runInvNorm: () => {
            const [area, mu, sigma] = [data.area, data.mu, data.sigma].map(parseFloat);
            const result = stats.invNorm(area, mu, sigma);
            addHistoryEntry({type: 'InvNorm', input: `invNorm(${area},${mu},${sigma})`, output: result.toFixed(6), data: {area, mu, sigma}}, true);
        },
        runBinomPdf: () => {
            const n = parseInt(data.n); const p = parseFloat(data.p); const x = parseInt(data.x);
            const result = stats.binomialPdf(n, p, x);
            addHistoryEntry({type: 'BinomPdf', input: `binomPdf(n=${n},p=${p},x=${x})`, output: result.toFixed(6), data: {n, p, x}}, true);
        },
        runBinomCdf: () => {
            const n = parseInt(data.n); const p = parseFloat(data.p); const x = parseInt(data.x);
            let totalProb = 0; for (let i = 0; i <= x; i++) { totalProb += stats.binomialPdf(n, p, i); }
            addHistoryEntry({type: 'BinomCdf', input: `binomCdf(n=${n},p=${p},x=${x})`, output: totalProb.toFixed(6), data: {n, p, x}}, true);
        },
        runGeomPdf: () => {
            const p = parseFloat(data.p); const x = parseInt(data.x);
            const result = stats.geometricPdf(p, x);
            addHistoryEntry({type: 'GeomPdf', input: `geomPdf(p=${p},x=${x})`, output: result.toFixed(6), data: {p, x}}, true);
        },
        runGeomCdf: () => {
            const p = parseFloat(data.p); const lower = parseInt(data.lower); const upper = parseInt(data.upper);
            let totalProb = 0; for (let i = lower; i <= upper; i++) { totalProb += stats.geometricPdf(p, i); }
            addHistoryEntry({type: 'GeomCdf', input: `geomCdf(p=${p},l=${lower},u=${upper})`, output: totalProb.toFixed(6), data: {p, lower, upper}}, true);
        },
        clearSpreadsheet: () => {
            setState(prev => ({...prev, spreadsheet: initialState.spreadsheet, modal: null }));
        },
    };

    if (modalActions[action]) {
      modalActions[action]();
      if(action !== 'closeModal') {
          setState(prev => ({ ...prev, modal: null }));
      }
    }
  };

  const handleSystemPaste = (event: ClipboardEvent) => {
    event.preventDefault();
    const pasteData = event.clipboardData?.getData('text');
    if (!pasteData) return;

    setState(prev => {
        const rows = pasteData.split('\n').map(r => r.trim());
        const { activeCell } = prev.spreadsheet;
        const newColumns = [...prev.spreadsheet.columns];

        rows.forEach((rowStr, rowIndex) => {
            const cells = rowStr.split('\t');
            cells.forEach((cellStr, colIndex) => {
                const targetRow = activeCell.row + rowIndex;
                const targetCol = activeCell.col + colIndex;
                
                while (targetCol >= newColumns.length) {
                    newColumns.push({ name: String.fromCharCode(65 + newColumns.length), data: [] });
                }
                const numValue = parseFloat(cellStr);
                newColumns[targetCol].data[targetRow] = isNaN(numValue) ? cellStr : numValue;
            });
        });

        return {...prev, spreadsheet: {...prev.spreadsheet, columns: newColumns}};
    });
  };

  useEffect(() => {
    document.addEventListener('paste', handleSystemPaste);
    return () => {
        document.removeEventListener('paste', handleSystemPaste);
    }
  }, []);

  return (
    <main className="main-grid">
      <div id="importer" className="panel">
        <ImporterPanel />
      </div>

      <div id="calculator" className="panel">
        <CalculatorPanel 
            state={appState.calculator} 
            gameState={appState.game}
            onRunCommand={handleRunCommand}
            onToggleGameMode={toggleGameMode}
        />
      </div>

      <div id="graphing" className="panel">
        <GraphingPanel 
            state={appState.graphing}
            spreadsheetColumns={appState.spreadsheet.columns}
            onFunctionInputChange={(value) => setGraphingState({ functionInput: value })}
            onPlotFunction={handlePlotFunction}
            setGraphingState={setGraphingState}
            showMessageModal={showMessageModal}
        />
      </div>

      <div id="spreadsheet" className="panel">
        <SpreadsheetPanel
            state={appState.spreadsheet}
            setState={setSpreadsheetState}
            onMenuClick={() => setState(prev => ({...prev, isStatsMenuOpen: true}))}
            onClearClick={() => setState(prev => ({ ...prev, modal: { id: 'confirmClear', title: 'Confirm Clear', fields: [], buttons: [] } }))}
        />
      </div>
      
      {appState.modal && appState.modal.id !== 'confirmClear' && (
        <ActionModal
          modalConfig={appState.modal}
          columns={appState.spreadsheet.columns}
          onClose={() => setState(prev => ({ ...prev, modal: null }))}
          onAction={handleModalAction}
        />
      )}

      {appState.modal && appState.modal.id === 'confirmClear' && (
         <AlertDialog open onOpenChange={() => setState(prev => ({ ...prev, modal: null }))}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Clear</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete all data from the spreadsheet.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleModalAction('clearSpreadsheet', {})}>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}

      {appState.isStatsMenuOpen && (
        <StatisticsMenu
          hasData={appState.spreadsheet.columns.some(c => c.name)}
          onClose={() => setState(prev => ({ ...prev, isStatsMenuOpen: false }))}
          onMenuAction={(config) => setState(prev => ({ ...prev, modal: config, isStatsMenuOpen: false }))}
          showMessageModal={(message) => {
              setState(prev => ({...prev, isStatsMenuOpen: false}));
              showMessageModal(message);
          }}
        />
      )}
    </main>
  );
}

  