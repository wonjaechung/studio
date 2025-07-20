"use client";

import React, { useEffect, useRef, useCallback } from 'react';
import type { GameQuestion } from '@/ai/flows/generate-game-question';
import * as math from 'mathjs';
import { generateExplanation } from '@/ai/flows/generate-explanation';
import { generateGameQuestion } from '@/ai/flows/generate-game-question';
import { checkGameAnswer } from '@/ai/flows/check-game-answer';
import { stats } from '@/lib/stats';
import { useToast } from '@/hooks/use-toast';

export function MainApp() {
    const { toast } = useToast();
    const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
    const [isGameActive, setIsGameActive] = React.useState(false);
    const [gameTimeLeft, setGameTimeLeft] = React.useState(600);

    const appStateRef = useRef({
        modal: null as HTMLElement | null,
        spreadsheet: {
            columns: [] as { name: string; data: (string | number)[]; formula?: string }[],
            activeCell: { col: 0, row: 0 },
            isEditing: false,
            editValue: '',
            selectionStart: null as { col: number; row: number } | null,
            selectionEnd: null as { col: number; row: number } | null,
            isSelecting: false,
            isDataLoaded: false
        },
        calculator: {
            history: [] as { id: string; input: string; output: string; type?: string; data?: any; explanation?: string }[]
        },
        graphing: {
            pendingPlot: null as { indices: number[] } | null,
            currentView: { type: 'default', data: [] as any[], layout: {} }
        },
        game: {
            isActive: false,
            question: null as GameQuestion | null,
            timeLeft: 600,
        }
    });
     
    const addHistoryEntry = useCallback(async (entry: Omit<typeof appStateRef.current.calculator.history[0], 'id'>, explain = false) => {
        const appState = appStateRef.current;
        const newEntry = { ...entry, id: crypto.randomUUID() };
        appState.calculator.history.unshift(newEntry);
        // This is a bit of a hack to force a re-render. In a full React state model, this would be cleaner.
        // We'll just update a dummy state to trigger a re-render for the history.
        // For now, manual DOM render is happening inside useEffect
        const calculatorDisplay = document.getElementById('calculator-display')!;
        if(calculatorDisplay) renderCalculator();

        if (explain) {
            try {
                const explanation = await generateExplanation({ input: newEntry.input, output: newEntry.output, type: newEntry.type, data: newEntry.data });
                const entryIndex = appState.calculator.history.findIndex(h => h.id === newEntry.id);
                if (entryIndex > -1) {
                    appState.calculator.history[entryIndex].explanation = explanation;
                }
            } catch (error) {
                console.error("Failed to generate explanation:", error);
                const entryIndex = appState.calculator.history.findIndex(h => h.id === newEntry.id);
                if (entryIndex > -1) {
                    appState.calculator.history[entryIndex].explanation = "Could not generate an explanation.";
                }
            }
             if(calculatorDisplay) renderCalculator(); // Re-render with the explanation
        }
    }, []);

    const renderCalculator = useCallback(() => {
        const appState = appStateRef.current;
        const calculatorDisplay = document.getElementById('calculator-display');
        if (!calculatorDisplay) return;

        let historyHTML = '<div class="calculator-display">';
        appState.calculator.history.forEach(entry => {
            historyHTML += `<div class="calc-entry">
                <div class="calc-input">${entry.input}</div>
                <div class="calc-output">${entry.output}</div>
                ${entry.explanation === undefined && entry.type ? `<div class="font-sans text-xs text-muted-foreground bg-secondary p-2 rounded-md mt-2 animate-pulse"><div class="h-2.5 bg-gray-600 rounded-full w-48 mb-2"></div><div class="h-2 bg-gray-600 rounded-full max-w-[360px]"></div></div>` : ''}
                ${entry.explanation ? `<div class="calc-explanation">${entry.explanation}</div>` : ''}
            </div>`;
        });
        historyHTML += '</div>';
        calculatorDisplay.innerHTML = historyHTML;
    }, []);

    const handleNewGameQuestion = useCallback(async () => {
        const appState = appStateRef.current;
        try {
            const questionData = await generateGameQuestion();
            appState.game.question = questionData;
            addHistoryEntry({
                input: `New Question (${questionData.topic})`,
                output: questionData.question,
                explanation: "Use the app's tools to solve the problem. Type your answer in the console below."
            });
        } catch (error) {
            console.error("Failed to generate game question:", error);
            // Using a simple alert for now as showMessageModal is inside useEffect
            alert("Could not load a new game question. Please try again.");
            toggleGameMode();
        }
    }, [addHistoryEntry]);

    const toggleGameMode = useCallback(() => {
        const appState = appStateRef.current;
        const newIsActive = !appState.game.isActive;
        appState.game.isActive = newIsActive;
        setIsGameActive(newIsActive); // Also update React state to trigger re-render

        const calculatorPanel = document.getElementById('calculator');
        const titleEl = calculatorPanel?.querySelector('.panel-title');
        
        if (newIsActive) {
            if (titleEl) titleEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-gamepad-2 inline-block mr-2 text-primary"><line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="10" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.01.152v0a4.5 4.5 0 0 0 4.5 4.5h7.64a4.5 4.5 0 0 0 4.5-4.5v0c0-.05-.004-.1-.01-.152A4 4 0 0 0 17.32 5Z"/><path d="M2 12h1.5a1 1 0 0 1 1 1.5 2 2 0 0 0 2 2 1 1 0 0 0 1-1.5V12h10.5v1.5a1 1 0 0 0 1 1.5 2 2 0 0 0 2-2 1 1 0 0 1 1-1.5H22"/></svg>Game Mode`;
            
            handleNewGameQuestion();
            appState.game.timeLeft = 600;
            setGameTimeLeft(600);
            
            if (gameTimerRef.current) clearInterval(gameTimerRef.current);
            gameTimerRef.current = setInterval(() => {
                appState.game.timeLeft--;
                setGameTimeLeft(prevTime => prevTime - 1); // Update React state for timer
                if (appState.game.timeLeft <= 0) {
                    if(gameTimerRef.current) clearInterval(gameTimerRef.current);
                    addHistoryEntry({ input: "Time's Up!", output: "Game Over.", explanation: "Click Game Mode to play again." });
                    toggleGameMode();
                }
            }, 1000);

        } else {
            if (titleEl) titleEl.textContent = 'Calculator / Console';
            if (gameTimerRef.current) clearInterval(gameTimerRef.current);
            appState.game.question = null;
        }
    }, [handleNewGameQuestion, addHistoryEntry]);


    useEffect(() => {
        let Plotly: typeof import('plotly.js-dist-min');
        import('plotly.js-dist-min').then(module => {
            Plotly = module;
        });

        const appState = appStateRef.current;

        // --- DOM ELEMENT REFERENCES ---
        const calculatorPanel = document.getElementById('calculator')!;
        const calculatorDisplay = document.getElementById('calculator-display')!;
        const calculatorInput = document.getElementById('calculator-input') as HTMLInputElement;
        const calculatorEnterBtn = document.getElementById('calculator-enter')!;
        const spreadsheetContainer = document.getElementById('spreadsheet-content')!;
        const graphingPanel = document.getElementById('graphing')!;
        const plotButton = document.getElementById('plot-button')!;
        const functionInput = document.getElementById('graph-function-input') as HTMLInputElement;
        const graphPlotDiv = document.getElementById('graph-plot')!;
        const graphContextMenu = document.getElementById('graph-context-menu')!;
        const menuBtn = document.getElementById('btn-menu')!;
        const clearBtn = document.getElementById('btn-clear')!;
        const pythonToggle = document.getElementById('importer-python') as HTMLInputElement;
        const sqlToggle = document.getElementById('importer-sql') as HTMLInputElement;
        const pythonInstructions = document.getElementById('python-instructions')!;
        const sqlInstructions = document.getElementById('sql-instructions')!;
        const exportCalcToggle = document.getElementById('export-calc-toggle') as HTMLInputElement;
        const exportViewerToggle = document.getElementById('export-viewer-toggle') as HTMLInputElement;
        const exportSheetToggle = document.getElementById('export-sheet-toggle') as HTMLInputElement;
        
        // --- DATA & SPREADSHEET LOGIC ---
        const getColumnByName = (name: string) => appState.spreadsheet.columns.find(c => c.name === name);
        const getColumnData = (name: string) => { const col = getColumnByName(name); return col ? col.data.map(v => parseFloat(v as string)).filter(v => !isNaN(v)) : []; };
        const addDataColumn = (name: string, data: any[] = [], formula?: string) => {
            const existing = getColumnByName(name);
            if (existing) {
                existing.data = data;
                if(formula) existing.formula = formula;
            } else {
                appState.spreadsheet.columns.push({ name, data, formula });
            }
        };

        // --- RENDERING & UI ---
        const closeModal = () => {
            if (appState.modal) {
                appState.modal.remove();
                document.querySelector('.modal-backdrop')?.remove();
                appState.modal = null;
            }
        };

        const showMessageModal = (message: string, title = "Info") => {
            renderModal({ id: 'message', title, fields: [{ type: 'static', label: message }], buttons: [{ label: 'OK', action: 'closeModal' }] });
        };
        
        const renderSpreadsheet = () => {
            const { columns, activeCell, isEditing, editValue, selectionStart, selectionEnd } = appState.spreadsheet;
            const numCols = Math.max(columns.length + 5, 26);
            let tableHTML = `<div class="spreadsheet-container"><table class="spreadsheet-table"><thead><tr><th class="row-header"></th>`;
            for (let i = 0; i < numCols; i++) {
                const col = columns[i];
                let colName = col ? (col.formula ? `=${col.formula}` : col.name) : String.fromCharCode(65 + i);
                let headerClasses = 'col-header';
                if (selectionStart && selectionEnd && i >= Math.min(selectionStart.col, selectionEnd.col) && i <= Math.max(selectionEnd.col, selectionEnd.col)) {
                    if (columns[i]?.name) headerClasses += ' in-selection';
                }
                if (activeCell.col === i && activeCell.row === -1) headerClasses += ' selected';
                tableHTML += `<th class="${headerClasses}" data-col="${i}" data-row="-1" draggable="${!!(col?.name && headerClasses.includes('in-selection'))}">${colName || String.fromCharCode(65 + i)}</th>`;
            }
            tableHTML += '</tr></thead><tbody>';
            for (let r = 0; r < 200; r++) {
                tableHTML += `<tr><td class="row-header">${r + 1}</td>`;
                for (let c = 0; c < numCols; c++) {
                    const cellValue = columns[c]?.data[r] ?? '';
                    let cellClasses = '';
                    if (selectionStart && selectionEnd) {
                        const minCol = Math.min(selectionStart.col, selectionEnd.col); const maxCol = Math.max(selectionStart.col, selectionEnd.col);
                        const minRow = Math.min(selectionStart.row, selectionEnd.row); const maxRow = Math.max(selectionStart.row, selectionEnd.row);
                        if (c >= minCol && c <= maxCol && r >= minRow && r <= maxRow) { cellClasses += ' in-selection'; }
                    }
                    if (activeCell.col === c && activeCell.row === r) cellClasses += ' selected';
                    tableHTML += `<td class="${cellClasses}" data-col="${c}" data-row="${r}">${(isEditing && activeCell.col === c && activeCell.row === r) ? `<input type="text" value="${editValue}" />` : cellValue}</td>`;
                }
                tableHTML += '</tr>';
            }
            tableHTML += '</tbody></table></div>';
            spreadsheetContainer.innerHTML = tableHTML;
            if(isEditing) {
                const input = spreadsheetContainer.querySelector('input');
                if(input) {
                    input.focus();
                    input.select();
                    input.onblur = (e) => finishEditing((e.target as HTMLInputElement).value);
                    input.onkeydown = (e) => {
                        if (e.key === 'Enter') finishEditing((e.target as HTMLInputElement).value, true);
                        if (e.key === 'Escape') { appState.spreadsheet.isEditing = false; renderSpreadsheet(); }
                    };
                }
            }
        };

        const renderModal = (modalConfig: any) => {
            closeModal();
            const { title, fields, buttons } = modalConfig;
            const colNames = appState.spreadsheet.columns.map(c => c.name).filter(Boolean);
            if (fields.some((f: any) => f.type === 'select' || f.type === 'select_multi') && colNames.length === 0) {
                 if (!title.includes("Clear") && !title.includes("Info")) {
                    showMessageModal('Spreadsheet is empty. Add data to a named column first.');
                    return;
                }
            }

            let modalHTML = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
                             <div class="modal-title" id="modal-title">${title}</div>`;

            fields.forEach((field: any) => {
                modalHTML += `<div class="modal-field">`;
                if (field.type !== 'static' && field.type !== 'select_multi') modalHTML += `<label for="${field.id}">${field.label}</label>`;
                
                if (field.type === 'select') {
                    modalHTML += `<select id="${field.id}">`;
                    (field.options || colNames).forEach((opt: string) => { modalHTML += `<option value="${opt}">${opt}</option>`; });
                    modalHTML += `</select>`;
                } else if (field.type === 'select_multi') {
                    modalHTML += `<div class="col-span-4"><label class="text-sm font-medium">${field.label}</label><div class="h-32 w-full rounded-md border mt-2 overflow-y-auto p-2 space-y-2">`;
                    colNames.forEach((c: string) => {
                        modalHTML += `<div class="flex items-center space-x-2"><input type="checkbox" id="${field.id}-${c}" name="${field.id}" value="${c}"/><label for="${field.id}-${c}">${c}</label></div>`;
                    });
                    modalHTML += `</div></div>`;
                } else if (field.type === 'static') {
                    modalHTML += `<p>${field.label}</p>`;
                } else {
                    modalHTML += `<input type="text" id="${field.id}" value="${field.value || ''}">`;
                }
                modalHTML += `</div>`;
            });

            modalHTML += `<div class="modal-buttons">`;
            buttons.forEach((btn: any) => {
                modalHTML += `<button class="btn" data-action="${btn.action}">${btn.label}</button>`;
            });
            modalHTML += `</div></div>`;
            
            const backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop';
            backdrop.onclick = closeModal;
            document.body.insertAdjacentElement('afterbegin', backdrop);
            const modalElement = document.createElement('div');
            modalElement.innerHTML = modalHTML;
            document.body.appendChild(modalElement.firstChild!);
            appState.modal = document.querySelector('.modal');
        };

        // --- GRAPHING LOGIC ---
        const plotlyLayout = { paper_bgcolor: 'hsl(var(--card))', plot_bgcolor: 'hsl(var(--card))', font: { color: 'hsl(var(--foreground))' }, xaxis: { gridcolor: 'hsl(var(--border))', zerolinecolor: 'hsl(var(--muted-foreground))' }, yaxis: { gridcolor: 'hsl(var(--border))', zerolinecolor: 'hsl(var(--muted-foreground))' }, margin: { l: 50, r: 20, b: 40, t: 40 }, showlegend: false };
        
        const plotFromFunction = () => {
            if (!Plotly) return;
            const expression = functionInput.value;
            if (!expression) { plotDefault(); return; }
            try {
                const node = math.parse(expression);
                const code = node.compile();
                const xValues = math.range(-10, 10, 0.2).toArray() as number[];
                const yValues = xValues.map((x: number) => code.evaluate({ x: x }));
                const trace = { x: xValues, y: yValues, type: 'scatter', mode: 'lines', line: { color: 'hsl(var(--primary))', width: 2 } };
                Plotly.newPlot(graphPlotDiv, [trace], { ...plotlyLayout, title: `f(x) = ${expression}`}, { responsive: true });
                appState.graphing.currentView = { type: 'plot', data: [trace], layout: { title: `f(x) = ${expression}` } };
            } catch (err: any) {
                showMessageModal(err.message, "Plotting Error");
            }
        };

        const plotDefault = () => {
            graphPlotDiv.innerHTML = `<div class="flex items-center justify-center h-full text-muted-foreground">Drop columns here to plot data</div>`;
            appState.graphing.currentView = { type: 'default', data: [], layout: {} };
        };
        
        const renderDataFrameHead = () => {
            const namedCols = appState.spreadsheet.columns.filter(c => c.name);
            if (namedCols.length === 0) {
                graphPlotDiv.innerHTML = `<div class="flex items-center justify-center h-full text-muted-foreground">No named columns to display.</div>`;
                return;
            }
            const rowCount = Math.min(5, ...namedCols.map(c => c.data.length));
            let table = '<table class="dataframe-table"><thead><tr><th>#</th>';
            namedCols.forEach(c => table += `<th>${c.name}</th>`);
            table += '</tr></thead><tbody>';
            for (let i = 0; i < rowCount; i++) {
                table += `<tr><td>${i+1}</td>`;
                namedCols.forEach(c => table += `<td>${c.data[i] ?? ''}</td>`);
                table += '</tr>';
            }
            table += '</tbody></table>';
            graphPlotDiv.innerHTML = table;
            appState.graphing.currentView = {type: 'dataframe', data: [], layout: {}};
        };

        const handlePlotSelect = (type: string) => {
            if (!Plotly) return;
            if (!appState.graphing.pendingPlot) return;
            const { indices } = appState.graphing.pendingPlot;
            let plotView: { type: string; data: any[]; layout: any; } = { type: 'default', data: [], layout: {} };
            
            if (type === 'histogram' && indices.length === 1) {
                const col = appState.spreadsheet.columns[indices[0]];
                const data = getColumnData(col.name);
                plotView = { type: 'plot', data: [{ x: data, type: 'histogram', marker: { color: 'hsl(var(--accent))' } }], layout: { title: `Histogram of ${col.name}` } };
            } else if (type === 'boxplot' && indices.length === 1) {
                const col = appState.spreadsheet.columns[indices[0]];
                const data = getColumnData(col.name);
                plotView = { type: 'plot', data: [{ y: data, type: 'box', name: col.name, marker: { color: 'hsl(var(--primary))' } }], layout: { title: `Box Plot of ${col.name}` } };
            } else if (type === 'scatter' && indices.length === 2) {
                const col1 = appState.spreadsheet.columns[indices[0]];
                const col2 = appState.spreadsheet.columns[indices[1]];
                const xData = getColumnData(col1.name);
                const yData = getColumnData(col2.name);
                const n = Math.min(xData.length, yData.length);
                if (n < 2) { showMessageModal("Need at least 2 data points for a scatter plot."); plotDefault(); return; }
                const {a, b, r} = stats.linReg(xData, yData);
                const xRange = [Math.min(...xData), Math.max(...xData)];
                const yRange = xRange.map(x => a + b * x);
                plotView = { type: 'plot', data: [
                    { x: xData, y: yData, mode: 'markers', type: 'scatter', marker: { color: '#F59E0B' } },
                    { x: xRange, y: yRange, mode: 'lines', type: 'scatter', line: { color: '#EF4444', width: 2 } }
                ], layout: { title: `<b>${col1.name} vs. ${col2.name}</b><br>ŷ = ${a.toFixed(3)} + ${b.toFixed(3)}x | r²=${(r*r).toFixed(3)} | r=${r.toFixed(3)}`, xaxis: {title: col1.name }, yaxis: {title: col2.name }}};
            }

            if (plotView.type === 'plot') {
                 Plotly.newPlot(graphPlotDiv, plotView.data, { ...plotlyLayout, ...plotView.layout }, { responsive: true });
                 appState.graphing.currentView = plotView;
            }
        };
        
        const showPlotTypeMenu = (colIndices: number[]) => {
            appState.graphing.pendingPlot = { indices: colIndices };
            let menuHTML = '', subtitle = '', optionsHTML = '';
            if (colIndices.length === 1) {
                const colName = appState.spreadsheet.columns[colIndices[0]]?.name;
                if(!colName) { showMessageModal("Please drag named columns only."); return; }
                subtitle = `1 Variable Selected: <strong>${colName}</strong>`;
                optionsHTML = `<button class="btn" data-plottype="histogram">Histogram</button><button class="btn" data-plottype="boxplot">Box Plot</button>`;
            } else if (colIndices.length === 2) {
                const name1 = appState.spreadsheet.columns[colIndices[0]]?.name;
                const name2 = appState.spreadsheet.columns[colIndices[1]]?.name;
                if(!name1 || !name2) { showMessageModal("Please drag named columns only."); return; }
                subtitle = `2 Variables Selected: <strong>${name1}</strong> vs <strong>${name2}</strong>`;
                optionsHTML = `<button class="btn" data-plottype="scatter">Scatter Plot</button>`;
            } else {
                plotDefault();
                showMessageModal("Please drag one or two columns to plot.");
                return;
            }
            menuHTML = `<div class="context-menu-title">Choose Plot Type</div><div class="context-menu-subtitle">${subtitle}</div><div class="context-menu-options">${optionsHTML}</div><button class="btn mt-4" data-plottype="cancel">Cancel</button>`;
            graphContextMenu.innerHTML = menuHTML;
            graphContextMenu.classList.remove('hidden');
        };

        // --- ACTION HANDLERS ---
        const handleCalculatorInput = async () => {
            const command = calculatorInput.value.trim();
            if (!command) return;

            if (appState.game.isActive && appState.game.question) {
                const { question, answer } = appState.game.question;
                const { isCorrect, feedback } = await checkGameAnswer({ question, userAnswer: command, correctAnswer: answer });
                const output = isCorrect ? 'Correct!' : 'Incorrect';
                addHistoryEntry({ input: `Answer: ${command}`, output: `${output}\n${feedback}` });
                if (isCorrect) {
                    toast({ title: "Correct!", description: "Generating next question..." });
                    handleNewGameQuestion();
                }
                calculatorInput.value = '';
                return;
            }

            const pythonCommand = "df = pd.read_csv('lab_data_1.csv')";
            const sqlCommand = "SELECT study_hours, exam_score FROM student_performance;";
            if (command === pythonCommand || command === sqlCommand) {
                const studyHours = [1, 1.5, 1.8, 2, 2.5, 3, 3.2, 3.8, 4, 4.5, 5, 5.5, 6];
                const examScores = [65, 68, 70, 75, 72, 80, 85, 88, 85, 92, 95, 98, 94];
                appState.spreadsheet.columns = [];
                addDataColumn('hours', studyHours);
                addDataColumn('score', examScores);
                appState.spreadsheet.isDataLoaded = true;
                renderSpreadsheet();
                addHistoryEntry({ input: command, output: "Success", explanation: "Sample dataset loaded into the spreadsheet." });
            } else if (command.toLowerCase().includes('read_csv') || command.toLowerCase().includes('select')) {
                addHistoryEntry({ input: command, output: "Error", explanation: "Incorrect query. Please copy the command from the 'Import Lab Data' panel exactly." });
            } else if (command === 'df.head()') {
                if (appState.spreadsheet.isDataLoaded) {
                    renderDataFrameHead();
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
            calculatorInput.value = '';
        };

        const finishEditing = (value: string, moveNext = false) => {
            if (!appState.spreadsheet.isEditing) return;
            const { col, row } = appState.spreadsheet.activeCell;
            while (col >= appState.spreadsheet.columns.length) {
                addDataColumn(String.fromCharCode(65 + appState.spreadsheet.columns.length), []);
            }
            if (row === -1) {
                appState.spreadsheet.columns[col].name = value;
            } else {
                const numValue = parseFloat(value);
                appState.spreadsheet.columns[col].data[row] = isNaN(numValue) ? value : numValue;
            }
            appState.spreadsheet.isEditing = false;
            if (moveNext) {
                appState.spreadsheet.activeCell.row++;
            }
            renderSpreadsheet();
        };

        const modalActions: Record<string, Function> = {
            closeModal,
            run1VarStats: () => {
                const listName = (document.getElementById('x1list') as HTMLSelectElement).value;
                const colData = getColumnData(listName);
                if (colData.length === 0) return showMessageModal('Selected list is empty.');
                const results = { 'x̄': stats.mean(colData), 'Σx': stats.sum(colData), 'Σx²': stats.sum(colData.map(x => x * x)), 'Sx': stats.stddev(colData, false), 'σx': stats.stddev(colData, true), n: colData.length, minX: Math.min(...colData), q1: stats.quartile(colData, 0.25), median: stats.median(colData), q3: stats.quartile(colData, 0.75), maxX: Math.max(...colData)};
                addHistoryEntry({ type: '1VarStats', input: `1-Var Stats for ${listName}`, output: `Mean: ${results.x̄.toFixed(4)}, Sx: ${results.Sx.toFixed(4)}`, data: { results, listName }}, true);
                closeModal();
            },
            runLinReg: () => {
                const xlist = (document.getElementById('xlist') as HTMLSelectElement).value;
                const ylist = (document.getElementById('ylist') as HTMLSelectElement).value;
                const xData = getColumnData(xlist);
                const yData = getColumnData(ylist);
                if (xData.length < 2 || xData.length !== yData.length) return showMessageModal("X and Y lists must have the same number of data points (at least 2).");
                const { a, b, r } = stats.linReg(xData, yData);
                addHistoryEntry({ type: 'LinReg', input: `LinReg for ${ylist} vs ${xlist}`, output: `y = ${a.toFixed(4)} + ${b.toFixed(4)}x\nr² = ${(r*r).toFixed(4)}`, data: { y: ylist, x: xlist, a, b, r, r2: r*r } }, true);
                closeModal();
            },
            runTIntervalFromData: () => {
                const listName = (document.getElementById('list') as HTMLSelectElement).value;
                const cLevel = parseFloat((document.getElementById('clevel') as HTMLInputElement).value);
                const colData = getColumnData(listName);
                if (colData.length < 2) return showMessageModal("List must have at least 2 numbers.");
                const mean = stats.mean(colData); const sx = stats.stddev(colData); const n = colData.length; const df = n - 1;
                const tStar = stats.invT(1 - (1 - cLevel) / 2, df);
                const me = tStar * (sx / Math.sqrt(n));
                const lower = mean - me; const upper = mean + me;
                addHistoryEntry({ type: 'tInterval', input: `t-Interval for ${listName}`, output: `(${lower.toFixed(4)}, ${upper.toFixed(4)})`, data: { listName, cLevel, mean, sx, n, df, lower, upper } }, true);
                closeModal();
            },
            runTTest: () => {
                const mu0 = parseFloat((document.getElementById('mu0') as HTMLInputElement).value);
                const mean = parseFloat((document.getElementById('mean') as HTMLInputElement).value);
                const sx = parseFloat((document.getElementById('sx') as HTMLInputElement).value);
                const n = parseInt((document.getElementById('n') as HTMLInputElement).value);
                const alt = (document.getElementById('alt') as HTMLSelectElement).value;
                if (isNaN(mu0) || isNaN(mean) || isNaN(sx) || isNaN(n)) return showMessageModal("Invalid numeric input for t-Test.");
                const df = n - 1;
                const tStat = (mean - mu0) / (sx / Math.sqrt(n));
                let pVal;
                if (alt === 'μ < μ₀') pVal = stats.tCdf(tStat, df);
                else if (alt === 'μ > μ₀') pVal = 1 - stats.tCdf(tStat, df);
                else pVal = 2 * (1 - stats.tCdf(Math.abs(tStat), df));
                addHistoryEntry({ type: 'tTest', input: `t-Test: μ ${alt.replace('μ', '')} ${mu0}`, output: `t=${tStat.toFixed(4)}, p=${pVal.toFixed(4)}`, data: { mu0, mean, sx, n, alt, df, tStat, pVal } }, true);
                closeModal();
            },
            run2PropZInt: () => {
                const x1 = parseInt((document.getElementById('x1') as HTMLInputElement).value);
                const n1 = parseInt((document.getElementById('n1') as HTMLInputElement).value);
                const x2 = parseInt((document.getElementById('x2') as HTMLInputElement).value);
                const n2 = parseInt((document.getElementById('n2') as HTMLInputElement).value);
                const clevel = parseFloat((document.getElementById('clevel') as HTMLInputElement).value);
                const p1 = x1 / n1; const p2 = x2 / n2;
                const zStar = stats.invNorm(1 - (1-clevel)/2, 0, 1);
                const se = Math.sqrt(p1 * (1 - p1) / n1 + p2 * (1 - p2) / n2);
                const diff = p1 - p2;
                const lower = diff - zStar * se; const upper = diff + zStar * se;
                addHistoryEntry({ type: '2PropZInt', input: `2-Prop Z-Int`, output: `(${lower.toFixed(4)}, ${upper.toFixed(4)})`, data: { x1, n1, x2, n2, p1, p2, diff, lower, upper, clevel } }, true);
                closeModal();
            },
            run2PropZTest: () => {
                const x1 = parseInt((document.getElementById('x1') as HTMLInputElement).value);
                const n1 = parseInt((document.getElementById('n1') as HTMLInputElement).value);
                const x2 = parseInt((document.getElementById('x2') as HTMLInputElement).value);
                const n2 = parseInt((document.getElementById('n2') as HTMLInputElement).value);
                const alt = (document.getElementById('alt') as HTMLSelectElement).value;
                const p1 = x1 / n1; const p2 = x2 / n2;
                const pPooled = (x1 + x2) / (n1 + n2);
                const se = Math.sqrt(pPooled * (1 - pPooled) * (1 / n1 + 1 / n2));
                const zStat = (p1 - p2) / se;
                let pVal;
                if (alt === '< p2') pVal = stats.normalCdf(-Infinity, zStat, 0, 1);
                else if (alt === '> p2') pVal = 1 - stats.normalCdf(-Infinity, zStat, 0, 1);
                else pVal = 2 * (1 - stats.normalCdf(-Infinity, Math.abs(zStat), 0, 1));
                addHistoryEntry({ type: '2PropZTest', input: `2-Prop Z-Test`, output: `z=${zStat.toFixed(4)}, p=${pVal.toFixed(4)}`, data: { x1, n1, x2, n2, alt, p1, p2, pPooled, zStat, pVal } }, true);
                closeModal();
            },
            runChi2GOF: () => {
                const obsListName = (document.getElementById('observed') as HTMLSelectElement).value;
                const expListName = (document.getElementById('expected') as HTMLSelectElement).value;
                const df = parseInt((document.getElementById('df') as HTMLInputElement).value);
                const obsData = getColumnData(obsListName);
                const expData = getColumnData(expListName);
                if (obsData.length !== expData.length || obsData.length === 0) return showMessageModal("Observed and Expected lists must be of the same length.");
                const chi2Stat = stats.sum(obsData.map((obs, i) => Math.pow(obs - expData[i], 2) / expData[i]));
                const pVal = 1 - stats.chi2cdf(chi2Stat, df);
                addHistoryEntry({ type: 'chi2GOF', input: `χ² GOF-Test`, output: `χ²=${chi2Stat.toFixed(4)}, p=${pVal.toFixed(4)}`, data: { obsListName, expListName, df, chi2Stat, pVal } }, true);
                closeModal();
            },
            runChi2Test: () => {
                const selectedCols = Array.from(document.querySelectorAll<HTMLInputElement>('input[name="observedMatrix"]:checked')).map(cb => cb.value);
                if(selectedCols.length < 2) return showMessageModal("Please select at least two columns for the matrix.");
                const matrix = selectedCols.map(name => getColumnData(name));
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
                closeModal();
            },
            runNormalCdf: () => {
                const lower = parseFloat((document.getElementById('lower') as HTMLInputElement).value);
                const upper = parseFloat((document.getElementById('upper') as HTMLInputElement).value);
                const mu = parseFloat((document.getElementById('mu') as HTMLInputElement).value);
                const sigma = parseFloat((document.getElementById('sigma') as HTMLInputElement).value);
                const result = stats.normalCdf(lower, upper, mu, sigma);
                addHistoryEntry({type: 'NormalCdf', input: `normCdf(${lower},${upper},${mu},${sigma})`, output: result.toFixed(6), data: {lower, upper, mu, sigma}}, true);
                closeModal();
            },
            runInvNorm: () => {
                const area = parseFloat((document.getElementById('area') as HTMLInputElement).value);
                const mu = parseFloat((document.getElementById('mu') as HTMLInputElement).value);
                const sigma = parseFloat((document.getElementById('sigma') as HTMLInputElement).value);
                const result = stats.invNorm(area, mu, sigma);
                addHistoryEntry({type: 'InvNorm', input: `invNorm(${area},${mu},${sigma})`, output: result.toFixed(6), data: {area, mu, sigma}}, true);
                closeModal();
            },
            runBinomPdf: () => {
                const n = parseInt((document.getElementById('n') as HTMLInputElement).value);
                const p = parseFloat((document.getElementById('p') as HTMLInputElement).value);
                const x = parseInt((document.getElementById('x') as HTMLInputElement).value);
                const result = stats.binomialPdf(n, p, x);
                addHistoryEntry({type: 'BinomPdf', input: `binomPdf(n=${n},p=${p},x=${x})`, output: result.toFixed(6), data: {n, p, x}}, true);
                closeModal();
            },
            runBinomCdf: () => {
                const n = parseInt((document.getElementById('n') as HTMLInputElement).value);
                const p = parseFloat((document.getElementById('p') as HTMLInputElement).value);
                const x = parseInt((document.getElementById('x') as HTMLInputElement).value);
                let totalProb = 0; for (let i = 0; i <= x; i++) { totalProb += stats.binomialPdf(n, p, i); }
                addHistoryEntry({type: 'BinomCdf', input: `binomCdf(n=${n},p=${p},x=${x})`, output: totalProb.toFixed(6), data: {n, p, x}}, true);
                closeModal();
            },
            runGeomPdf: () => {
                const p = parseFloat((document.getElementById('p') as HTMLInputElement).value);
                const x = parseInt((document.getElementById('x') as HTMLInputElement).value);
                const result = stats.geometricPdf(p, x);
                addHistoryEntry({type: 'GeomPdf', input: `geomPdf(p=${p},x=${x})`, output: result.toFixed(6), data: {p, x}}, true);
                closeModal();
            },
            runGeomCdf: () => {
                const p = parseFloat((document.getElementById('p') as HTMLInputElement).value);
                const lower = parseInt((document.getElementById('lower') as HTMLInputElement).value);
                const upper = parseInt((document.getElementById('upper') as HTMLInputElement).value);
                let totalProb = 0; for (let i = lower; i <= upper; i++) { totalProb += stats.geometricPdf(p, i); }
                addHistoryEntry({type: 'GeomCdf', input: `geomCdf(p=${p},l=${lower},u=${upper})`, output: totalProb.toFixed(6), data: {p, lower, upper}}, true);
                closeModal();
            },
            clearSpreadsheet: () => {
                appState.spreadsheet.columns = [];
                appState.spreadsheet.activeCell = { col: 0, row: 0 };
                appState.spreadsheet.selectionStart = null;
                appState.spreadsheet.selectionEnd = null;
                appState.spreadsheet.isDataLoaded = false;
                renderSpreadsheet();
                closeModal();
            },
        };

        const modalConfigs: Record<string, any> = {
            '1VarStats': { id: '1VarStats', title: 'One-Variable Statistics', fields: [{ id: 'x1list', label: 'X1 List', type: 'select' }], buttons: [{ label: 'OK', action: 'run1VarStats' }, { label: 'Cancel', action: 'closeModal' }] },
            'tInterval': { id: 'tInterval', title: 't Interval (Data)', fields: [{ id: 'list', label: 'List', type: 'select' }, { id: 'clevel', label: 'C Level', value: '0.95', type: 'text' }], buttons: [{ label: 'OK', action: 'runTIntervalFromData' }, { label: 'Cancel', action: 'closeModal' }] },
            'tTest': { id: 'tTest', title: 't Test (Stats)', fields: [{ id: 'mu0', label: 'μ₀', type: 'text' }, { id: 'mean', label: 'x̄', type: 'text' }, { id: 'sx', label: 'Sx', type: 'text' }, { id: 'n', label: 'n', type: 'text' }, { id: 'alt', label: 'Alternate Hyp', type: 'select', options: ['μ ≠ μ₀', 'μ < μ₀', 'μ > μ₀'] }], buttons: [{ label: 'OK', action: 'runTTest' }, { label: 'Cancel', action: 'closeModal' }] },
            'linReg': { id: 'linReg', title: 'Linear Regression (a+bx)', fields: [{ id: 'xlist', label: 'X List', type: 'select' }, { id: 'ylist', label: 'Y List', type: 'select' }], buttons: [{ label: 'OK', action: 'runLinReg' }, { label: 'Cancel', action: 'closeModal' }] },
            '2PropZInt': { id: '2PropZInt', title: '2-Proportion Z-Interval', fields: [{ id: 'x1', label: 'x1', type: 'text' }, { id: 'n1', label: 'n1', type: 'text' }, { id: 'x2', label: 'x2', type: 'text' }, { id: 'n2', label: 'n2', type: 'text' }, { id: 'clevel', label: 'C-Level', value: '0.95', type: 'text' }], buttons: [{ label: 'OK', action: 'run2PropZInt' }, { label: 'Cancel', action: 'closeModal' }] },
            '2PropZTest': { id: '2PropZTest', title: '2-Proportion Z-Test', fields: [{ id: 'x1', label: 'x1', type: 'text' }, { id: 'n1', label: 'n1', type: 'text' }, { id: 'x2', label: 'x2', type: 'text' }, { id: 'n2', label: 'n2', type: 'text' }, { id: 'alt', label: 'p1', type: 'select', options: ['≠ p2', '< p2', '> p2'] }], buttons: [{ label: 'OK', action: 'run2PropZTest' }, { label: 'Cancel', action: 'closeModal' }] },
            'chi2GOF': { id: 'chi2GOF', title: 'Chi-Square GOF Test', fields: [{ id: 'observed', label: 'Observed List', type: 'select' }, { id: 'expected', label: 'Expected List', type: 'select' }, { id: 'df', label: 'Degrees of Freedom', type: 'text' }], buttons: [{ label: 'OK', action: 'runChi2GOF' }, { label: 'Cancel', action: 'closeModal' }] },
            'chi2Test': { id: 'chi2Test', title: 'Chi-Square 2-Way Test', fields: [{ id: 'observedMatrix', label: 'Observed Columns', type: 'select_multi' }], buttons: [{ label: 'OK', action: 'runChi2Test' }, { label: 'Cancel', action: 'closeModal' }] },
            'normalCdf': { id: 'normalCdf', title: 'Normal Cdf', fields: [{ id: 'lower', label: 'Lower Bound', value: '-1E99', type: 'text' }, { id: 'upper', label: 'Upper Bound', type: 'text' }, { id: 'mu', label: 'μ', value: '0', type: 'text' }, { id: 'sigma', label: 'σ', value: '1', type: 'text' }], buttons: [{ label: 'OK', action: 'runNormalCdf' }, { label: 'Cancel', action: 'closeModal' }] },
            'invNorm': { id: 'invNorm', title: 'Inverse Normal', fields: [{ id: 'area', label: 'Area', type: 'text' }, { id: 'mu', label: 'μ', value: '0', type: 'text' }, { id: 'sigma', label: 'σ', value: '1', type: 'text' }], buttons: [{ label: 'OK', action: 'runInvNorm' }, { label: 'Cancel', action: 'closeModal' }] },
            'binomPdf': { id: 'binomPdf', title: 'Binomial Pdf', fields: [{ id: 'n', label: 'Num Trials, n', type: 'text' }, { id: 'p', label: 'Prob Success, p', type: 'text' }, { id: 'x', label: 'X Value', type: 'text' }], buttons: [{ label: 'OK', action: 'runBinomPdf' }, { label: 'Cancel', action: 'closeModal' }] },
            'binomCdf': { id: 'binomCdf', title: 'Binomial Cdf', fields: [{ id: 'n', label: 'Num Trials, n', type: 'text' }, { id: 'p', label: 'Prob Success, p', type: 'text' }, { id: 'x', label: 'Upper Bound', type: 'text' }], buttons: [{ label: 'OK', action: 'runBinomCdf' }, { label: 'Cancel', action: 'closeModal' }] },
            'geomPdf': { id: 'geomPdf', title: 'Geometric Pdf', fields: [{ id: 'p', label: 'Prob Success, p', type: 'text' }, { id: 'x', label: 'X Value', type: 'text' }], buttons: [{ label: 'OK', action: 'runGeomPdf' }, { label: 'Cancel', action: 'closeModal' }] },
            'geomCdf': { id: 'geomCdf', title: 'Geometric Cdf', fields: [{ id: 'p', label: 'Prob Success, p', type: 'text' }, { id: 'lower', label: 'Lower Bound', type: 'text' }, { id: 'upper', label: 'Upper Bound', type: 'text' }], buttons: [{ label: 'OK', action: 'runGeomCdf' }, { label: 'Cancel', action: 'closeModal' }] },
        };
        
        const menuItems = [
            { label: 'One-Variable Stats', id: '1VarStats', requiresData: true },
            { label: 'LinReg (a+bx)', id: 'linReg', requiresData: true },
            { label: 't Interval', id: 'tInterval', requiresData: true },
            { label: 't Test', id: 'tTest', requiresData: false },
            { label: '2-Prop Z-Int', id: '2PropZInt', requiresData: false },
            { label: '2-Prop Z-Test', id: '2PropZTest', requiresData: false },
            { label: 'χ² GOF-Test', id: 'chi2GOF', requiresData: true },
            { label: 'χ²-Test', id: 'chi2Test', requiresData: true },
            { label: 'Normal Cdf', id: 'normalCdf', requiresData: false },
            { label: 'Inverse Normal', id: 'invNorm', requiresData: false },
            { label: 'Binomial Pdf', id: 'binomPdf', requiresData: false },
            { label: 'Binomial Cdf', id: 'binomCdf', requiresData: false },
            { label: 'Geometric Pdf', id: 'geomPdf', requiresData: false },
            { label: 'Geometric Cdf', id: 'geomCdf', requiresData: false }
        ];

        const showStatisticsMenu = () => {
            let menuHTML = `<div class="modal" id="stats-menu"><div class="modal-title">Statistics & Distributions</div><div class="grid grid-cols-2 gap-3 my-4">`;
            menuItems.forEach(item => {
                menuHTML += `<button class="btn" data-action="${item.id}" ${item.requiresData && appState.spreadsheet.columns.length === 0 ? 'disabled' : ''}>${item.label}</button>`;
            });
            menuHTML += `</div><div class="modal-buttons"><button class="btn" data-action="closeModal">Close</button></div></div>`;
            
            const backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop';
            backdrop.onclick = closeModal;
            document.body.insertAdjacentElement('afterbegin', backdrop);
            const modalElement = document.createElement('div');
            modalElement.innerHTML = menuHTML;
            document.body.appendChild(modalElement.firstChild!);
            appState.modal = document.getElementById('stats-menu');
        };

        const handleAction = (e: MouseEvent) => {
            const target = (e.target as HTMLElement).closest('[data-action]');
            if (!target) return;
            const action = target.getAttribute('data-action')!;
            if (modalConfigs[action]) {
                renderModal(modalConfigs[action]);
            } else if (modalActions[action]) {
                (modalActions as any)[action]();
            } else if (action === 'clearSheet') {
                renderModal({ id: 'clearConfirm', title: 'Confirm Clear', fields: [{type: 'static', label: 'Clear all spreadsheet data?'}], buttons: [{label: 'OK', action: 'clearSpreadsheet'}, {label: 'Cancel', action: 'closeModal'}] });
            }
        };

        // --- EVENT LISTENERS ---
        menuBtn.addEventListener('click', showStatisticsMenu);
        clearBtn.addEventListener('click', () => handleAction(new MouseEvent('click', { bubbles: true, cancelable: true, view: window, detail: 1, screenX: 0, screenY: 0, clientX: 0, clientY: 0, ctrlKey: false, altKey: false, shiftKey: false, metaKey: false, button: 0, relatedTarget: null })));
        document.body.addEventListener('click', handleAction);
        
        spreadsheetContainer.addEventListener('mousedown', e => {
            const target = e.target as HTMLElement;
            if (!target.matches('td, th[data-col]')) return;
            const col = parseInt(target.dataset.col!); const row = parseInt(target.dataset.row!);
            appState.spreadsheet.isEditing = false;
            appState.spreadsheet.activeCell = { col, row };
            appState.spreadsheet.isSelecting = true;
            appState.spreadsheet.selectionStart = { col, row };
            appState.spreadsheet.selectionEnd = { col, row };
            renderSpreadsheet();
        });
        spreadsheetContainer.addEventListener('mousemove', e => {
            if (!appState.spreadsheet.isSelecting) return;
            const target = e.target as HTMLElement;
            if (!target.matches('td, th[data-col]')) return;
            const col = parseInt(target.dataset.col!); const row = parseInt(target.dataset.row!);
            if (appState.spreadsheet.selectionEnd?.col !== col || appState.spreadsheet.selectionEnd?.row !== row) {
                appState.spreadsheet.selectionEnd = { col, row };
                renderSpreadsheet();
            }
        });
        document.addEventListener('mouseup', () => { appState.spreadsheet.isSelecting = false; });
        spreadsheetContainer.addEventListener('dblclick', e => {
            const target = e.target as HTMLElement;
            if (target.matches('td, th[data-col]')) {
                const { col, row } = appState.spreadsheet.activeCell;
                const value = row === -1 ? (appState.spreadsheet.columns[col]?.name || '') : (appState.spreadsheet.columns[col]?.data[row] || '');
                appState.spreadsheet.isEditing = true;
                appState.spreadsheet.editValue = String(value);
                renderSpreadsheet();
            }
        });
        plotButton.addEventListener('click', plotFromFunction);
        functionInput.addEventListener('keydown', e => e.key === 'Enter' && plotFromFunction());
        calculatorInput.addEventListener('keydown', e => e.key === 'Enter' && handleCalculatorInput());
        calculatorEnterBtn.addEventListener('click', handleCalculatorInput);

        // --- Drag/Drop & Export Listeners ---
        const setupExportDrag = (toggle: HTMLInputElement, panel: HTMLElement, dataProvider: () => [string, string]) => {
            toggle.addEventListener('change', () => { panel.setAttribute('draggable', String(toggle.checked)); });
            panel.addEventListener('dragstart', (e) => {
                if (!toggle.checked) { e.preventDefault(); return; }
                const [type, data] = dataProvider();
                e.dataTransfer!.setData(type, data);
                panel.classList.add('is-dragging');
            });
            panel.addEventListener('dragend', () => panel.classList.remove('is-dragging'));
        };

        setupExportDrag(exportCalcToggle, calculatorPanel, () => {
            const historyText = appState.calculator.history.slice().reverse().map(e => `> ${e.input}\n${e.output}${e.explanation ? `\n// ${e.explanation.replace(/\n/g, '\n// ')}` : ''}`).join('\n\n');
            return ['text/plain', historyText];
        });

        setupExportDrag(exportSheetToggle, document.getElementById('spreadsheet')!, () => {
            const namedCols = appState.spreadsheet.columns.filter(c => c.name && !c.formula);
            if (namedCols.length === 0) return ['text/plain', ''];
            const header = namedCols.map(c => c.name).join('\t');
            const numRows = Math.max(0, ...namedCols.map(c => c.data.length));
            const rows = Array.from({length: numRows}, (_, i) => namedCols.map(c => c.data[i] ?? '').join('\t'));
            return ['text/plain', [header, ...rows].join('\n')];
        });
        
        exportViewerToggle.addEventListener('change', () => { graphingPanel.setAttribute('draggable', String(exportViewerToggle.checked)); });
        graphingPanel.addEventListener('dragstart', async (e) => {
            if (!Plotly || !exportViewerToggle.checked) { e.preventDefault(); return; }
            let targetDiv = graphPlotDiv;
            let tempDiv: HTMLDivElement | null = null;
            if(appState.graphing.currentView.type === 'dataframe') {
                tempDiv = document.createElement('div');
                tempDiv.style.width = '800px';
                tempDiv.style.height = '600px';
                document.body.appendChild(tempDiv);
                renderDataFrameHead(); // Renders into graphPlotDiv
                tempDiv.innerHTML = graphPlotDiv.innerHTML;
                targetDiv = tempDiv;
            }
            if(!targetDiv.hasChildNodes() || (targetDiv.firstChild as HTMLElement)?.classList.contains('text-muted-foreground')) {
                e.preventDefault(); return;
            }
            try {
                const dataUrl = await Plotly.toImage(targetDiv, { format: 'png', width: 800, height: 600 });
                e.dataTransfer!.setData('DownloadURL', `image/png:insightflow_view.png:${dataUrl}`);
            } catch (error) { console.error("Failed to export image", error); }
            if (tempDiv) document.body.removeChild(tempDiv);
            if(appState.graphing.currentView.type === 'dataframe') plotDefault();
        });


        spreadsheetContainer.addEventListener('dragstart', e => {
            const target = e.target as HTMLElement;
            if (!target.matches('th.col-header.in-selection')) { e.preventDefault(); return; }
            const { selectionStart, selectionEnd } = appState.spreadsheet;
            if (!selectionStart || !selectionEnd) return;
            const minCol = Math.min(selectionStart.col, selectionEnd.col);
            const maxCol = Math.max(selectionStart.col, selectionEnd.col);
            let colIndices = [];
            for (let i = minCol; i <= maxCol; i++) { if (appState.spreadsheet.columns[i]?.name) colIndices.push(i); }
            if (colIndices.length > 2 || colIndices.length === 0) { e.preventDefault(); return; }
            e.dataTransfer!.setData('application/json', JSON.stringify(colIndices));
            e.dataTransfer!.effectAllowed = 'copy';
            target.classList.add('dragging');
        });
        spreadsheetContainer.addEventListener('dragend', e => { (e.target as HTMLElement).classList.remove('dragging'); });
        
        graphingPanel.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer!.dropEffect = 'copy'; graphingPanel.classList.add('drag-over'); });
        graphingPanel.addEventListener('dragleave', () => { graphingPanel.classList.remove('drag-over'); });
        graphingPanel.addEventListener('drop', e => {
            e.preventDefault();
            graphingPanel.classList.remove('drag-over');
            try {
                const colIndices = JSON.parse(e.dataTransfer!.getData('application/json'));
                showPlotTypeMenu(colIndices);
            } catch (err) { console.error("Drop failed:", err); }
        });
        graphContextMenu.addEventListener('click', e => {
            const target = e.target as HTMLElement;
            if (target.matches('[data-plottype]')) {
                const type = target.dataset.plottype!;
                if (type !== 'cancel') handlePlotSelect(type);
                graphContextMenu.classList.add('hidden');
                appState.graphing.pendingPlot = null;
            }
        });

        // Importer Toggles
        pythonToggle.addEventListener('change', () => {
            pythonInstructions.classList.remove('hidden');
            sqlInstructions.classList.add('hidden');
        });
        sqlToggle.addEventListener('change', () => {
            sqlInstructions.classList.remove('hidden');
            pythonInstructions.classList.add('hidden');
        });

        // Initial Renders
        renderCalculator();
        renderSpreadsheet();
        plotDefault();

        // Game Mode Button Listener
        const newGameBtn = document.createElement('button');
        newGameBtn.className = 'btn';
        newGameBtn.textContent = 'Game Mode';
        newGameBtn.onclick = toggleGameMode;
        calculatorPanel.querySelector('.panel-header')?.insertBefore(newGameBtn, calculatorPanel.querySelector('.export-toggle'));


        return () => {
            // Cleanup listeners if the component were to unmount
            if(gameTimerRef.current) clearInterval(gameTimerRef.current);
            menuBtn.removeEventListener('click', showStatisticsMenu);
            clearBtn.removeEventListener('click', () => handleAction(new MouseEvent('click', { bubbles: true, cancelable: true, view: window, detail: 1, screenX: 0, screenY: 0, clientX: 0, clientY: 0, ctrlKey: false, altKey: false, shiftKey: false, metaKey: false, button: 0, relatedTarget: null })));
        };
    }, []); // Empty dependency array ensures this runs only once

    return (
        <main className="main-grid">
            <div id="importer" className="panel">
                <div className="panel-header"><h2 className="panel-title">Import Lab Data (Simulation)</h2></div>
                <div className="panel-content">
                    <div className="importer-toggle">
                        <input type="radio" name="importer-type" id="importer-python" defaultChecked />
                        <label htmlFor="importer-python">Python (Pandas)</label>
                        <input type="radio" name="importer-type" id="importer-sql" />
                        <label htmlFor="importer-sql">SQL</label>
                    </div>
                    <div id="python-instructions">
                        <p className="text-sm mb-2 text-muted-foreground">Copy and run this command in the console below:</p>
                        <code className="code-block">df = pd.read_csv('lab_data_1.csv')</code>
                    </div>
                    <div id="sql-instructions" className="hidden">
                        <p className="text-sm mb-2 text-muted-foreground">Copy and run this query in the console below:</p>
                        <code className="code-block">SELECT study_hours, exam_score FROM student_performance;</code>
                    </div>
                </div>
            </div>
            
            <div id="calculator" className="panel">
                <div className="panel-header">
                    <h2 className="panel-title">Calculator / Console</h2>
                    {isGameActive && <div id="game-timer" className="text-sm font-mono text-primary animate-pulse">{String(Math.floor(gameTimeLeft / 60)).padStart(2, '0')}:{String(gameTimeLeft % 60).padStart(2, '0')}</div>}
                    <button className="btn" onClick={toggleGameMode}>
                        {isGameActive ? 'End Game' : 'Game Mode'}
                    </button>
                    <div className="export-toggle">
                        <span>Export</span>
                        <label className="switch">
                            <input type="checkbox" id="export-calc-toggle" />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>
                <div id="calculator-content" className="panel-content">
                    <div id="calculator-display" className="flex-grow"></div>
                    <div className="flex gap-2 mt-2 flex-shrink-0">
                        <input type="text" id="calculator-input" className="graph-input" placeholder="Expression or command..." />
                        <button id="calculator-enter" className="btn bg-primary text-primary-foreground w-16 justify-center">=</button>
                    </div>
                </div>
            </div>

            <div id="graphing" className="panel">
                <div className="panel-header">
                    <h2 className="panel-title">Viewer</h2>
                     <div className="export-toggle">
                        <span>Export</span>
                        <label className="switch">
                            <input type="checkbox" id="export-viewer-toggle" />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>
                <div id="graphing-content" className="panel-content">
                    <div id="graph-controls" className="graph-controls">
                        <span className="self-center font-code">f(x) =</span>
                        <input type="text" id="graph-function-input" className="graph-input" placeholder="e.g., sin(x) or drop columns here" />
                        <button id="plot-button" className="btn bg-primary text-primary-foreground">Plot</button>
                    </div>
                    <div id="graph-plot" className="flex-grow"></div>
                    <div id="graph-context-menu" className="hidden"></div>
                </div>
            </div>

            <div id="spreadsheet" className="panel">
                <div className="panel-header">
                    <h2 className="panel-title">Lists & Spreadsheet</h2>
                    <div className="flex items-center gap-4">
                        <div className="export-toggle">
                            <span>Export</span>
                            <label className="switch">
                                <input type="checkbox" id="export-sheet-toggle" />
                                <span className="slider"></span>
                            </label>
                        </div>
                        <div>
                            <button id="btn-menu" className="btn">Menu</button>
                            <button id="btn-clear" className="btn ml-2" data-action="clearSheet">Clear Sheet</button>
                        </div>
                    </div>
                </div>
                <div id="spreadsheet-content" className="panel-content"></div>
            </div>
        </main>
    );
}
