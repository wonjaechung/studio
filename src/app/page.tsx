
"use client";
import React, { useEffect, useRef } from 'react';
import Script from 'next/script';
import * as math from 'mathjs';
import { generateExplanation } from '@/ai/flows/generate-explanation';

export default function Home() {
    const isInitialized = useRef(false);

    useEffect(() => {
        if (isInitialized.current || typeof window === 'undefined' || !window.Plotly) return;
        isInitialized.current = true;

        const Plotly = window.Plotly;

        // --- DOM ELEMENT REFERENCES ---
        const calculatorDisplay = document.getElementById('calculator-display');
        const calculatorInput = document.getElementById('calculator-input') as HTMLInputElement;
        const calculatorEnterBtn = document.getElementById('calculator-enter');
        const spreadsheetContainer = document.getElementById('spreadsheet-content');
        const graphingPanel = document.getElementById('graphing');
        const graphControls = document.getElementById('graph-controls');
        const plotButton = document.getElementById('plot-button');
        const functionInput = document.getElementById('graph-function-input') as HTMLInputElement;
        const graphPlotDiv = document.getElementById('graph-plot');
        const graphContextMenu = document.getElementById('graph-context-menu');
        const menuBtn = document.getElementById('btn-menu');
        const clearBtn = document.getElementById('btn-clear');
        const pythonToggle = document.getElementById('importer-python');
        const sqlToggle = document.getElementById('importer-sql');
        const pythonInstructions = document.getElementById('python-instructions');
        const sqlInstructions = document.getElementById('sql-instructions');
        const exportCalcToggle = document.getElementById('export-calc-toggle') as HTMLInputElement;
        const exportViewerToggle = document.getElementById('export-viewer-toggle') as HTMLInputElement;
        const exportSheetToggle = document.getElementById('export-sheet-toggle') as HTMLInputElement;

        // --- GLOBAL APP STATE ---
        let appState = {
            modal: null as HTMLElement | null,
            spreadsheet: {
                columns: [] as { name: string, data: any[], formula?: string }[],
                activeCell: { col: 0, row: 0 },
                isEditing: false,
                editValue: '',
                selectionStart: null as { col: number, row: number } | null,
                selectionEnd: null as { col: number, row: number } | null,
                isSelecting: false,
                clipboard: '',
                isDataLoaded: false
            },
            calculator: { history: [] as { id: number, input: string, output: string, explanation?: string, type?: string, data?: any }[], nextId: 0 },
            graphing: { pendingPlot: null as { indices: number[] } | null, currentView: 'plot' as any }
        };
        
        // --- AI EXPLANATION ---
        async function fetchAndSetExplanation(entry: typeof appState.calculator.history[0]) {
            try {
                const explanation = await generateExplanation({
                    input: entry.input,
                    output: entry.output,
                    type: entry.type,
                    data: entry.data,
                });
                const historyEntry = appState.calculator.history.find(h => h.id === entry.id);
                if (historyEntry) {
                    historyEntry.explanation = explanation;
                    renderCalculator();
                }
            } catch (error) {
                console.error("Failed to generate explanation:", error);
                 const historyEntry = appState.calculator.history.find(h => h.id === entry.id);
                if (historyEntry) {
                    historyEntry.explanation = "Could not generate an explanation at this time.";
                    renderCalculator();
                }
            }
        }
        
        function addHistoryEntry(entry: Omit<typeof appState.calculator.history[0], 'id'>) {
            const newEntry = { ...entry, id: appState.calculator.nextId++ };
            appState.calculator.history.push(newEntry);
            if (newEntry.type) { // Only fetch explanations for statistical functions
                fetchAndSetExplanation(newEntry);
            }
            renderCalculator();
            return newEntry;
        }


        // --- STATISTICAL HELPERS ---
        function invNorm(p: number) { if (p <= 0 || p >= 1) return NaN; const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00]; const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01]; const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00]; const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00]; const p_low = 0.02425; const p_high = 1 - p_low; let q, x; if (p < p_low) { q = Math.sqrt(-2 * Math.log(p)); x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); } else if (p <= p_high) { q = p - 0.5; let r = q * q; x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1); } else { q = Math.sqrt(-2 * Math.log(1 - p)); x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); } return x; }
        const stats = { sum: (arr: any[]) => arr.reduce((acc, val) => acc + parseFloat(val), 0), mean: (arr: any[]) => stats.sum(arr) / arr.length, stddev: (arr: any[], isPopulation = false) => { if (arr.length < 2) return 0; const meanVal = stats.mean(arr); const sqDiffs = arr.map(val => Math.pow(parseFloat(val) - meanVal, 2)); const variance = stats.sum(sqDiffs) / (arr.length - (isPopulation ? 0 : 1)); return Math.sqrt(variance); }, median: (arr: any[]) => { const sorted = [...arr].sort((a, b) => parseFloat(a) - parseFloat(b)); const mid = Math.floor(sorted.length / 2); return sorted.length % 2 !== 0 ? parseFloat(sorted[mid]) : (parseFloat(sorted[mid - 1]) + parseFloat(sorted[mid])) / 2; }, quartile: (arr: any[], q: number) => { const sorted = [...arr].sort((a, b) => parseFloat(a) - parseFloat(b)); const pos = (sorted.length - 1) * q; const base = Math.floor(pos); const rest = pos - base; if (sorted[base + 1] !== undefined) return parseFloat(sorted[base]) + rest * (parseFloat(sorted[base + 1]) - parseFloat(sorted[base])); return parseFloat(sorted[base]); }, combinations: (n: number, k: number) => { if (k < 0 || k > n) return 0; if (k === 0 || k === n) return 1; if (k > n / 2) k = n - k; let res = 1; for (let i = 1; i <= k; i++) { res = res * (n - i + 1) / i; } return Math.round(res); }, binomialPdf: (n: number, p: number, k: number) => stats.combinations(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k), geometricPdf: (p: number, k: number) => Math.pow(1 - p, k - 1) * p, normalCdf: (lower: number, upper: number, mean: number, std: number) => (math.erf((upper - mean) / (std * Math.sqrt(2))) - math.erf((lower - mean) / (std * Math.sqrt(2)))) / 2, invNorm: (p: number, mean: number, std: number) => mean + std * invNorm(p), invT: (p: number, df: number) => { const z = invNorm(p); if (isNaN(z)) return NaN; const z2 = z * z; const g1 = (z2 * z + z) / 4; const g2 = (5 * z2 * z2 * z + 16 * z2 * z + 3 * z) / 96; const g3 = (3 * z2 * z2 * z2 * z + 19 * z2 * z2 * z + 17 * z2 * z - 15 * z) / 384; return z + (g1 / df) + (g2 / (df * df)) + (g3 / (df * df * df)); }, tCdf: (t: number, df: number) => { let x = df / (t * t + df); function incompleteBeta(x: number, a: number, b: number) { if (x <= 0) return 0; if (x >= 1) return 1; const bt = Math.exp(math.gamma(a + b) - math.gamma(a) - math.gamma(b) + a * Math.log(x) + b * Math.log(1 - x)); if (x < (a + 1) / (a + b + 2)) { return bt * continuedFraction(x, a, b) / a; } else { return 1 - bt * continuedFraction(1 - x, b, a) / b; } } function continuedFraction(x: number, a: number, b: number) { const maxIterations = 100; const epsilon = 1e-15; let am = 1, bm = 1, az = 1, qab = a + b, qap = a + 1, qam = a - 1, bz = 1 - qab * x / qap; for (let i = 1; i <= maxIterations; i++) { let d = i * (b - i) * x / ((qam + 2 * i) * (a + 2 * i)); let ap = az + d * am; let bp = bz + d * bm; d = -(a + i) * (qab + i) * x / ((a + 2 * i) * (qap + 2 * i)); let app = ap + d * az; let bpp = bp + d * bz; am = ap / bpp; bm = bp / bpp; az = app / bpp; bz = 1; if (Math.abs(az - am) < (epsilon * Math.abs(az))) return az; } return az; } let p = incompleteBeta(x, df / 2, 0.5); return t > 0 ? 1 - 0.5 * p : 0.5 * p; } };

        // --- DATA & SPREADSHEET LOGIC ---
        function getColumnByName(name: string) { return appState.spreadsheet.columns.find(c => c.name === name); }
        function getColumnData(name: string) { const col = getColumnByName(name); return col ? col.data.map(v => parseFloat(v as string)).filter(v => !isNaN(v)) : []; }
        function addDataColumn(name: string, data: any[] = []) { const existing = getColumnByName(name); if (existing) existing.data = data; else appState.spreadsheet.columns.push({ name: name, data: data }); }
        function getNextAvailableColumnIndex() { return appState.spreadsheet.columns.length; }

        // --- RENDERING LOGIC ---
        function closeModal() {
            appState.modal = null;
            const existingModal = document.querySelector('.modal');
            const backdrop = document.querySelector('.modal-backdrop');
            if (existingModal) existingModal.remove();
            if (backdrop) backdrop.remove();
        }

        function renderSpreadsheet() {
            const { columns, activeCell, isEditing, editValue, selectionStart, selectionEnd } = appState.spreadsheet;
            let tableHTML = `<div class="spreadsheet-container"><table class="spreadsheet-table">`;
            tableHTML += '<thead><tr><th></th>';
            const numCols = Math.max(columns.length + 2, 10);
            for (let i = 0; i < numCols; i++) {
                const col = columns[i];
                let colName = col ? col.name : String.fromCharCode(65 + i);
                if (col && col.formula) colName = `=${col.formula}`;
                let headerClasses = 'col-header';
                if (selectionStart && selectionEnd && i >= Math.min(selectionStart.col, selectionEnd.col) && i <= Math.max(selectionStart.col, selectionEnd.col)) {
                    headerClasses += ' in-selection';
                }
                tableHTML += `<th class="${headerClasses}" data-col="${i}" data-row="-1" draggable="true">${colName}</th>`;
            }
            tableHTML += '</tr></thead><tbody>';
            for (let r = 0; r < 200; r++) {
                tableHTML += `<tr><td class="row-header">${r + 1}</td>`;
                for (let c = 0; c < numCols; c++) {
                    const cellValue = columns[c] && columns[c].data[r] !== undefined ? columns[c].data[r] : '';
                    let cellClasses = '';
                    if (activeCell.col === c && activeCell.row === r) cellClasses += 'selected';
                    if (selectionStart && selectionEnd) {
                        const minCol = Math.min(selectionStart.col, selectionEnd.col); const maxCol = Math.max(selectionStart.col, selectionEnd.col);
                        const minRow = Math.min(selectionStart.row, selectionEnd.row); const maxRow = Math.max(selectionStart.row, selectionEnd.row);
                        if (c >= minCol && c <= maxCol && r >= minRow && r <= maxRow) { cellClasses += ' in-selection'; }
                    }
                    tableHTML += `<td class="${cellClasses}" data-col="${c}" data-row="${r}">${isEditing && activeCell.col === c && activeCell.row === r ? `<input type="text" value="${editValue}" onblur="this.dispatchEvent(new CustomEvent('finishEditing', {bubbles: true, detail: this.value}))" onkeydown="this.dispatchEvent(new CustomEvent('handleEditKey', {bubbles: true, detail: event}))" />` : cellValue}</td>`;
                }
                tableHTML += '</tr>';
            }
            tableHTML += '</tbody></table></div>';
            spreadsheetContainer!.innerHTML = tableHTML;
            if (isEditing) { const input = spreadsheetContainer!.querySelector('input'); if (input) { input.focus(); input.select(); } }
        }

        function renderCalculator() {
            let historyHTML = '<div class="calculator-display">';
            appState.calculator.history.slice().reverse().forEach(entry => {
                const loadingIndicator = entry.type && entry.explanation === undefined ? 
                    `<div class="calc-explanation">Generating explanation...</div>` :
                    (entry.explanation ? `<div class="calc-explanation">${entry.explanation}</div>` : '');
                
                historyHTML += `<div class="calc-entry">
                    <div class="calc-input">${entry.input}</div>
                    <div class="calc-output">${entry.output}</div>
                    ${loadingIndicator}
                </div>`;
            });
            historyHTML += '</div>';
            calculatorDisplay!.innerHTML = historyHTML;
        }
        
        function renderModal(modalConfig: any) {
            closeModal();
            const { title, fields, buttons } = modalConfig;
            const colNames = appState.spreadsheet.columns.map(c => c.name).filter(Boolean);
            if (colNames.length === 0 && !title.includes("Clear") && !title.includes("Info")) {
                showMessageModal('Spreadsheet is empty. Add data to a named column first.');
                return;
            }
            let modalHTML = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">`;
            modalHTML += `<div class="modal-title" id="modal-title">${title}</div>`;
            fields.forEach((field: any) => {
                modalHTML += `<div class="modal-field">`;
                if (field.type !== 'static') modalHTML += `<label for="${field.id}">${field.label}:</label>`;
                if (field.type === 'select') {
                    modalHTML += `<select id="${field.id}">`;
                    (field.options || colNames).forEach((opt: string) => { modalHTML += `<option value="${opt}">${opt}</option>`; });
                    modalHTML += `</select>`;
                } else if (field.type === 'static') {
                    modalHTML += `<span>${field.label}</span>`;
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
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            appState.modal = document.querySelector('.modal');
        }

        // --- GRAPHING LOGIC ---
        const plotlyLayout = { paper_bgcolor: 'hsl(var(--card))', plot_bgcolor: 'hsl(var(--card))', font: { color: 'hsl(var(--foreground))' }, xaxis: { gridcolor: 'hsl(var(--border))', zerolinecolor: 'hsl(var(--muted))' }, yaxis: { gridcolor: 'hsl(var(--border))', zerolinecolor: 'hsl(var(--muted))' }, margin: { l: 50, r: 20, b: 40, t: 40 }, showlegend: false };
        function plotFromFunction() { graphControls!.classList.remove('hidden'); const expression = functionInput.value; if (!expression) { plotDefault(); return; } try { const node = math.parse(expression); const code = node.compile(); const xValues = math.range(-10, 10, 0.2).toArray(); const yValues = xValues.map((x: number) => code.evaluate({ x: x })); const trace = { x: xValues, y: yValues, type: 'scatter', mode: 'lines', line: { color: 'hsl(var(--primary))', width: 3 } }; Plotly.newPlot(graphPlotDiv, [trace], plotlyLayout, { responsive: true }); appState.graphing.currentView = { type: 'plot', data: [trace], layout: plotlyLayout }; } catch (err: any) { graphPlotDiv!.innerHTML = `<div class="p-4 text-red-400">Error: ${err.message}</div>`; } }
        function plotDefault() { graphControls!.classList.remove('hidden'); graphPlotDiv!.innerHTML = `<div class="flex items-center justify-center h-full text-gray-500">Drop columns here to plot data</div>`; appState.graphing.currentView = 'default'; }
        function plotHistogram(colIndex: number) { graphControls!.classList.remove('hidden'); const col = appState.spreadsheet.columns[colIndex]; const data = getColumnData(col.name); const trace = { x: data, type: 'histogram', marker: { color: 'hsl(var(--accent))' } }; const layout = { ...plotlyLayout, title: `Histogram of ${col.name}`, yaxis: { ...plotlyLayout.yaxis, title: 'Frequency' } }; Plotly.newPlot(graphPlotDiv, [trace], layout, { responsive: true }); appState.graphing.currentView = { type: 'plot', data: [trace], layout: layout }; }
        function plotBoxPlot(colIndex: number) { graphControls!.classList.remove('hidden'); const col = appState.spreadsheet.columns[colIndex]; const data = getColumnData(col.name); const trace = { y: data, type: 'box', marker: { color: 'hsl(var(--primary))' }, name: col.name }; const layout = { ...plotlyLayout, title: `Box Plot of ${col.name}` }; Plotly.newPlot(graphPlotDiv, [trace], layout, { responsive: true }); appState.graphing.currentView = { type: 'plot', data: [trace], layout: layout }; }
        function plotScatter(colIndex1: number, colIndex2: number) { graphControls!.classList.remove('hidden'); const col1 = appState.spreadsheet.columns[colIndex1]; const col2 = appState.spreadsheet.columns[colIndex2]; const xData = getColumnData(col1.name); const yData = getColumnData(col2.name); const n = Math.min(xData.length, yData.length); if (n < 2) { showMessageModal("Need at least 2 data points for a scatter plot."); return; } const sumX = stats.sum(xData); const sumY = stats.sum(yData); const sumXY = stats.sum(xData.map((x, i) => x * yData[i])); const sumX2 = stats.sum(xData.map(x => x * x)); const sumY2 = stats.sum(yData.map(y => y * y)); const b = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX); const a = (sumY / n) - b * (sumX / n); const rNumerator = (n * sumXY - sumX * sumY); const rDenominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)); const r = rNumerator / rDenominator; const xRange = [Math.min(...xData), Math.max(...xData)]; const yRange = xRange.map(x => a + b * x); const scatterTrace = { x: xData, y: yData, mode: 'markers', type: 'scatter', marker: { color: '#F59E0B' } }; const lineTrace = { x: xRange, y: yRange, mode: 'lines', type: 'scatter', line: { color: '#EF4444', width: 2 } }; const layout = { ...plotlyLayout, title: `<b>${col1.name} vs. ${col2.name}</b><br>ŷ = ${a.toFixed(3)} + ${b.toFixed(3)}x | r²=${(r * r).toFixed(3)} | r=${r.toFixed(3)}`, xaxis: { ...plotlyLayout.xaxis, title: col1.name }, yaxis: { ...plotlyLayout.yaxis, title: col2.name } }; Plotly.newPlot(graphPlotDiv, [scatterTrace, lineTrace], layout, { responsive: true }); appState.graphing.currentView = { type: 'plot', data: [scatterTrace, lineTrace], layout: layout }; }
        function showPlotTypeMenu(colIndices: number[]) { appState.graphing.pendingPlot = { indices: colIndices }; let menuHTML = ''; let subtitle = ''; let optionsHTML = ''; if (colIndices.length === 1) { const colName = appState.spreadsheet.columns[colIndices[0]].name; subtitle = `1 Variable Selected: <strong>${colName}</strong>`; optionsHTML = `<button class="btn" data-plottype="histogram">Histogram</button><button class="btn" data-plottype="boxplot">Box Plot</button>`; } else if (colIndices.length === 2) { const name1 = appState.spreadsheet.columns[colIndices[0]].name; const name2 = appState.spreadsheet.columns[colIndices[1]].name; subtitle = `2 Variables Selected: <strong>${name1}</strong> vs <strong>${name2}</strong>`; optionsHTML = `<button class="btn btn-primary" data-plottype="scatter">Scatter Plot</button>`; } else { plotDefault(); showMessageModal("Please drag one or two columns to plot."); return; } menuHTML = `<div class="context-menu-title">Choose Plot Type</div><div class="context-menu-subtitle">${subtitle}</div><div class="context-menu-options">${optionsHTML}</div><button class="btn mt-4" data-plottype="cancel">Cancel</button>`; graphContextMenu!.innerHTML = menuHTML; graphContextMenu!.classList.remove('hidden'); }

        // --- ACTIONS & EVENT HANDLERS ---
        const actions: { [key: string]: () => void } = {
            show1VarStatsModal() { renderModal({ title: 'One-Variable Statistics', fields: [{ id: 'x1list', label: 'X1 List', type: 'select' }], buttons: [{ label: 'OK', action: 'run1VarStats' }, { label: 'Cancel', action: 'closeModal' }] }); },
            run1VarStats() { const listName = (document.getElementById('x1list') as HTMLSelectElement).value; const data = getColumnData(listName); if (data.length === 0) { showMessageModal('Selected list is empty.'); return; } const results = { 'Title': 'One-Var Stats', 'x̄': stats.mean(data).toFixed(4), 'Σx': stats.sum(data).toFixed(4), 'Σx²': stats.sum(data.map(x => x * x)).toFixed(4), 'Sx': stats.stddev(data, false).toFixed(4), 'σx': stats.stddev(data, true).toFixed(4), 'n': data.length, 'MinX': Math.min(...data), 'Q₁X': stats.quartile(data, 0.25), 'MedianX': stats.median(data), 'Q₃X': stats.quartile(data, 0.75), 'MaxX': Math.max(...data) }; const resultColIndex = getNextAvailableColumnIndex(); addDataColumn(String.fromCharCode(65 + resultColIndex), Object.keys(results)); addDataColumn(String.fromCharCode(65 + resultColIndex + 1), Object.values(results)); appState.spreadsheet.columns[resultColIndex + 1].formula = `OneVar(${listName})`; renderSpreadsheet(); closeModal(); addHistoryEntry({ type: '1VarStats', input: `1-Var Stats for ${listName}`, output: `Mean (x̄) = ${results['x̄']}\nSample SD (Sx) = ${results['Sx']}`, data: { results, listName } }); },
            showLinRegModal() { renderModal({ title: 'Linear Regression (a+bx)', fields: [{ id: 'xlist', label: 'X List', type: 'select' }, { id: 'ylist', label: 'Y List', type: 'select' }], buttons: [{ label: 'OK', action: 'runLinReg' }, { label: 'Cancel', action: 'closeModal' }] }); },
            runLinReg() { const xListName = (document.getElementById('xlist') as HTMLSelectElement).value; const yListName = (document.getElementById('ylist') as HTMLSelectElement).value; const xData = getColumnData(xListName); const yData = getColumnData(yListName); if (xData.length < 2 || yData.length < 2 || xData.length !== yData.length) { showMessageModal('X and Y lists must have the same number of numerical data points (at least 2).'); return; } const n = xData.length; const sumX = stats.sum(xData); const sumY = stats.sum(yData); const sumXY = stats.sum(xData.map((x, i) => x * yData[i])); const sumX2 = stats.sum(xData.map(x => x * x)); const sumY2 = stats.sum(yData.map(y => y * y)); const b = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX); const a = (sumY / n) - b * (sumX / n); const rNumerator = (n * sumXY - sumX * sumY); const rDenominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)); const r = rNumerator / rDenominator; const residuals = xData.map((x, i) => yData[i] - (a + b * x)); const s = Math.sqrt(stats.sum(residuals.map(res => res * res)) / (n - 2)); const sx = stats.stddev(xData); const seSlope = s / (sx * Math.sqrt(n - 1)); const results = { 'Title': 'LinReg (a+bx)', 'RegEqn': 'a+b*x', 'a': a.toFixed(4), 'b': b.toFixed(4), 'r²': (r * r).toFixed(4), 'r': r.toFixed(4), 'SE Slope': seSlope.toFixed(4) }; const resultColIndex = getNextAvailableColumnIndex(); addDataColumn(String.fromCharCode(65 + resultColIndex), Object.keys(results)); addDataColumn(String.fromCharCode(65 + resultColIndex + 1), Object.values(results)); appState.spreadsheet.columns[resultColIndex + 1].formula = `LinRegBx(${xListName},${yListName})`; addDataColumn('statresid', residuals.map(r => r.toFixed(4))); renderSpreadsheet(); closeModal(); addHistoryEntry({ type: 'LinReg', input: `LinReg for ${yListName} vs ${xListName}`, output: `y = ${results.a} + ${results.b}x\nr² = ${results['r²']}`, data: { results, xListName, yListName } }); },
            showNormalCdfModal() { renderModal({ title: 'Normal Cdf', fields: [{ id: 'lower', label: 'Lower Bound', value: '-1E99' }, { id: 'upper', label: 'Upper Bound' }, { id: 'mu', label: 'μ', value: '0' }, { id: 'sigma', label: 'σ', value: '1' },], buttons: [{ label: 'OK', action: 'runNormalCdf' }, { label: 'Cancel', action: 'closeModal' }] }); },
            runNormalCdf() { const lower = parseFloat((document.getElementById('lower') as HTMLInputElement).value); const upper = parseFloat((document.getElementById('upper') as HTMLInputElement).value); const mu = parseFloat((document.getElementById('mu') as HTMLInputElement).value); const sigma = parseFloat((document.getElementById('sigma') as HTMLInputElement).value); const result = stats.normalCdf(lower, upper, mu, sigma); addHistoryEntry({ type: 'NormalCdf', input: `normCdf(${lower},${upper},${mu},${sigma})`, output: result.toFixed(6), data: { lower, upper, mu, sigma, result } }); closeModal(); },
            showInvNormModal() { renderModal({ title: 'Inverse Normal', fields: [{ id: 'area', label: 'Area' }, { id: 'mu', label: 'μ', value: '0' }, { id: 'sigma', label: 'σ', value: '1' },], buttons: [{ label: 'OK', action: 'runInvNorm' }, { label: 'Cancel', action: 'closeModal' }] }); },
            runInvNorm() { const area = parseFloat((document.getElementById('area') as HTMLInputElement).value); const mu = parseFloat((document.getElementById('mu') as HTMLInputElement).value); const sigma = parseFloat((document.getElementById('sigma') as HTMLInputElement).value); const result = stats.invNorm(area, mu, sigma); addHistoryEntry({ type: 'InvNorm', input: `invNorm(${area},${mu},${sigma})`, output: result.toFixed(6), data: { area, mu, sigma, result } }); closeModal(); },
            showBinomPdfModal() { renderModal({ title: 'Binomial Pdf', fields: [{ id: 'n', label: 'Num Trials, n' }, { id: 'p', label: 'Prob Success, p' }, { id: 'x', label: 'X Value' },], buttons: [{ label: 'OK', action: 'runBinomPdf' }, { label: 'Cancel', action: 'closeModal' }] }); },
            runBinomPdf() { const n = parseInt((document.getElementById('n') as HTMLInputElement).value); const p = parseFloat((document.getElementById('p') as HTMLInputElement).value); const x = parseInt((document.getElementById('x') as HTMLInputElement).value); const result = stats.binomialPdf(n, p, x); addHistoryEntry({ type: 'BinomPdf', input: `binomPdf(${n},${p},${x})`, output: result.toFixed(6), data: { n, p, x, result } }); closeModal(); },
            showBinomCdfModal() { renderModal({ title: 'Binomial Cdf', fields: [{ id: 'n', label: 'Num Trials, n' }, { id: 'p', label: 'Prob Success, p' }, { id: 'x', label: 'Upper Bound' },], buttons: [{ label: 'OK', action: 'runBinomCdf' }, { label: 'Cancel', action: 'closeModal' }] }); },
            runBinomCdf() { const n = parseInt((document.getElementById('n') as HTMLInputElement).value); const p = parseFloat((document.getElementById('p') as HTMLInputElement).value); const x = parseInt((document.getElementById('x') as HTMLInputElement).value); let totalProb = 0; for (let i = 0; i <= x; i++) { totalProb += stats.binomialPdf(n, p, i); } addHistoryEntry({ type: 'BinomCdf', input: `binomCdf(${n},${p},${x})`, output: totalProb.toFixed(6), data: { n, p, x, result: totalProb } }); closeModal(); },
            showGeomPdfModal() { renderModal({ title: 'Geometric Pdf', fields: [{ id: 'p', label: 'Prob Success, p' }, { id: 'x', label: 'X Value' },], buttons: [{ label: 'OK', action: 'runGeomPdf' }, { label: 'Cancel', action: 'closeModal' }] }); },
            runGeomPdf() { const p = parseFloat((document.getElementById('p') as HTMLInputElement).value); const x = parseInt((document.getElementById('x') as HTMLInputElement).value); const result = stats.geometricPdf(p, x); addHistoryEntry({ type: 'GeomPdf', input: `geomPdf(${p},${x})`, output: result.toFixed(6), data: { p, x, result } }); closeModal(); },
            showGeomCdfModal() { renderModal({ title: 'Geometric Cdf', fields: [{ id: 'p', label: 'Prob Success, p' }, { id: 'lower', label: 'Lower Bound' }, { id: 'upper', label: 'Upper Bound' },], buttons: [{ label: 'OK', action: 'runGeomCdf' }, { label: 'Cancel', action: 'closeModal' }] }); },
            runGeomCdf() { const p = parseFloat((document.getElementById('p') as HTMLInputElement).value); const lower = parseInt((document.getElementById('lower') as HTMLInputElement).value); const upper = parseInt((document.getElementById('upper') as HTMLInputElement).value); let totalProb = 0; for (let i = lower; i <= upper; i++) { totalProb += stats.geometricPdf(p, i); } addHistoryEntry({ type: 'GeomCdf', input: `geomCdf(${p},${lower},${upper})`, output: totalProb.toFixed(6), data: { p, lower, upper, result: totalProb } }); closeModal(); },
            showTIntervalModalChooser() { renderModal({ title: 't Interval', fields: [{ id: 'inputMethod', label: 'Data Input Method', type: 'select', options: ['Stats', 'Data'] }], buttons: [{ label: 'OK', action: 'chooseTIntervalModal' }, { label: 'Cancel', action: 'closeModal' }] }); },
            chooseTIntervalModal() { const method = (document.getElementById('inputMethod') as HTMLSelectElement).value; if (method === 'Stats') actions.showTIntervalStatsModal(); else actions.showTIntervalDataModal(); },
            showTIntervalStatsModal() { renderModal({ title: 't Interval (Stats)', fields: [{ id: 'mean', label: 'x̄' }, { id: 'sx', label: 'Sx' }, { id: 'n', label: 'n' }, { id: 'clevel', label: 'C Level', value: '0.95' }], buttons: [{ label: 'OK', action: 'runTIntervalFromStats' }, { label: 'Cancel', action: 'closeModal' }] }); },
            showTIntervalDataModal() { renderModal({ title: 't Interval (Data)', fields: [{ id: 'list', label: 'List', type: 'select' }, { id: 'clevel', label: 'C Level', value: '0.95' }], buttons: [{ label: 'OK', action: 'runTIntervalFromData' }, { label: 'Cancel', action: 'closeModal' }] }); },
            runTIntervalFromStats() { const mean = parseFloat((document.getElementById('mean') as HTMLInputElement).value); const sx = parseFloat((document.getElementById('sx') as HTMLInputElement).value); const n = parseInt((document.getElementById('n') as HTMLInputElement).value); const cLevel = parseFloat((document.getElementById('clevel') as HTMLInputElement).value); if (isNaN(mean) || isNaN(sx) || isNaN(n) || isNaN(cLevel)) { showMessageModal("Invalid input."); return; } actions.runTInterval(mean, sx, n, cLevel); },
            runTIntervalFromData() { const listName = (document.getElementById('list') as HTMLSelectElement).value; const cLevel = parseFloat((document.getElementById('clevel') as HTMLInputElement).value); const data = getColumnData(listName); if (data.length < 2) { showMessageModal("List must have >= 2 numbers."); return; } const mean = stats.mean(data); const sx = stats.stddev(data); const n = data.length; actions.runTInterval(mean, sx, n, cLevel); },
            runTInterval(mean: number, sx: number, n: number, cLevel: number) { const df = n - 1; const alpha = 1 - cLevel; const tStar = stats.invT(1 - alpha / 2, df); const me = tStar * (sx / Math.sqrt(n)); const lower = mean - me; const upper = mean + me; const output = `(${lower.toFixed(4)}, ${upper.toFixed(4)})`; addHistoryEntry({ type: 'tInterval', input: `tInterval(C-Level=${cLevel}, x̄=${mean.toFixed(2)}, Sx=${sx.toFixed(2)}, n=${n})`, output: output, data: { lower, upper, me, df, mean, sx, n, cLevel } }); closeModal(); },
            showTTestModal() { renderModal({ title: 't Test', fields: [{ id: 'mu0', label: 'μ₀' }, { id: 'mean', label: 'x̄' }, { id: 'sx', label: 'Sx' }, { id: 'n', label: 'n' }, { id: 'alt', label: 'Alternate Hyp', type: 'select', options: ['μ ≠ μ₀', 'μ < μ₀', 'μ > μ₀'] }], buttons: [{ label: 'OK', action: 'runTTest' }, { label: 'Cancel', action: 'closeModal' }] }); },
            runTTest() { const mu0 = parseFloat((document.getElementById('mu0') as HTMLInputElement).value); const mean = parseFloat((document.getElementById('mean') as HTMLInputElement).value); const sx = parseFloat((document.getElementById('sx') as HTMLInputElement).value); const n = parseInt((document.getElementById('n') as HTMLInputElement).value); const alt = (document.getElementById('alt') as HTMLSelectElement).value; if (isNaN(mu0) || isNaN(mean) || isNaN(sx) || isNaN(n)) { showMessageModal("Invalid input."); return; } const df = n - 1; const tStat = (mean - mu0) / (sx / Math.sqrt(n)); let pVal; if (alt === 'μ < μ₀') pVal = stats.tCdf(tStat, df); else if (alt === 'μ > μ₀') pVal = 1 - stats.tCdf(tStat, df); else pVal = 2 * (1 - stats.tCdf(Math.abs(tStat), df)); const output = `t=${tStat.toFixed(4)}, p=${pVal.toFixed(4)}`; addHistoryEntry({ type: 'tTest', input: `tTest(μ₀=${mu0}, x̄=${mean}, Sx=${sx}, n=${n}, alt=${alt})`, output: output, data: { mu0, mean, sx, n, alt, tStat, pVal, df } }); closeModal(); },
            showClearConfirmModal() { renderModal({ title: 'Confirm Clear', fields: [{ type: 'static', label: 'Clear all spreadsheet data?' }], buttons: [{ label: 'OK', action: 'clearSpreadsheet' }, { label: 'Cancel', action: 'closeModal' }] }); },
            clearSpreadsheet() { appState.spreadsheet.columns = []; appState.spreadsheet.activeCell = { col: 0, row: 0 }; appState.spreadsheet.selectionStart = null; appState.spreadsheet.selectionEnd = null; appState.spreadsheet.isDataLoaded = false; renderSpreadsheet(); closeModal(); },
            pasteSelection() { const pasteData = appState.spreadsheet.clipboard; if (!pasteData) { showMessageModal("Clipboard is empty."); return; } const rows = pasteData.split('\n'); const startCell = appState.spreadsheet.activeCell; rows.forEach((rowStr, rowIndex) => { const cells = rowStr.split('\t'); cells.forEach((cellStr, colIndex) => { const targetRow = startCell.row + rowIndex; const targetCol = startCell.col + colIndex; while (targetCol >= appState.spreadsheet.columns.length) { addDataColumn(String.fromCharCode(65 + appState.spreadsheet.columns.length)); } const numValue = parseFloat(cellStr); appState.spreadsheet.columns[targetCol].data[targetRow] = isNaN(numValue) ? cellStr : numValue; }); }); renderSpreadsheet(); closeModal(); },
            closeModal: closeModal
        };

        function showStatisticsMenu() {
            closeModal();
            const menuItems = [
                { label: 'One-Variable Stats', action: 'show1VarStatsModal' },
                { label: 't Interval', action: 'showTIntervalModalChooser' },
                { label: 't Test', action: 'showTTestModal' },
                { label: 'LinReg (a+bx)', action: 'showLinRegModal' },
                { label: 'Normal Cdf', action: 'showNormalCdfModal' },
                { label: 'Inverse Normal', action: 'showInvNormModal' },
                { label: 'Binomial Pdf', action: 'showBinomPdfModal' },
                { label: 'Binomial Cdf', action: 'showBinomCdfModal' },
                { label: 'Geometric Pdf', action: 'showGeomPdfModal' },
                { label: 'Geometric Cdf', action: 'showGeomCdfModal' }
            ];
            let modalHTML = `<div class="modal" id="stats-menu" style="background-color: var(--bg-secondary); color: var(--text-primary); max-width: 500px;">
                <div class="modal-title" style="border-color: var(--border-color);">Statistics & Distributions</div>
                <div class="grid grid-cols-2 gap-3 my-4">`;
            menuItems.forEach(item => {
                modalHTML += `<button class="btn" data-action="${item.action}">${item.label}</button>`;
            });
            modalHTML += `</div><div class="modal-buttons">
                <button class="btn btn-primary" data-action="closeModal">Close</button>
            </div></div>`;

            const backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop';
            backdrop.onclick = closeModal;
            document.body.insertAdjacentElement('afterbegin', backdrop);
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            appState.modal = document.getElementById('stats-menu');
        }

        function handleAction(event: MouseEvent) { const target = (event.target as HTMLElement).closest('[data-action]'); if (target) { const actionName = (target as HTMLElement).dataset.action; if (actionName && actions[actionName]) { actions[actionName](); } } }
        function handleEditKey(event: CustomEvent) { const domEvent = event.detail; const value = (domEvent.target as HTMLInputElement).value; if (domEvent.key === 'Enter') { domEvent.preventDefault(); finishEditing(value, true); } else if (domEvent.key === 'Escape') { appState.spreadsheet.isEditing = false; renderSpreadsheet(); } }
        function finishEditing(value: string, fromEnter = false) { if (!appState.spreadsheet.isEditing) return; const { col, row } = appState.spreadsheet.activeCell; if (row === -1) { if (!appState.spreadsheet.columns[col]) addDataColumn(value); else appState.spreadsheet.columns[col].name = value; } else { if (!appState.spreadsheet.columns[col]) addDataColumn(String.fromCharCode(65 + col)); const numValue = parseFloat(value); appState.spreadsheet.columns[col].data[row] = isNaN(numValue) ? value : numValue; } appState.spreadsheet.isEditing = false; appState.spreadsheet.editValue = ''; if (fromEnter) { appState.spreadsheet.activeCell.row++; } renderSpreadsheet(); }
        function showMessageModal(message: string) { renderModal({ title: 'Info', fields: [{ type: 'static', label: message }], buttons: [{ label: 'OK', action: 'closeModal' }] }); }

        // --- SPREADSHEET MOUSE HANDLERS ---
        function handleSystemPaste(event: ClipboardEvent) { event.preventDefault(); appState.spreadsheet.clipboard = event.clipboardData!.getData('text'); actions.pasteSelection(); }
        function handleMouseDown(event: MouseEvent) { const target = event.target as HTMLElement; if (!target.matches('td, th[data-col]')) return; const col = parseInt(target.dataset.col!); const row = parseInt(target.dataset.row!); if (isNaN(col) || isNaN(row)) return; appState.spreadsheet.isEditing = false; appState.spreadsheet.activeCell = { col, row }; appState.spreadsheet.isSelecting = true; appState.spreadsheet.selectionStart = { col, row }; appState.spreadsheet.selectionEnd = { col, row }; renderSpreadsheet(); }
        function handleMouseMove(event: MouseEvent) { const target = event.target as HTMLElement; if (!appState.spreadsheet.isSelecting || !target.matches('td, th[data-col]')) return; const col = parseInt(target.dataset.col!); const row = parseInt(target.dataset.row!); if (isNaN(col) || isNaN(row)) return; if (appState.spreadsheet.selectionEnd!.col !== col || appState.spreadsheet.selectionEnd!.row !== row) { appState.spreadsheet.selectionEnd = { col, row }; renderSpreadsheet(); } }
        function handleMouseUp() { appState.spreadsheet.isSelecting = false; }

        function renderDataFrameHead() {
            const { columns } = appState.spreadsheet;
            const headRows = columns[0] ? columns[0].data.slice(0, 5) : [];
            let tableHTML = '<table class="dataframe-table">';
            tableHTML += '<thead><tr>' + columns.map(c => `<th>${c.name}</th>`).join('') + '</tr></thead>';
            tableHTML += '<tbody>';
            headRows.forEach((_, rowIndex) => {
                tableHTML += '<tr>' + columns.map(c => `<td>${c.data[rowIndex]}</td>`).join('') + '</tr>';
            });
            tableHTML += '</tbody></table>';
            graphPlotDiv!.innerHTML = tableHTML;
            appState.graphing.currentView = 'dataframe';
        }

        function handleCalculatorInput() {
            const expression = calculatorInput.value.trim();
            if (expression === '') return;

            const pythonCommand = "df = pd.read_csv('lab_data_1.csv')";
            const sqlCommand = "SELECT study_hours, exam_score FROM student_performance;";
            let commandHandled = false;

            if (expression === pythonCommand || expression === sqlCommand) {
                actions.clearSpreadsheet();
                const studyHours = [1, 1.5, 1.8, 2, 2.5, 3, 3.2, 3.8, 4, 4.5, 5, 5.5, 6];
                const examScores = [65, 68, 70, 75, 72, 80, 85, 88, 85, 92, 95, 98, 94];
                addDataColumn('hours', studyHours);
                addDataColumn('score', examScores);
                renderSpreadsheet();
                appState.spreadsheet.isDataLoaded = true;
                addHistoryEntry({ input: expression, output: "Success", explanation: "Sample dataset 'lab_data_1.csv' loaded into the spreadsheet." });
                commandHandled = true;
            } else if (expression.toLowerCase().includes('read_csv') || expression.toLowerCase().includes('select')) {
                addHistoryEntry({ input: expression, output: "Import Failed", explanation: "Incorrect query. Please copy the command from the 'Import Lab Data' panel exactly." });
                commandHandled = true;
            } else if (expression === 'df.head()') {
                if (appState.spreadsheet.isDataLoaded) {
                    renderDataFrameHead();
                    addHistoryEntry({ input: expression, output: "DataFrame head displayed in Viewer." });
                } else {
                    addHistoryEntry({ input: expression, output: "Error", explanation: "NameError: name 'df' is not defined. Load data first." });
                }
                commandHandled = true;
            }

            if (!commandHandled) {
                let output, explanation;
                try {
                    const result = math.evaluate(expression);
                    output = math.format(result, { precision: 14 });
                    explanation = `The result of the expression.`;
                } catch (err: any) {
                    output = 'Error';
                    explanation = err.message;
                }
                addHistoryEntry({ input: expression, output, explanation });
            }

            calculatorInput.value = '';
        }

        // --- EXPORT LOGIC ---
        function getCalculatorExport() {
            return appState.calculator.history.map(e => `> ${e.input}\n${e.output}\n${e.explanation || ''}`).join('\n\n');
        }
        function getSpreadsheetExport() {
            const { columns } = appState.spreadsheet;
            if (columns.length === 0) return '';
            const header = columns.map(c => `"${c.name}"`).join(',');
            let csv = header + '\n';
            const numRows = Math.max(...columns.map(c => c.data.length));
            for (let i = 0; i < numRows; i++) {
                csv += columns.map(c => `"${c.data[i] || ''}"`).join(',') + '\n';
            }
            return csv;
        }
        function getViewerExport() {
            const { currentView } = appState.graphing;
            if (currentView.type === 'plot') {
                return `<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
</head>
<body>
  <div id="plot"></div>
  <script>
    Plotly.newPlot('plot', ${JSON.stringify(currentView.data)}, ${JSON.stringify(currentView.layout)});
  </script>
</body>
</html>`;
            } else if (currentView === 'dataframe') {
                return graphPlotDiv?.innerHTML || '<!-- No dataframe to export -->';
            }
            return '<!-- No plot to export -->';
        }

        function setupDragToExport(toggle: HTMLInputElement, panelHeader: HTMLElement, contentGetter: () => string, mimeType: string) {
            toggle.addEventListener('change', () => {
                panelHeader.draggable = toggle.checked;
                panelHeader.style.cursor = toggle.checked ? 'grab' : 'default';
            });
            panelHeader.addEventListener('dragstart', (e) => {
                if (!toggle.checked) return;
                e.dataTransfer!.setData(mimeType, contentGetter());
            });
        }
        
        // --- INITIALIZATION ---
        menuBtn!.addEventListener('click', showStatisticsMenu);
        clearBtn!.addEventListener('click', actions.showClearConfirmModal);
        document.addEventListener('paste', handleSystemPaste);
        document.body.addEventListener('click', handleAction);
        spreadsheetContainer!.addEventListener('mousedown', handleMouseDown as EventListener);
        spreadsheetContainer!.addEventListener('mousemove', handleMouseMove as EventListener);
        document.addEventListener('mouseup', handleMouseUp);
        spreadsheetContainer!.addEventListener('dblclick', (e) => { const target = e.target as HTMLElement; if (target.matches('td, th[data-col]')) { const { col, row } = appState.spreadsheet.activeCell; const val = row === -1 ? (appState.spreadsheet.columns[col]?.name || '') : (appState.spreadsheet.columns[col]?.data[row] || ''); appState.spreadsheet.isEditing = true; appState.spreadsheet.editValue = String(val); renderSpreadsheet(); } });
        spreadsheetContainer!.addEventListener('finishEditing', (e) => finishEditing((e as CustomEvent).detail));
        spreadsheetContainer!.addEventListener('handleEditKey', (e) => handleEditKey(e as CustomEvent));

        plotButton!.addEventListener('click', plotFromFunction);
        functionInput!.addEventListener('keydown', (e) => { if (e.key === 'Enter') plotFromFunction(); });
        calculatorInput!.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleCalculatorInput(); });
        calculatorEnterBtn!.addEventListener('click', handleCalculatorInput);

        spreadsheetContainer!.addEventListener('dragstart', (e) => {
            const target = e.target as HTMLElement;
            if (!target.matches('th.col-header.in-selection')) { e.preventDefault(); return; }
            const { selectionStart, selectionEnd } = appState.spreadsheet;
            if (!selectionStart || !selectionEnd) return;
            const minCol = Math.min(selectionStart.col, selectionEnd.col);
            const maxCol = Math.max(selectionStart.col, selectionEnd.col);
            let colIndices: number[] = [];
            for (let i = minCol; i <= maxCol; i++) { colIndices.push(i); }
            if (colIndices.length > 2) { showMessageModal("You can only drag up to two columns at a time."); e.preventDefault(); return; }
            e.dataTransfer!.setData('application/json', JSON.stringify(colIndices));
            e.dataTransfer!.effectAllowed = 'copy';
            target.classList.add('dragging');
        });
        spreadsheetContainer!.addEventListener('dragend', (e) => { (e.target as HTMLElement).classList.remove('dragging'); });
        graphingPanel!.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer!.dropEffect = 'copy'; graphingPanel!.classList.add('drag-over'); });
        graphingPanel!.addEventListener('dragleave', () => { graphingPanel!.classList.remove('drag-over'); });
        graphingPanel!.addEventListener('drop', (e) => {
            e.preventDefault();
            graphingPanel!.classList.remove('drag-over');
            const colIndices = JSON.parse(e.dataTransfer!.getData('application/json'));
            showPlotTypeMenu(colIndices);
        });

        graphContextMenu!.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            if (target.matches('[data-plottype]')) {
                const type = target.dataset.plottype;
                if (appState.graphing.pendingPlot) {
                    const { indices } = appState.graphing.pendingPlot;
                    if (type === 'histogram') plotHistogram(indices[0]);
                    else if (type === 'boxplot') plotBoxPlot(indices[0]);
                    else if (type === 'scatter') plotScatter(indices[0], indices[1]);
                }
                graphContextMenu!.classList.add('hidden');
                appState.graphing.pendingPlot = null;
            }
        });

        graphContextMenu!.addEventListener('dragover', (e) => { e.preventDefault(); e.stopPropagation(); graphContextMenu!.classList.add('drag-over'); });
        graphContextMenu!.addEventListener('dragleave', (e) => { e.stopPropagation(); graphContextMenu!.classList.remove('drag-over'); });
        graphContextMenu!.addEventListener('drop', (e) => {
            e.preventDefault(); e.stopPropagation();
            graphContextMenu!.classList.remove('drag-over');
            const newlyDroppedIndices = JSON.parse(e.dataTransfer!.getData('application/json'));
            const existingIndices = appState.graphing.pendingPlot!.indices;
            const combined = [...new Set([...existingIndices, ...newlyDroppedIndices])];
            if (combined.length > 2) { showMessageModal("You can only plot up to two variables."); return; }
            showPlotTypeMenu(combined);
        });

        // Importer Listeners
        pythonToggle!.addEventListener('change', () => {
            pythonInstructions!.classList.remove('hidden');
            sqlInstructions!.classList.add('hidden');
        });
        sqlToggle!.addEventListener('change', () => {
            sqlInstructions!.classList.remove('hidden');
            pythonInstructions!.classList.add('hidden');
        });

        // Setup Export Drags
        setupDragToExport(exportCalcToggle, document.querySelector('#calculator .panel-header')!, getCalculatorExport, 'text/plain');
        setupDragToExport(exportViewerToggle, document.querySelector('#graphing .panel-header')!, getViewerExport, 'text/html');
        setupDragToExport(exportSheetToggle, document.querySelector('#spreadsheet .panel-header')!, getSpreadsheetExport, 'text/csv');

        renderCalculator();
        renderSpreadsheet();
        plotDefault();

    }, []);

    return (
        <>
            <Script src="https://cdn.plot.ly/plotly-2.32.0.min.js" strategy="beforeInteractive" />
            <div className="main-grid">
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
                            <p className="text-sm mb-2 text-gray-400">Copy and run this command in the console below:</p>
                            <code className="code-block">df = pd.read_csv('lab_data_1.csv')</code>
                        </div>
                        <div id="sql-instructions" className="hidden">
                            <p className="text-sm mb-2 text-gray-400">Copy and run this query in the console below:</p>
                            <code className="code-block">SELECT study_hours, exam_score FROM student_performance;</code>
                        </div>
                    </div>
                </div>

                <div id="calculator" className="panel">
                    <div className="panel-header">
                        <h2 className="panel-title">Calculator / Console</h2>
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
                            <button id="calculator-enter" className="btn btn-primary w-16 justify-center">=</button>
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
                            <span className="self-center font-mono">f(x) =</span>
                            <input type="text" id="graph-function-input" className="graph-input" placeholder="e.g., sin(x) or drop columns here" />
                            <button id="plot-button" className="btn btn-primary">Plot</button>
                        </div>
                        <div id="graph-plot" className="flex-grow"></div>
                        <div id="graph-context-menu" className="hidden">
                        </div>
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
                                <button id="btn-clear" className="btn">Clear Sheet</button>
                            </div>
                        </div>
                    </div>
                    <div id="spreadsheet-content" className="panel-content"></div>
                </div>
            </div>
        </>
    );
}

declare global {
    interface Window {
        Plotly: any;
    }
}
