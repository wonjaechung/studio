
"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as math from 'mathjs';
import { generateExplanation } from '@/ai/flows/generate-explanation';
import { generateGameQuestion } from '@/ai/flows/generate-game-question';
import { checkGameAnswer } from '@/ai/flows/check-game-answer';
import type { GameQuestion } from '@/ai/flows/generate-game-question';

import { ImporterPanel } from '@/components/panels/ImporterPanel';
import { CalculatorPanel } from '@/components/panels/CalculatorPanel';
import { GraphingPanel } from '@/components/panels/GraphingPanel';
import { SpreadsheetPanel } from '@/components/panels/SpreadsheetPanel';
import { StatisticsMenu } from '@/components/StatisticsMenu';
import { ActionModal } from '@/components/ActionModal';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from '@/components/ui/alert-dialog';

import type { AppState, SpreadsheetState, CalculatorState, GraphingState, ModalConfig, SpreadsheetColumn } from '@/lib/types';
import { stats } from '@/lib/stats';
import { useToast } from '@/hooks/use-toast';

const initialAppState: AppState = {
    spreadsheet: {
        columns: [],
        activeCell: { col: -1, row: -1 },
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
        timeLeft: 600, // 10 minutes
    }
};

export default function Home() {
    const [appState, setAppState] = useState<AppState>(initialAppState);
    const { toast } = useToast();
    const gameTimerRef = useRef<NodeJS.Timeout | null>(null);

    const setSpreadsheetState = (update: Partial<SpreadsheetState>) => {
        setAppState(prev => ({ ...prev, spreadsheet: { ...prev.spreadsheet, ...update } }));
    };
    const setCalculatorState = (update: Partial<CalculatorState>) => {
        setAppState(prev => ({ ...prev, calculator: { ...prev.calculator, ...update } }));
    };
    const setGraphingState = (update: Partial<GraphingState>) => {
        setAppState(prev => ({ ...prev, graphing: { ...prev.graphing, ...update } }));
    };

    const addHistoryEntry = useCallback(async (entry: Omit<typeof appState.calculator.history[0], 'id'>, explain = false) => {
        const newEntry = { ...entry, id: crypto.randomUUID() };
        setAppState(prev => ({...prev, calculator: { history: [newEntry, ...prev.calculator.history]}}));

        if (explain) {
            try {
                const explanation = await generateExplanation({
                    input: newEntry.input,
                    output: newEntry.output,
                    type: newEntry.type,
                    data: newEntry.data,
                });
                setAppState(prev => ({
                    ...prev,
                    calculator: {
                        ...prev.calculator,
                        history: prev.calculator.history.map(h => h.id === newEntry.id ? { ...h, explanation } : h)
                    }
                }));
            } catch (error) {
                console.error("Failed to generate explanation:", error);
                 setAppState(prev => ({
                    ...prev,
                    calculator: {
                        ...prev.calculator,
                        history: prev.calculator.history.map(h => h.id === newEntry.id ? { ...h, explanation: "Could not generate an explanation." } : h)
                    }
                }));
            }
        }
    }, []);

    const showMessageModal = (message: string, title = "Info") => {
        setAppState(prev => ({
            ...prev,
            modal: { id: 'message', title, fields: [{ type: 'static', label: message }], buttons: [{ label: 'OK', action: 'closeModal' }] }
        }));
    };

    const getColumnData = useCallback((name: string): number[] => {
        const col = appState.spreadsheet.columns.find(c => c.name === name);
        return col ? col.data.map(v => parseFloat(v as string)).filter(v => !isNaN(v)) : [];
    }, [appState.spreadsheet.columns]);
    
    const addDataColumn = (name: string, data: any[] = [], formula?: string) => {
        setAppState(prev => {
            const newColumns = [...prev.spreadsheet.columns];
            const existingIndex = newColumns.findIndex(c => c.name === name);
            if (existingIndex > -1) {
                newColumns[existingIndex] = { ...newColumns[existingIndex], data, formula };
            } else {
                newColumns.push({ name, data, formula });
            }
            return { ...prev, spreadsheet: { ...prev.spreadsheet, columns: newColumns } };
        });
    };

    const handleLoadSampleData = useCallback(() => {
        const studyHours = [1, 1.5, 1.8, 2, 2.5, 3, 3.2, 3.8, 4, 4.5, 5, 5.5, 6];
        const examScores = [65, 68, 70, 75, 72, 80, 85, 88, 85, 92, 95, 98, 94];
        const newColumns: SpreadsheetColumn[] = [
            { name: 'hours', data: studyHours },
            { name: 'score', data: examScores }
        ];
        setAppState(prev => ({
            ...prev,
            spreadsheet: { ...prev.spreadsheet, columns: newColumns, isDataLoaded: true }
        }));
    }, []);

    const handleRunCommand = useCallback(async (command: string) => {
        if (appState.game.isActive && appState.game.question) {
            const { question, answer } = appState.game.question;
            const { isCorrect, feedback } = await checkGameAnswer({ question, userAnswer: command, correctAnswer: answer });
            const output = isCorrect ? 'Correct!' : 'Incorrect';
            addHistoryEntry({ input: `Answer: ${command}`, output: `${output}\n${feedback}` });
            if (isCorrect) {
                toast({ title: "Correct!", description: "Generating next question..." });
                handleNewGameQuestion();
            }
            return;
        }

        const pythonCommand = "df = pd.read_csv('lab_data_1.csv')";
        const sqlCommand = "SELECT study_hours, exam_score FROM student_performance;";

        if (command === pythonCommand || command === sqlCommand) {
            handleLoadSampleData();
            addHistoryEntry({ input: command, output: "Success", explanation: "Sample dataset loaded into the spreadsheet." });
        } else if (command.toLowerCase().includes('read_csv') || command.toLowerCase().includes('select')) {
            addHistoryEntry({ input: command, output: "Error", explanation: "Incorrect query. Please copy the command from the 'Import Lab Data' panel exactly." });
        } else if (command === 'df.head()') {
            if (appState.spreadsheet.isDataLoaded) {
                setGraphingState({ currentView: { type: 'dataframe' } });
                addHistoryEntry({ input: command, output: "DataFrame head displayed in Viewer." });
            } else {
                addHistoryEntry({ input: command, output: "Error", explanation: "NameError: name 'df' is not defined. Load data first." });
            }
        } else {
            try {
                const result = math.evaluate(command);
                const output = math.format(result, { precision: 14 });
                addHistoryEntry({ input: command, output });
            } catch (err: any) {
                addHistoryEntry({ input: command, output: 'Error', explanation: err.message });
            }
        }
    }, [appState.spreadsheet.isDataLoaded, appState.game.isActive, appState.game.question, addHistoryEntry, handleLoadSampleData, toast]);
    
    const handlePlotFunction = useCallback(() => {
        const expression = appState.graphing.functionInput;
        if (!expression) {
            setGraphingState({ currentView: { type: 'default' } });
            return;
        }
        try {
            const node = math.parse(expression);
            const code = node.compile();
            const xValues = math.range(-10, 10, 0.2).toArray() as number[];
            const yValues = xValues.map((x: number) => code.evaluate({ x: x }));
            const trace = { x: xValues, y: yValues, type: 'scatter', mode: 'lines' };
            setGraphingState({ currentView: { type: 'plot', data: [trace], layout: { title: `f(x) = ${expression}` } } });
        } catch (err: any) {
            showMessageModal(err.message, "Plotting Error");
        }
    }, [appState.graphing.functionInput]);

    const handleModalAction = (action: string, data: Record<string, string>) => {
        const actions: Record<string, (data: Record<string, string>) => void> = {
            closeModal: () => setAppState(prev => ({ ...prev, modal: null })),
            run1VarStats: (data) => {
                const listName = data.x1list;
                const colData = getColumnData(listName);
                if (colData.length === 0) return showMessageModal('Selected list is empty.');
                const results = { 'x̄': stats.mean(colData), 'Σx': stats.sum(colData), 'Σx²': stats.sum(colData.map(x => x * x)), 'Sx': stats.stddev(colData, false), 'σx': stats.stddev(colData, true), n: colData.length, minX: Math.min(...colData), q1: stats.quartile(colData, 0.25), median: stats.median(colData), q3: stats.quartile(colData, 0.75), maxX: Math.max(...colData)};
                addHistoryEntry({ type: '1VarStats', input: `1-Var Stats for ${listName}`, output: `Mean: ${results.x̄.toFixed(4)}, Sx: ${results.Sx.toFixed(4)}`, data: { results, listName }}, true);
            },
            runLinReg: (data) => {
                const { xlist, ylist } = data;
                const xData = getColumnData(xlist);
                const yData = getColumnData(ylist);
                if (xData.length < 2 || xData.length !== yData.length) return showMessageModal("X and Y lists must have the same number of data points (at least 2).");
                const n = xData.length; const sumX = stats.sum(xData); const sumY = stats.sum(yData); const sumXY = stats.sum(xData.map((x, i) => x * yData[i])); const sumX2 = stats.sum(xData.map(x => x*x)); const sumY2 = stats.sum(yData.map(y => y*y));
                const b = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX); const a = (sumY / n) - b * (sumX / n); const r = math.corr(xData, yData) as number;
                addHistoryEntry({ type: 'LinReg', input: `LinReg for ${ylist} vs ${xlist}`, output: `y = ${a.toFixed(4)} + ${b.toFixed(4)}x\nr² = ${(r*r).toFixed(4)}`, data: { y: ylist, x: xlist, a, b, r, r2: r*r } }, true);
            },
            runTIntervalFromData: (data) => {
                const listName = data.list;
                const cLevel = parseFloat(data.clevel);
                const colData = getColumnData(listName);
                if (colData.length < 2) return showMessageModal("List must have at least 2 numbers.");
                const mean = stats.mean(colData); const sx = stats.stddev(colData); const n = colData.length; const df = n - 1;
                const tStar = stats.invT(1 - (1 - cLevel) / 2, df);
                const me = tStar * (sx / Math.sqrt(n));
                const lower = mean - me; const upper = mean + me;
                addHistoryEntry({ type: 'tInterval', input: `t-Interval for ${listName}`, output: `(${lower.toFixed(4)}, ${upper.toFixed(4)})`, data: { listName, cLevel, mean, sx, n, df, lower, upper } }, true);
            },
            runTTest: (data) => {
                const { mu0, mean, sx, n, alt } = Object.fromEntries(Object.entries(data).map(([k, v]) => [k, k === 'alt' ? v : parseFloat(v)]));
                if (isNaN(mu0 as number) || isNaN(mean as number) || isNaN(sx as number) || isNaN(n as number)) return showMessageModal("Invalid numeric input for t-Test.");
                const df = (n as number) - 1;
                const tStat = ((mean as number) - (mu0 as number)) / ((sx as number) / Math.sqrt(n as number));
                let pVal;
                if (alt === 'μ < μ₀') pVal = stats.tCdf(tStat, df);
                else if (alt === 'μ > μ₀') pVal = 1 - stats.tCdf(tStat, df);
                else pVal = 2 * (1 - stats.tCdf(Math.abs(tStat), df));
                addHistoryEntry({ type: 'tTest', input: `t-Test: μ ${alt.replace('μ', '')} ${mu0}`, output: `t=${tStat.toFixed(4)}, p=${pVal.toFixed(4)}`, data: { ...data, df, tStat, pVal } }, true);
            },
            runNormalCdf: (data) => {
                const { lower, upper, mu, sigma } = Object.fromEntries(Object.entries(data).map(([k,v]) => [k, parseFloat(v)]));
                const result = stats.normalCdf(lower, upper, mu, sigma);
                addHistoryEntry({type: 'NormalCdf', input: `normCdf(${lower},${upper},${mu},${sigma})`, output: result.toFixed(6), data, explain: true});
            },
            runInvNorm: (data) => {
                 const { area, mu, sigma } = Object.fromEntries(Object.entries(data).map(([k,v]) => [k, parseFloat(v)]));
                const result = stats.invNorm(area, mu, sigma);
                addHistoryEntry({type: 'InvNorm', input: `invNorm(${area},${mu},${sigma})`, output: result.toFixed(6), data, explain: true});
            },
            runBinomPdf: (data) => {
                const { n, p, x } = Object.fromEntries(Object.entries(data).map(([k,v]) => [k, parseFloat(v)]));
                const result = stats.binomialPdf(n, p, x);
                addHistoryEntry({type: 'BinomPdf', input: `binomPdf(n=${n},p=${p},x=${x})`, output: result.toFixed(6), data, explain: true});
            },
            runBinomCdf: (data) => {
                const { n, p, x } = Object.fromEntries(Object.entries(data).map(([k,v]) => [k, parseFloat(v)]));
                let totalProb = 0; for (let i = 0; i <= x; i++) { totalProb += stats.binomialPdf(n, p, i); }
                addHistoryEntry({type: 'BinomCdf', input: `binomCdf(n=${n},p=${p},x=${x})`, output: totalProb.toFixed(6), data, explain: true});
            },
            runGeomPdf: (data) => {
                const { p, x } = Object.fromEntries(Object.entries(data).map(([k,v]) => [k, parseFloat(v)]));
                const result = stats.geometricPdf(p, x);
                addHistoryEntry({type: 'GeomPdf', input: `geomPdf(p=${p},x=${x})`, output: result.toFixed(6), data, explain: true});
            },
            runGeomCdf: (data) => {
                 const { p, lower, upper } = Object.fromEntries(Object.entries(data).map(([k,v]) => [k, parseFloat(v)]));
                let totalProb = 0; for (let i = lower; i <= upper; i++) { totalProb += stats.geometricPdf(p, i); }
                addHistoryEntry({type: 'GeomCdf', input: `geomCdf(p=${p},l=${lower},u=${upper})`, output: totalProb.toFixed(6), data, explain: true});
            }
        };

        if (actions[action]) {
            actions[action](data);
        }
        setAppState(prev => ({ ...prev, modal: null }));
    };

    const handleNewGameQuestion = async () => {
        try {
            const questionData = await generateGameQuestion();
            setAppState(prev => ({ ...prev, game: { ...prev.game, question: questionData } }));
            addHistoryEntry({
                input: `New Question (${questionData.topic})`,
                output: questionData.question,
                explanation: "Use the app's tools to solve the problem. Type your answer in the console below."
            });
        } catch (error) {
            console.error("Failed to generate game question:", error);
            showMessageModal("Could not load a new game question. Please try again.", "Error");
            setAppState(prev => ({ ...prev, game: { ...prev.game, isActive: false } }));
        }
    };

    const toggleGameMode = () => {
        setAppState(prev => {
            const willBeActive = !prev.game.isActive;
            if (willBeActive) {
                // Start game
                handleNewGameQuestion();
                if (gameTimerRef.current) clearInterval(gameTimerRef.current);
                gameTimerRef.current = setInterval(() => {
                    setAppState(p => {
                        if (p.game.timeLeft <= 1) {
                            clearInterval(gameTimerRef.current!);
                             addHistoryEntry({ input: "Time's Up!", output: "Game Over.", explanation: "Click Game Mode to play again." });
                            return { ...p, game: { ...p.game, isActive: false, question: null, timeLeft: 600 } };
                        }
                        return { ...p, game: { ...p.game, timeLeft: p.game.timeLeft - 1 }};
                    });
                }, 1000);
            } else {
                // Stop game
                if (gameTimerRef.current) clearInterval(gameTimerRef.current);
            }
            return { ...prev, game: { ...prev.game, isActive: willBeActive, timeLeft: willBeActive ? 600 : 0 } };
        });
    };
    
    return (
        <>
            <main className="main-grid">
                <div id="importer"><ImporterPanel /></div>
                <div id="calculator">
                    <CalculatorPanel
                        state={appState.calculator}
                        gameState={appState.game}
                        onRunCommand={handleRunCommand}
                        onToggleGameMode={toggleGameMode}
                    />
                </div>
                <div id="graphing">
                    <GraphingPanel
                        state={appState.graphing}
                        spreadsheetColumns={appState.spreadsheet.columns}
                        onFunctionInputChange={(value) => setGraphingState({ functionInput: value })}
                        onPlotFunction={handlePlotFunction}
                        setGraphingState={setGraphingState}
                        showMessageModal={showMessageModal}
                    />
                </div>
                <div id="spreadsheet">
                    <SpreadsheetPanel
                        state={appState.spreadsheet}
                        setState={setSpreadsheetState}
                        onMenuClick={() => setAppState(prev => ({...prev, isStatsMenuOpen: true}))}
                        onClearClick={() => showMessageModal("Clear all spreadsheet data?", "Confirm Clear")}
                    />
                </div>
            </main>
            {appState.isStatsMenuOpen && (
                <StatisticsMenu
                    onClose={() => setAppState(prev => ({...prev, isStatsMenuOpen: false}))}
                    onMenuAction={(config) => setAppState(prev => ({...prev, modal: config, isStatsMenuOpen: false}))}
                    hasData={appState.spreadsheet.columns.length > 0 && appState.spreadsheet.columns.some(c => c.data.length > 0)}
                    showMessageModal={showMessageModal}
                />
            )}
            {appState.modal && (
                appState.modal.id === 'message' ? (
                     <AlertDialog open onOpenChange={() => setAppState(prev => ({...prev, modal: null}))}>
                        <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>{appState.modal.title}</AlertDialogTitle></AlertDialogHeader>
                            <AlertDialogDescription>{appState.modal.fields[0].label}</AlertDialogDescription>
                            <AlertDialogFooter>
                                <AlertDialogAction onClick={() => {
                                    if(appState.modal?.title.includes("Clear")) {
                                        setAppState(prev => ({...prev, spreadsheet: initialAppState.spreadsheet}))
                                    }
                                    setAppState(prev => ({...prev, modal: null}));
                                }}>OK</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                ) : (
                    <ActionModal
                        modalConfig={appState.modal}
                        columns={appState.spreadsheet.columns.filter(c => c.name)}
                        onClose={() => setAppState(prev => ({...prev, modal: null}))}
                        onAction={handleModalAction}
                    />
                )
            )}
        </>
    );
}
