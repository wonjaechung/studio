
'use client';

import React, { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // This is a workaround to avoid hydration errors with Next.js App Router.
    if (typeof window === 'undefined') {
      return;
    }

    // --- DOM ELEMENT REFERENCES ---
    const calculatorPanel = document.getElementById('calculator');
    const calculatorDisplay = document.getElementById('calculator-display');
    const calculatorInput = document.getElementById('calculator-input');
    const calculatorEnterBtn = document.getElementById('calculator-enter');
    const spreadsheetPanel = document.getElementById('spreadsheet');
    const spreadsheetContainer = document.getElementById('spreadsheet-content');
    const graphingPanel = document.getElementById('graphing');
    const graphPlotDiv = document.getElementById('graph-plot');
    const graphContextMenu = document.getElementById('graph-context-menu');
    const menuBtn = document.getElementById('btn-menu');
    const clearBtn = document.getElementById('btn-clear');
    const gameModeBtn = document.getElementById('btn-game-mode');
    const gameDisplay = document.getElementById('game-mode-display');
    const gameTimer = document.getElementById('game-timer');

    // --- GLOBAL APP STATE ---
    let appState: any = {
      modal: null,
      spreadsheet: {
        columns: [],
        activeCell: { col: 0, row: 0 },
        isEditing: false,
        editValue: '',
        selectionStart: null,
        selectionEnd: null,
        isSelecting: false,
        isDataLoaded: false
      },
      calculator: { history: [] },
      graphing: { pendingPlot: null },
      game: { isActive: false, startTime: null, timerInterval: null, question: null, questionsAnswered: 0, correctAnswers: 0 }
    };

    // --- STATISTICAL HELPERS (Full Implementation) ---
    function invNormForT(p: number) { if (p <= 0 || p >= 1) return NaN; const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00]; const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01]; const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00]; const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00]; const p_low = 0.02425; const p_high = 1 - p_low; let q, x; if (p < p_low) { q = Math.sqrt(-2 * Math.log(p)); x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); } else if (p <= p_high) { q = p - 0.5; let r = q * q; x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1); } else { q = Math.sqrt(-2 * Math.log(1 - p)); x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); } return x; }
    const stats: any = { sum: (arr: any[]) => arr.reduce((acc, val) => acc + parseFloat(val), 0), mean: (arr: any[]) => stats.sum(arr) / arr.length, stddev: (arr: any[], isPopulation = false) => { if (arr.length < 2) return 0; const meanVal = stats.mean(arr); const sqDiffs = arr.map((val: any) => Math.pow(parseFloat(val) - meanVal, 2)); const variance = stats.sum(sqDiffs) / (arr.length - (isPopulation ? 0 : 1)); return Math.sqrt(variance); }, median: (arr: any[]) => { const sorted = [...arr].sort((a, b) => parseFloat(a) - parseFloat(b)); const mid = Math.floor(sorted.length / 2); return sorted.length % 2 !== 0 ? parseFloat(sorted[mid]) : (parseFloat(sorted[mid - 1]) + parseFloat(sorted[mid])) / 2; }, quartile: (arr: any[], q: any) => { const sorted = [...arr].sort((a, b) => parseFloat(a) - parseFloat(b)); const pos = (sorted.length - 1) * q; const base = Math.floor(pos); const rest = pos - base; if (sorted[base + 1] !== undefined) return parseFloat(sorted[base]) + rest * (parseFloat(sorted[base + 1]) - parseFloat(sorted[base])); return parseFloat(sorted[base]); }, combinations: (n: number, k: number) => { if (k < 0 || k > n) return 0; if (k === 0 || k === n) return 1; if (k > n / 2) k = n - k; let res = 1; for (let i = 1; i <= k; i++) { res = res * (n - i + 1) / i; } return Math.round(res); }, binomialPdf: (n: number, p: number, k: number) => stats.combinations(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k), normalCdf: (lower: number, upper: number, mean: number, std: number) => ((window as any).math.erf((upper - mean) / (std * Math.sqrt(2))) - (window as any).math.erf((lower - mean) / (std * Math.sqrt(2)))) / 2, invNorm: (p: number, mean: number, std: number) => mean + std * invNormForT(p), invT: (p: number, df: number) => { const z = invNormForT(p); if (isNaN(z)) return NaN; const z2 = z * z; const g1 = (z2 * z + z) / 4; const g2 = (5 * z2 * z2 * z + 16 * z2 * z + 3 * z) / 96; const g3 = (3 * z2 * z2 * z2 * z + 19 * z2 * z2 * z + 17 * z2 * z - 15 * z) / 384; return z + (g1 / df) + (g2 / (df * df)) + (g3 / (df * df * df)); }, tCdf: (t: number, df: number) => { let x = df / (t*t + df); function incompleteBeta(x: number, a: number, b: number) { if (x <= 0) return 0; if (x >= 1) return 1; const bt = (window as any).math.exp((window as any).math.gammaln(a + b) - (window as any).math.gammaln(a) - (window as any).math.gammaln(b) + a * Math.log(x) + b * Math.log(1 - x)); if (x < (a + 1) / (a + b + 2)) { return bt * continuedFraction(x, a, b) / a; } else { return 1 - bt * continuedFraction(1 - x, b, a) / b; } } function continuedFraction(x: number, a: number, b: number) { const maxIterations = 100; const epsilon = 1e-15; let am = 1, bm = 1, az = 1, qab = a + b, qap = a + 1, qam = a - 1, bz = 1 - qab * x / qap; for (let i = 1; i <= maxIterations; i++) { let d = i * (b - i) * x / ((qam + 2 * i) * (a + 2 * i)); let ap = az + d * am; let bp = bz + d * bm; d = -(a + i) * (qab + i) * x / ((a + 2 * i) * (qap + 2 * i)); let app = ap + d * az; let bpp = bp + d * bz; am = ap / bpp; bm = bp / bpp; az = app / bpp; bz = 1; if (Math.abs(az - am) < (epsilon * Math.abs(az))) return az; } return az; } let p = incompleteBeta(x, df / 2, 0.5); return t > 0 ? 1 - 0.5 * p : 0.5 * p; } };

    // --- GAME & EXPLANATION CONTENT ---
    const statsQuestions = [ { id: "2016-01", year: 2016, questionNumber: 1, questionText: "The prices, in thousands of dollars, of 304 homes recently sold in a city are summarized in the histogram below. Based on the histogram, which of the following statements must be true?", answerOptions: [ { text: "The minimum price is $250,000.", isCorrect: false }, { text: "The maximum price is $2,500,000.", isCorrect: false }, { text: "The median price is not greater than $750,000.", isCorrect: true }, { text: "The mean price is between $500,000 and $750,000.", isCorrect: false }, { text: "The upper quartile of the prices is greater than $1,500,000.", isCorrect: false } ] }, { id: "2016-02", year: 2016, questionNumber: 2, questionText: "As part of a study on the relationship between the use of tanning booths and the occurrence of skin cancer, researchers reviewed the medical records of 1,436 people. The table in the console shows the data. Of the people in the study who had skin cancer, what fraction used a tanning booth?", answerOptions: [ { text: "190/265", isCorrect: false }, { text: "190/896", isCorrect: true }, { text: "190/1,436", isCorrect: false }, { text: "265/1,436", isCorrect: false }, { text: "896/1,436", isCorrect: false } ] }, { id: "2016-03", year: 2016, questionNumber: 3, questionText: "A researcher wants to determine whether there is convincing statistical evidence that more than 50 percent of households in a city gave a charitable donation. Let p represent the proportion of all households that gave a donation. Which of the following are appropriate hypotheses?", answerOptions: [ { text: "H₀: p = 0.5 and Hₐ: p > 0.5", isCorrect: true }, { text: "H₀: p = 0.5 and Hₐ: p ≠ 0.5", isCorrect: false }, { text: "H₀: p = 0.5 and Hₐ: p < 0.5", isCorrect: false }, { text: "H₀: p > 0.5 and Hₐ: p ≠ 0.5", isCorrect: false }, { text: "H₀: p > 0.5 and Hₐ: p = 0.5", isCorrect: false } ] } ];
    function getExplanation(type: any, data: any) {
        switch (type) {
            case '1VarStats': return `Calculated one-variable statistics for the list '${data.listName}'.\nx̄: The sample mean.\nSx: The sample standard deviation.`;
            case 'LinReg': return `Calculated the least-squares regression line for Y='${data.yListName}' vs. X='${data.xListName}'.\na: The y-intercept.\nb: The slope.\nr²: The coefficient of determination.`;
            case 'tTest': return `Performed a t-test.\nμ₀: Null hypothesis mean.\nt: The calculated test statistic.\np: The p-value.\ndf: Degrees of freedom.`;
            case 'tInterval': return `Constructed a t-confidence interval.\n(${data.lower.toFixed(4)}, ${data.upper.toFixed(4)}): The interval.\nME: Margin of Error.\nx̄: The sample mean.\ndf: Degrees of freedom.`;
            default: return 'A statistical calculation was performed.';
        }
    }

    // --- SPREADSHEET LOGIC ---
    function getColumnByName(name: any) { return appState.spreadsheet.columns.find((c: any) => c.name === name); }
    function getColumnData(name: any) { const col = getColumnByName(name); return col ? col.data.map((v: any) => parseFloat(v)).filter((v: any) => !isNaN(v)) : []; }
    function addDataColumn(name: any, data: any = [], formula = '') { const existing = getColumnByName(name); if (existing) { existing.data = data; existing.formula = formula; } else { appState.spreadsheet.columns.push({ name, data, formula }); } }
    function getNextAvailableColumnIndex() { return appState.spreadsheet.columns.length; }

    // --- RENDERING & MODALS ---
    function renderSpreadsheet() {
      if (!spreadsheetContainer) return;
        const { columns, activeCell, isEditing, editValue, selectionStart, selectionEnd } = appState.spreadsheet;
        let tableHTML = `<div class="spreadsheet-container"><table class="spreadsheet-table">`;
        tableHTML += '<thead><tr><th class="row-header"></th>';
        const numCols = Math.max(columns.length + 2, 10);
        for (let i = 0; i < numCols; i++) {
            const col = columns[i];
            let colName = col ? col.name : String.fromCharCode(65 + i);
            if (col && col.formula) colName = `=${col.formula}`;
            let headerClasses = 'col-header';
            if (selectionStart && selectionEnd && i >= Math.min(selectionStart.col, selectionEnd.col) && i <= Math.max(selectionStart.col, selectionEnd.col) && selectionStart.row === -1) {
                headerClasses += ' in-selection';
            }
            tableHTML += `<th class="${headerClasses}" data-col="${i}" data-row="-1" draggable="true">${isEditing && activeCell.col === i && activeCell.row === -1 ? `<input type="text" value="${editValue}" onblur="window.finishEditing(this.value)" onkeydown="window.handleEditKey(event, this.value)" />` : colName}</th>`;
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
                tableHTML += `<td class="${cellClasses}" data-col="${c}" data-row="${r}">${isEditing && activeCell.col === c && activeCell.row === r ? `<input type="text" value="${editValue}" onblur="window.finishEditing(this.value)" onkeydown="window.handleEditKey(event, this.value)" />` : cellValue}</td>`;
            }
            tableHTML += '</tr>';
        }
        tableHTML += '</tbody></table></div>';
        spreadsheetContainer.innerHTML = tableHTML;
        if(isEditing) { const input = spreadsheetContainer.querySelector('input'); if(input) { input.focus(); input.select(); } }
    }
    function addHistoryEntry(entry: any) { appState.calculator.history.unshift({ ...entry, explanation: getExplanation(entry.type, entry.data) }); renderCalculator(); }
    function renderCalculator() {
        if (!calculatorDisplay) return;
        let historyHTML = '<div class="calculator-display">';
        appState.calculator.history.forEach((entry: any) => {
            historyHTML += `<div class="calc-entry">
                <div class="calc-input">&gt; ${entry.input}</div>
                <div class="calc-output">${entry.output}</div>
                ${entry.explanation ? `<div class="calc-explanation">${entry.explanation}</div>` : ''}
            </div>`;
        });
        historyHTML += '</div>';
        calculatorDisplay.innerHTML = historyHTML;
    }
    function closeModal() {
      appState.modal = null;
      const backdrop = document.querySelector('.modal-backdrop');
      const modal = document.querySelector('.modal');
      if (backdrop) backdrop.remove();
      if (modal) modal.remove();
    }
    (window as any).closeModal = closeModal;

    function renderModal(modalConfig: any) {
        closeModal();
        const { title, fields, buttons, requiresData = true } = modalConfig;
        const colNames = appState.spreadsheet.columns.map((c: any) => c.name).filter(Boolean);
        if (requiresData && colNames.length === 0) { showMessageModal('Spreadsheet is empty. Add data to a named column first.'); return; }
        let modalHTML = `<div class="modal" role="dialog"><div class="modal-title">${title}</div>`;
        fields.forEach((field: any) => {
            modalHTML += `<div class="modal-field">`;
            if (field.type !== 'static') modalHTML += `<label for="${field.id}">${field.label}</label>`;
            if (field.type === 'select') {
                modalHTML += `<select id="${field.id}">`;
                (field.options || colNames).forEach((opt: any) => { modalHTML += `<option value="${opt}">${opt}</option>`; });
                modalHTML += `</select>`;
            } else if (field.type === 'static') {
                modalHTML += `<span class="col-span-2">${field.label}</span>`;
            } else {
                modalHTML += `<input type="${field.type || 'text'}" id="${field.id}" value="${field.value || ''}">`;
            }
            modalHTML += `</div>`;
        });
        modalHTML += `<div class="modal-buttons">`;
        buttons.forEach((btn: any) => { modalHTML += `<button class="btn ${btn.class || ''}" data-action="${btn.action}">${btn.label}</button>`; });
        modalHTML += `</div></div>`;

        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';
        backdrop.onclick = closeModal;
        document.body.insertAdjacentElement('afterbegin', backdrop);
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        appState.modal = document.querySelector('.modal');
    }
    function showMessageModal(message: any) { renderModal({ title: 'Info', fields: [{ type: 'static', label: message }], buttons: [ { label: 'OK', action: 'closeModal', class:'btn-primary' } ], requiresData: false }); }

    // --- GRAPHING LOGIC ---
    const plotlyLayout = { paper_bgcolor: 'transparent', plot_bgcolor: 'transparent', font: { color: 'hsl(var(--foreground))', size: 12, family: 'Inter, sans-serif' }, title: { font: { size: 16 } }, xaxis: { gridcolor: 'hsl(var(--border))', zerolinecolor: 'hsl(var(--muted))', titlefont: { size: 14 } }, yaxis: { gridcolor: 'hsl(var(--border))', zerolinecolor: 'hsl(var(--muted))', titlefont: { size: 14 } }, margin: { l: 60, r: 40, b: 50, t: 80 }, showlegend: false };
    function plotDefault() { if(graphPlotDiv) graphPlotDiv.innerHTML = `<div class="flex items-center justify-center h-full text-muted-foreground">Drop columns here to plot data</div>`; }
    function plotHistogram(colIndex: any) { const col = appState.spreadsheet.columns[colIndex]; const data = getColumnData(col.name); const trace = { x: data, type: 'histogram', marker: { color: 'hsl(var(--primary))' } }; const layout = { ...plotlyLayout, title: `Histogram of ${col.name}`, yaxis: { ...plotlyLayout.yaxis, title: 'Frequency'}}; (window as any).Plotly.newPlot(graphPlotDiv, [trace], layout, {responsive: true}); }
    function plotBoxPlot(colIndex: any) { const col = appState.spreadsheet.columns[colIndex]; const data = getColumnData(col.name); if(data.length === 0) { showMessageModal("Cannot create box plot. The selected column has no numerical data."); return; } const fiveNumSum = { min: Math.min(...data), q1: stats.quartile(data, 0.25), med: stats.median(data), q3: stats.quartile(data, 0.75), max: Math.max(...data) }; const trace = { y: data, type: 'box', marker: { color: 'hsl(var(--primary))' }, name: col.name, boxpoints: false }; const layout = { ...plotlyLayout, title: `<b>Box Plot of ${col.name}</b><br><span style="font-size:12px">Min: ${fiveNumSum.min}, Q1: ${fiveNumSum.q1}, Med: ${fiveNumSum.med}, Q3: ${fiveNumSum.q3}, Max: ${fiveNumSum.max}</span>` }; (window as any).Plotly.newPlot(graphPlotDiv, [trace], layout, {responsive: true}); }
    function plotScatter(colIndex1: any, colIndex2: any) {
        const col1 = appState.spreadsheet.columns[colIndex1]; const col2 = appState.spreadsheet.columns[colIndex2];
        const xData = getColumnData(col1.name); const yData = getColumnData(col2.name);
        if (xData.length < 2 || yData.length < 2 || xData.length !== yData.length) { showMessageModal("Cannot create scatter plot. X and Y lists must have the same number of numerical data points (at least 2)."); return; }
        const n = xData.length; const sumX = stats.sum(xData); const sumY = stats.sum(yData); const sumXY = stats.sum(xData.map((x: number, i: number) => x * yData[i])); const sumX2 = stats.sum(xData.map((x: number) => x * x)); const b = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX); const a = (sumY / n) - b * (sumX / n); const rNumerator = (n * sumXY - sumX * sumY); const rDenominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * stats.sum(yData.map((y: number) => y * y)) - sumY * sumY)); const r = rDenominator === 0 ? 0 : rNumerator / rDenominator;
        const xRange = [Math.min(...xData), Math.max(...xData)]; const yRange = xRange.map(x => a + b * x);
        const scatterTrace = { x: xData, y: yData, mode: 'markers', type: 'scatter', name: 'Data', marker: { color: 'hsl(var(--primary))', size: 8 } };
        const lineTrace = { x: xRange, y: yRange, mode: 'lines', type: 'scatter', name: 'Fit', line: { color: 'hsl(var(--destructive))', width: 2 } };
        const layout = { ...plotlyLayout, title: `<b>${col1.name} vs. ${col2.name}</b><br><span style="font-size:12px">ŷ = ${a.toFixed(3)} + ${b.toFixed(3)}x | r²=${(r*r).toFixed(3)}</span>`, xaxis: {...plotlyLayout.xaxis, title: col1.name }, yaxis: {...plotlyLayout.yaxis, title: col2.name }};
        (window as any).Plotly.newPlot(graphPlotDiv, [scatterTrace, lineTrace], layout, {responsive: true});
    }
    function showPlotTypeMenu(colIndices: any) {
        appState.graphing.pendingPlot = { indices: colIndices };
        let subtitle = ''; let optionsHTML = '';
        if (colIndices.length === 1) {
            const colName = appState.spreadsheet.columns[colIndices[0]].name;
            subtitle = `1 Variable Selected: <strong>${colName}</strong>`;
            optionsHTML = `<button class="btn" data-plottype="histogram">Histogram</button><button class="btn" data-plottype="boxplot">Box Plot</button>`;
        } else if (colIndices.length === 2) {
            const name1 = appState.spreadsheet.columns[colIndices[0]].name;
            const name2 = appState.spreadsheet.columns[colIndices[1]].name;
            subtitle = `2 Variables Selected: <strong>${name1}</strong> & <strong>${name2}</strong>`;
            optionsHTML = `<button class="btn btn-primary" data-plottype="scatter">Scatter Plot</button>`;
        } else { plotDefault(); showMessageModal("Please drag one or two columns to plot."); return; }
        graphContextMenu!.innerHTML = `<div class="context-menu-title">Choose Plot Type</div><div class="context-menu-subtitle">${subtitle}</div><div class="context-menu-options">${optionsHTML}</div><button class="btn mt-4" data-plottype="cancel">Cancel</button>`;
        graphContextMenu!.classList.remove('hidden');
    }

    // --- ACTIONS & EVENT HANDLERS ---
    const actions: any = {
        show1VarStatsModal: () => renderModal({ title: 'One-Variable Statistics', fields: [{ id: 'x1list', label: 'X1 List', type: 'select' }], buttons: [{ label: 'OK', action: 'run1VarStats', class: 'btn-primary' }, { label: 'Cancel', action: 'closeModal' }] }),
        run1VarStats: () => { const listName = (document.getElementById('x1list') as HTMLInputElement).value; const data = getColumnData(listName); if (data.length === 0) { showMessageModal('Selected list is empty.'); return; } const results = { 'Title': 'One-Var Stats', 'x̄': stats.mean(data).toFixed(4), 'Σx': stats.sum(data).toFixed(4), 'Σx²': stats.sum(data.map((x: number) => x*x)).toFixed(4), 'Sx': stats.stddev(data, false).toFixed(4), 'σx': stats.stddev(data, true).toFixed(4), 'n': data.length, 'MinX': Math.min(...data), 'Q₁X': stats.quartile(data, 0.25), 'MedianX': stats.median(data), 'Q₃X': stats.quartile(data, 0.75), 'MaxX': Math.max(...data) }; const resultColIndex = getNextAvailableColumnIndex(); addDataColumn(String.fromCharCode(65 + resultColIndex), Object.keys(results)); addDataColumn(String.fromCharCode(65 + resultColIndex + 1), Object.values(results), `OneVar(${listName})`); renderSpreadsheet(); closeModal(); addHistoryEntry({type: '1VarStats', input: `1-Var Stats for ${listName}`, output: `Mean (x̄) = ${results['x̄']}`, data: {results, listName}}); },
        showLinRegModal: () => renderModal({ title: 'Linear Regression (a+bx)', fields: [{ id: 'xlist', label: 'X List', type: 'select' }, { id: 'ylist', label: 'Y List', type: 'select' }], buttons: [{ label: 'OK', action: 'runLinReg', class: 'btn-primary' }, { label: 'Cancel', action: 'closeModal' }] }),
        runLinReg: () => { const xListName = (document.getElementById('xlist') as HTMLInputElement).value; const yListName = (document.getElementById('ylist')as HTMLInputElement).value; const xData = getColumnData(xListName); const yData = getColumnData(yListName); if (xData.length < 2 || yData.length < 2 || xData.length !== yData.length) { showMessageModal('X and Y lists must have the same number of numerical data points (at least 2).'); return; } const n = xData.length; const sumX = stats.sum(xData); const sumY = stats.sum(yData); const sumXY = stats.sum(xData.map((x: number, i: number) => x * yData[i])); const sumX2 = stats.sum(xData.map((x: number) => x * x)); const sumY2 = stats.sum(yData.map((y: number) => y * y)); const b = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX); const a = (sumY / n) - b * (sumX / n); const rNumerator = (n * sumXY - sumX * sumY); const rDenominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)); const r = rDenominator === 0 ? 0 : rNumerator / rDenominator; const residuals = xData.map((x: number, i: number) => yData[i] - (a + b * x)); const results = { a: a.toFixed(4), b: b.toFixed(4), 'r²': (r*r).toFixed(4), r: r.toFixed(4) }; addDataColumn('statresid', residuals.map(r => r.toFixed(4)), `Resid(${xListName},${yListName})`); renderSpreadsheet(); closeModal(); addHistoryEntry({type: 'LinReg', input: `LinReg for ${yListName} vs ${xListName}`, output: `y = ${results.a} + ${results.b}x\nr² = ${results['r²']}`, data: {results, xListName, yListName}}); },
        showNormalCdfModal: () => renderModal({ title: 'Normal Cdf', fields: [ { id: 'lower', label: 'Lower Bound', value: '-1E99' }, { id: 'upper', label: 'Upper Bound', value: '1E99' }, { id: 'mu', label: 'μ', value: '0' }, { id: 'sigma', label: 'σ', value: '1' } ], buttons: [ { label: 'OK', action: 'runNormalCdf', class:'btn-primary' }, { label: 'Cancel', action: 'closeModal' } ], requiresData: false }),
        runNormalCdf: () => { const params = ['lower','upper','mu','sigma'].map(id => parseFloat((document.getElementById(id) as HTMLInputElement).value)); if (params.some(isNaN)) { showMessageModal("Invalid input."); return; } const result = stats.normalCdf(...params); addHistoryEntry({type: 'NormalCdf', input: `normCdf(${params.join(',')})`, output: result.toFixed(6), data: {params, result}}); closeModal(); },
        showInvNormModal: () => renderModal({ title: 'Inverse Normal', fields: [ { id: 'area', label: 'Area' }, { id: 'mu', label: 'μ', value: '0' }, { id: 'sigma', label: 'σ', value: '1' } ], buttons: [ { label: 'OK', action: 'runInvNorm', class:'btn-primary' }, { label: 'Cancel', action: 'closeModal' } ], requiresData: false }),
        runInvNorm: () => { const params = ['area','mu','sigma'].map(id => parseFloat((document.getElementById(id) as HTMLInputElement).value)); if (params.some(isNaN)) { showMessageModal("Invalid input."); return; } const result = stats.invNorm(...params); addHistoryEntry({type: 'InvNorm', input: `invNorm(${params.join(',')})`, output: result.toFixed(6), data: {params, result}}); closeModal(); },
        showBinomPdfModal: () => renderModal({ title: 'Binomial Pdf', fields: [ { id: 'n', label: 'Num Trials, n' }, { id: 'p', label: 'Prob Success, p' }, { id: 'x', label: 'X Value' } ], buttons: [ { label: 'OK', action: 'runBinomPdf', class:'btn-primary' }, { label: 'Cancel', action: 'closeModal' } ], requiresData: false }),
        runBinomPdf: () => { const n = parseInt((document.getElementById('n') as HTMLInputElement).value); const p = parseFloat((document.getElementById('p') as HTMLInputElement).value); const x = parseInt((document.getElementById('x') as HTMLInputElement).value); const result = stats.binomialPdf(n, p, x); addHistoryEntry({type: 'BinomPdf', input: `binomPdf(${n},${p},${x})`, output: result.toFixed(6), data: {n, p, x, result}}); closeModal(); },
        showBinomCdfModal: () => renderModal({ title: 'Binomial Cdf', fields: [ { id: 'n', label: 'Num Trials, n' }, { id: 'p', label: 'Prob Success, p' }, { id: 'x', label: 'Upper Bound, x' } ], buttons: [ { label: 'OK', action: 'runBinomCdf', class:'btn-primary' }, { label: 'Cancel', action: 'closeModal' } ], requiresData: false }),
        runBinomCdf: () => { const n = parseInt((document.getElementById('n') as HTMLInputElement).value); const p = parseFloat((document.getElementById('p') as HTMLInputElement).value); const x = parseInt((document.getElementById('x') as HTMLInputElement).value); let totalProb = 0; for (let i = 0; i <= x; i++) { totalProb += stats.binomialPdf(n, p, i); } addHistoryEntry({type: 'BinomCdf', input: `binomCdf(${n},${p},${x})`, output: totalProb.toFixed(6), data: {n, p, x, result: totalProb}}); closeModal(); },
        showTIntervalModalChooser: () => renderModal({ title: 't-Interval', fields: [ { id: 'inputMethod', label: 'Input Method', type: 'select', options: ['Data', 'Stats'] } ], buttons: [ { label: 'OK', action: 'chooseTIntervalModal', class:'btn-primary' }, { label: 'Cancel', action: 'closeModal' } ], requiresData: false }),
        chooseTIntervalModal: () => { const method = (document.getElementById('inputMethod') as HTMLInputElement).value; if (method === 'Stats') actions.showTIntervalStatsModal(); else actions.showTIntervalDataModal(); },
        showTIntervalStatsModal: () => renderModal({ title: 't-Interval (Stats)', fields: [ { id: 'mean', label: 'x̄', type:'number' }, { id: 'sx', label: 'Sx', type:'number' }, { id: 'n', label: 'n', type:'number' }, { id: 'clevel', label: 'C-Level', type:'number', value: '0.95' } ], buttons: [ { label: 'OK', action: 'runTIntervalFromStats', class:'btn-primary' }, { label: 'Cancel', action: 'closeModal' } ], requiresData: false }),
        showTIntervalDataModal: () => renderModal({ title: 't-Interval (Data)', fields: [ { id: 'list', label: 'List', type: 'select' }, { id: 'clevel', label: 'C-Level', type:'number', value: '0.95' } ], buttons: [ { label: 'OK', action: 'runTIntervalFromData', class:'btn-primary' }, { label: 'Cancel', action: 'closeModal' } ] }),
        runTIntervalFromStats: () => { const mean = parseFloat((document.getElementById('mean') as HTMLInputElement).value); const sx = parseFloat((document.getElementById('sx') as HTMLInputElement).value); const n = parseInt((document.getElementById('n') as HTMLInputElement).value); const cLevel = parseFloat((document.getElementById('clevel') as HTMLInputElement).value); actions.runTInterval(mean, sx, n, cLevel); },
        runTIntervalFromData: () => { const listName = (document.getElementById('list') as HTMLInputElement).value; const cLevel = parseFloat((document.getElementById('clevel') as HTMLInputElement).value); const data = getColumnData(listName); if (data.length < 2) { showMessageModal("List must have >= 2 numbers."); return; } const mean = stats.mean(data); const sx = stats.stddev(data); const n = data.length; actions.runTInterval(mean, sx, n, cLevel); },
        runTInterval(mean: number, sx: number, n: number, cLevel: number) { if ([mean,sx,n,cLevel].some(isNaN)) { showMessageModal("Invalid input."); return; } const df = n - 1; const alpha = 1 - cLevel; const tStar = stats.invT(1 - alpha / 2, df); const me = tStar * (sx / Math.sqrt(n)); const lower = mean - me; const upper = mean + me; addHistoryEntry({type: 'tInterval', input: `tInterval(${cLevel*100}%)`, output: `(${lower.toFixed(4)}, ${upper.toFixed(4)})`, data: {lower, upper, me, df, mean, sx, n}}); closeModal(); },
        showTTestModalChooser: () => renderModal({ title: 't-Test', fields: [ { id: 'inputMethod', label: 'Input Method', type: 'select', options: ['Data', 'Stats'] } ], buttons: [ { label: 'OK', action: 'chooseTTestModal', class:'btn-primary' }, { label: 'Cancel', action: 'closeModal' } ], requiresData: false }),
        chooseTTestModal: () => { const method = (document.getElementById('inputMethod') as HTMLInputElement).value; if (method === 'Stats') actions.showTTestStatsModal(); else actions.showTTestDataModal(); },
        showTTestStatsModal: () => renderModal({ title: 't-Test (Stats)', fields: [ { id: 'mu0', label: 'μ₀', type:'number' }, { id: 'mean', label: 'x̄', type:'number' }, { id: 'sx', label: 'Sx', type:'number' }, { id: 'n', label: 'n', type:'number' }, { id: 'alt', label: 'Alternate Hyp', type: 'select', options: ['μ ≠ μ₀', 'μ < μ₀', 'μ > μ₀'] } ], buttons: [ { label: 'OK', action: 'runTTestFromStats', class:'btn-primary' }, { label: 'Cancel', action: 'closeModal' } ], requiresData: false }),
        showTTestDataModal: () => renderModal({ title: 't-Test (Data)', fields: [ { id: 'mu0', label: 'μ₀', type:'number' }, { id: 'list', label: 'List', type: 'select' }, { id: 'alt', label: 'Alternate Hyp', type: 'select', options: ['μ ≠ μ₀', 'μ < μ₀', 'μ > μ₀'] } ], buttons: [ { label: 'OK', action: 'runTTestFromData', class:'btn-primary' }, { label: 'Cancel', action: 'closeModal' } ] }),
        runTTestFromStats: () => { const mu0 = parseFloat((document.getElementById('mu0') as HTMLInputElement).value); const mean = parseFloat((document.getElementById('mean') as HTMLInputElement).value); const sx = parseFloat((document.getElementById('sx') as HTMLInputElement).value); const n = parseInt((document.getElementById('n') as HTMLInputElement).value); const alt = (document.getElementById('alt') as HTMLInputElement).value; actions.runTTest(mu0, mean, sx, n, alt); },
        runTTestFromData: () => { const mu0 = parseFloat((document.getElementById('mu0') as HTMLInputElement).value); const listName = (document.getElementById('list') as HTMLInputElement).value; const alt = (document.getElementById('alt') as HTMLInputElement).value; const data = getColumnData(listName); if (data.length < 2) { showMessageModal("List must have >= 2 numbers."); return; } const mean = stats.mean(data); const sx = stats.stddev(data); const n = data.length; actions.runTTest(mu0, mean, sx, n, alt); },
        runTTest(mu0: number, mean: number, sx: number, n: number, alt: any) { if ([mu0,mean,sx,n].some(isNaN)) { showMessageModal("Invalid input."); return; } const df = n - 1; const tStat = (mean - mu0) / (sx / Math.sqrt(n)); let pVal; if (alt === 'μ < μ₀') pVal = stats.tCdf(tStat, df); else if (alt === 'μ > μ₀') pVal = 1 - stats.tCdf(tStat, df); else pVal = 2 * (1 - stats.tCdf(Math.abs(tStat), df)); addHistoryEntry({type: 'tTest', input: `t-Test(μ${alt.slice(1)})`, output: `t=${tStat.toFixed(4)}\np=${pVal.toFixed(4)}`, data: {tStat, pVal, df, mu0, mean, sx, n}}); closeModal(); },
        showClearConfirmModal: () => renderModal({ title: 'Confirm Clear', fields: [{ type: 'static', label: 'Clear all spreadsheet data?' }], buttons: [ { label: 'OK', action: 'clearSpreadsheet', class:'btn-primary' }, { label: 'Cancel', action: 'closeModal' } ], requiresData: false }),
        clearSpreadsheet: () => { appState.spreadsheet.columns = []; appState.spreadsheet.activeCell = { col: 0, row: 0 }; appState.spreadsheet.selectionStart = null; appState.spreadsheet.selectionEnd = null; appState.spreadsheet.isDataLoaded = false; renderSpreadsheet(); closeModal(); plotDefault(); },
        closeModal
    };
    (window as any).actions = actions;

    function showStatisticsMenu() {
        closeModal();
        const menuItems = [
            { label: 'One-Variable Stats', action: 'show1VarStatsModal' }, { label: 'LinReg (a+bx)', action: 'showLinRegModal' },
            { label: 't-Test...', action: 'showTTestModalChooser' }, { label: 't-Interval...', action: 'showTIntervalModalChooser' },
            { label: 'Normal Cdf', action: 'showNormalCdfModal' }, { label: 'Inverse Normal', action: 'showInvNormModal' },
            { label: 'Binomial Pdf', action: 'showBinomPdfModal' }, { label: 'Binomial Cdf', action: 'showBinomCdfModal' },
        ];
        let modalHTML = `<div class="modal" id="stats-menu"><div class="modal-title">Stats Menu</div>
            <div class="grid grid-cols-2 gap-3 my-4">`;
        menuItems.forEach(item => { modalHTML += `<button class="btn" data-action="${item.action}">${item.label}</button>`; });
        modalHTML += `</div><div class="modal-buttons"><button class="btn btn-primary" data-action="closeModal">Close</button></div></div>`;
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';
        backdrop.onclick = closeModal;
        document.body.insertAdjacentElement('afterbegin', backdrop);
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        appState.modal = document.getElementById('stats-menu');
    }
    function handleAction(event: any) { const target = event.target.closest('[data-action]'); if (target) { const actionName = target.dataset.action; if (actionName && actions[actionName]) { actions[actionName](event); } } }
    function handleEditKey(event: any, value: any) { if (event.key === 'Enter') { event.preventDefault(); finishEditing(value, true); } else if (event.key === 'Escape') { appState.spreadsheet.isEditing = false; renderSpreadsheet(); } }
    (window as any).handleEditKey = handleEditKey;

    function finishEditing(value: any, fromEnter = false) { if (!appState.spreadsheet.isEditing) return; const { col, row } = appState.spreadsheet.activeCell; const ss = appState.spreadsheet; if (row === -1) { if (!ss.columns[col]) addDataColumn(value, []); else ss.columns[col].name = value; } else { if (!ss.columns[col]) addDataColumn(String.fromCharCode(65 + col), []); const numValue = parseFloat(value); ss.columns[col].data[row] = isNaN(numValue) ? value : numValue; } ss.isEditing = false; ss.editValue = ''; if (fromEnter && ss.activeCell.row < 199) { ss.activeCell.row++; } renderSpreadsheet(); }
    (window as any).finishEditing = finishEditing;

    function handleCalculatorInput() {
        const expression = (calculatorInput as HTMLInputElement).value.trim();
        if (expression === '') return;
        let commandHandled = false;
        if (appState.game.isActive) { commandHandled = handleGameAnswer(expression); }
        if (commandHandled) { /* Handled by game logic */ }
        else if (expression === "df = pd.read_csv('lab_data_1.csv')") {
            actions.clearSpreadsheet();
            const studyHours = [1, 1.5, 1.8, 2, 2.5, 3, 3.2, 3.8, 4, 4.5, 5, 5.5, 6];
            const examScores = [65, 68, 70, 75, 72, 80, 85, 88, 85, 92, 95, 98, 94];
            addDataColumn('hours', studyHours);
            addDataColumn('score', examScores);
            renderSpreadsheet(); appState.spreadsheet.isDataLoaded = true;
            addHistoryEntry({ input: expression, output: "Success: Sample data loaded." });
            commandHandled = true;
        } else if (expression === 'df.head()') {
            if (appState.spreadsheet.isDataLoaded) {
                renderDataFrameHead();
                addHistoryEntry({ input: expression, output: "DataFrame head displayed in Viewer." });
            } else { addHistoryEntry({ input: expression, output: "Error: name 'df' is not defined." }); }
            commandHandled = true;
        }
        if (!commandHandled) {
            try {
                const result = (window as any).math.evaluate(expression);
                addHistoryEntry({ input: expression, output: (window as any).math.format(result, { precision: 14 }) });
            } catch (err: any) { addHistoryEntry({ input: expression, output: `Error: ${err.message}` }); }
        }
        (calculatorInput as HTMLInputElement).value = '';
    }
    function handlePaste(e: any) { e.preventDefault(); const pastedText = e.clipboardData.getData('text/plain'); const rows = pastedText.split(/\r?\n/).filter((row: any) => row.trim() !== ''); const data = rows.map((row: any) => row.split('\t')); const { col: startCol, row: startRow } = appState.spreadsheet.activeCell; data.forEach((rowData: any, r: number) => { rowData.forEach((cellData: any, c: number) => { const targetRow = startRow + r; const targetCol = startCol + c; if (targetRow < 200) { if (targetCol >= appState.spreadsheet.columns.length) { addDataColumn(String.fromCharCode(65 + appState.spreadsheet.columns.length)); } onCellChange(targetCol, targetRow, cellData); } }); }); renderSpreadsheet(); }
    function onCellChange(col: any, row: any, value: any) { const numValue = parseFloat(value); appState.spreadsheet.columns[col].data[row] = isNaN(numValue) ? value : numValue; }

    // --- GAME MODE LOGIC ---
    function toggleGameMode() { appState.game.isActive = !appState.game.isActive; if (appState.game.isActive) { startGame(); } else { stopGame(); } }
    function startGame() { appState.game = { ...appState.game, isActive: true, startTime: Date.now(), questionsAnswered: 0, correctAnswers: 0 }; gameTimer!.classList.remove('hidden'); appState.game.timerInterval = setInterval(updateGameTimer, 1000); nextQuestion(); }
    function stopGame() { if (appState.game.timerInterval) clearInterval(appState.game.timerInterval); appState.game.isActive = false; gameDisplay!.classList.add('hidden'); gameTimer!.classList.add('hidden'); }
    function endGame() { const { correctAnswers } = appState.game; const scoreMessage = `Game Over! You scored ${correctAnswers} out of 5.`; addHistoryEntry({ input: "Game Finished", output: scoreMessage }); stopGame(); }
    function updateGameTimer() { const elapsed = Math.floor((Date.now() - appState.game.startTime) / 1000); const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0'); const seconds = (elapsed % 60).toString().padStart(2, '0'); gameTimer!.textContent = `${minutes}:${seconds}`; }
    function nextQuestion() { const question = statsQuestions[Math.floor(Math.random() * statsQuestions.length)]; appState.game.question = question; let questionHTML = `<p class="font-bold mb-2">Question ${appState.game.questionsAnswered + 1} of 5:</p><p>${question.questionText}</p><div class="grid grid-cols-2 gap-2 mt-4">`; question.answerOptions.forEach((opt, i) => { questionHTML += `<button class="btn text-left" data-action="answerQuestion" data-index="${i}">${String.fromCharCode(65 + i)}) ${opt.text}</button>`; }); questionHTML += `</div>`; gameDisplay!.innerHTML = questionHTML; gameDisplay!.classList.remove('hidden'); }
    function handleGameAnswer(answerIndex: any) { const { question } = appState.game; const selectedOption = question.answerOptions[answerIndex]; if (selectedOption.isCorrect) { appState.game.correctAnswers++; addHistoryEntry({ input: `Answer for Q${appState.game.questionsAnswered + 1}`, output: 'Correct!' }); } else { addHistoryEntry({ input: `Answer for Q${appState.game.questionsAnswered + 1}`, output: 'Incorrect.' }); } appState.game.questionsAnswered++; if (appState.game.questionsAnswered >= 5) { endGame(); } else { nextQuestion(); } return true; }
    actions.answerQuestion = (event: any) => { const index = event.target.dataset.index; handleGameAnswer(index); };

    // --- OTHER UTILS ---
    function renderDataFrameHead() { let tableHTML = '<div class="dataframe-table"><thead><tr>'; appState.spreadsheet.columns.forEach((col: any) => { if(col.name && !col.name.match(/^[A-Z]$/)) tableHTML += `<th>${col.name}</th>`; }); tableHTML += '</tr></thead><tbody>'; for (let i = 0; i < 5; i++) { tableHTML += '<tr>'; appState.spreadsheet.columns.forEach((col: any) => { if(col.name && !col.name.match(/^[A-Z]$/)) tableHTML += `<td>${col.data[i] || ''}</td>`; }); tableHTML += '</tr>'; } tableHTML += '</tbody></table>'; graphPlotDiv!.innerHTML = tableHTML; }
    function copyCode(element: any) { navigator.clipboard.writeText(element.textContent); element.textContent = 'Copied!'; setTimeout(() => { element.textContent = "df = pd.read_csv('lab_data_1.csv')"; }, 1000); }
    (window as any).copyCode = copyCode;

    // --- INITIALIZATION ---
    function init() {
      if (!menuBtn) return;
        // Event Listeners
        menuBtn.addEventListener('click', showStatisticsMenu);
        clearBtn!.addEventListener('click', actions.showClearConfirmModal);
        document.body.addEventListener('click', handleAction);
        spreadsheetContainer!.addEventListener('mousedown', (e) => { if (!(e.target as HTMLElement).matches('td, th[data-col]')) return; const col = parseInt((e.target as HTMLElement).dataset.col!); const row = parseInt((e.target as HTMLElement).dataset.row!); if (isNaN(col) || isNaN(row)) return; appState.spreadsheet.isEditing = false; appState.spreadsheet.activeCell = { col, row }; appState.spreadsheet.isSelecting = true; appState.spreadsheet.selectionStart = { col, row }; appState.spreadsheet.selectionEnd = { col, row }; renderSpreadsheet(); });
        spreadsheetContainer!.addEventListener('mousemove', (e) => { if (!appState.spreadsheet.isSelecting || !(e.target as HTMLElement).matches('td, th[data-col]')) return; const col = parseInt((e.target as HTMLElement).dataset.col!); const row = parseInt((e.target as HTMLElement).dataset.row!); if (isNaN(col) || isNaN(row)) return; if (appState.spreadsheet.selectionEnd.col !== col || appState.spreadsheet.selectionEnd.row !== row) { appState.spreadsheet.selectionEnd = { col, row }; renderSpreadsheet(); } });
        document.addEventListener('mouseup', () => { appState.spreadsheet.isSelecting = false; });
        spreadsheetContainer!.addEventListener('dblclick', (e) => { if((e.target as HTMLElement).matches('td, th[data-col]')) { const { col, row } = appState.spreadsheet.activeCell; const val = row === -1 ? (appState.spreadsheet.columns[col]?.name || '') : (appState.spreadsheet.columns[col]?.data[row] || ''); appState.spreadsheet.isEditing = true; appState.spreadsheet.editValue = val; renderSpreadsheet(); } });
        spreadsheetContainer!.addEventListener('paste', handlePaste);
        calculatorInput!.addEventListener('keydown', (e) => { if(e.key === 'Enter') handleCalculatorInput(); });
        calculatorEnterBtn!.addEventListener('click', handleCalculatorInput);
        gameModeBtn!.addEventListener('click', toggleGameMode);
        spreadsheetContainer!.addEventListener('dragstart', (e: DragEvent) => { if (!(e.target as HTMLElement).matches('th.col-header.in-selection')) { e.preventDefault(); return; } const { selectionStart, selectionEnd } = appState.spreadsheet; const minCol = Math.min(selectionStart!.col, selectionEnd!.col); const maxCol = Math.max(selectionEnd!.col, selectionStart!.col); let colIndices: number[] = []; for (let i = minCol; i <= maxCol; i++) { if(appState.spreadsheet.columns[i]?.name) colIndices.push(i); } if (colIndices.length === 0 || colIndices.length > 2) { showMessageModal("Drag one or two NAMED columns to plot."); e.preventDefault(); return; } e.dataTransfer!.setData('application/json', JSON.stringify(colIndices)); e.dataTransfer!.effectAllowed = 'copy'; });
        graphingPanel!.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer!.dropEffect = 'copy'; graphingPanel!.classList.add('drag-over'); });
        graphingPanel!.addEventListener('dragleave', () => { graphingPanel!.classList.remove('drag-over'); });
        graphingPanel!.addEventListener('drop', (e: DragEvent) => { e.preventDefault(); graphingPanel!.classList.remove('drag-over'); const colIndices = JSON.parse(e.dataTransfer!.getData('application/json')); showPlotTypeMenu(colIndices); });
        graphContextMenu!.addEventListener('click', (e) => { if ((e.target as HTMLElement).matches('[data-plottype]')) { const type = (e.target as HTMLElement).dataset.plottype; if (appState.graphing.pendingPlot) { const { indices } = appState.graphing.pendingPlot; if (type === 'histogram') plotHistogram(indices[0]); else if (type === 'boxplot') plotBoxPlot(indices[0]); else if (type === 'scatter') plotScatter(indices[0], indices[1]); } graphContextMenu!.classList.add('hidden'); appState.graphing.pendingPlot = null; } });
        graphContextMenu!.addEventListener('dragover', (e) => { e.preventDefault(); e.stopPropagation(); });
        graphContextMenu!.addEventListener('drop', (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); const newlyDroppedIndices = JSON.parse(e.dataTransfer!.getData('application/json')); const existingIndices = appState.graphing.pendingPlot.indices; const combined = [...new Set([...existingIndices, ...newlyDroppedIndices])]; if (combined.length > 2) { showMessageModal("You can only plot up to two variables."); return; } showPlotTypeMenu(combined); });

        // Initial render
        appState.calculator.history.push({ 
            input: 'Welcome to Wonjae\'s AP Stat Lab!', 
            output: `<span class="text-base">Enter expressions, import data, or use the menu to start.</span>
                     <div class="text-sm text-muted-foreground mt-2">&gt; To import sample data, type or paste: <code class="bg-muted px-1 py-0.5 rounded">df = pd.read_csv('lab_data_1.csv')</code></div>`
        });
        renderCalculator();
        renderSpreadsheet();
        plotDefault();
    }

    init();
  }, []);

  return (
    <>
      <div className="main-grid">
        <div id="importer" className="panel">
            <div className="panel-content flex items-center justify-center">
                <div className="text-center">
                    <div className="flex items-center justify-center">
                        <span className="text-8xl font-bold text-primary" style={{fontFamily: "'Source Code Pro', monospace"}}>1J</span>
                        <h1 className="text-4xl font-semibold ml-4">AP Stat Lab</h1>
                    </div>
                </div>
            </div>
        </div>
        
        <div id="calculator" className="panel">
            <div className="panel-header">
                <h2 className="panel-title">Calculator / Console</h2>
                <div id="game-controls" className="flex items-center gap-2">
                    <span id="game-timer" className="font-mono text-sm bg-background px-2 py-1 rounded-md hidden">00:00</span>
                    <button id="btn-menu" className="btn">Stats Menu</button>
                    <button id="btn-game-mode" className="btn">Game Mode</button>
                </div>
            </div>
            <div id="calculator-content" className="panel-content">
                <div id="game-mode-display" className="hidden"></div>
                <div id="calculator-display" className="flex-grow"></div>
                <div className="flex gap-2 mt-2 flex-shrink-0">
                    <input type="text" id="calculator-input" className="w-full bg-input border border-border rounded-md px-2 py-1" placeholder="Expression or command..."/>
                    <button id="calculator-enter" className="btn btn-primary w-24 justify-center">Enter</button>
                </div>
            </div>
        </div>

        <div id="graphing" className="panel">
            <div className="panel-header">
                <h2 className="panel-title">Viewer</h2>
            </div>
            <div id="graphing-content" className="panel-content !p-2 flex flex-col">
                <div id="graph-plot" className="flex-grow flex items-center justify-center text-muted-foreground min-w-0">Drop columns here to plot data</div>
                <div id="graph-context-menu" className="hidden"></div>
            </div>
        </div>

        <div id="spreadsheet" className="panel">
            <div className="panel-header">
                <h2 className="panel-title">Lists & Spreadsheet</h2>
                <div className="flex items-center gap-4">
                    <button id="btn-clear" className="btn">Clear Sheet</button>
                </div>
            </div>
            <div id="spreadsheet-content" className="panel-content"></div>
        </div>
      </div>
       <style jsx global>{`
        :root {
            --background: 210 40% 98%;
            --foreground: 222.2 84% 4.9%;
            --card: 0 0% 100%;
            --card-foreground: 222.2 84% 4.9%;
            --popover: 0 0% 100%;
            --popover-foreground: 222.2 84% 4.9%;
            --primary: 221.2 83.2% 53.3%;
            --primary-foreground: 210 40% 98%;
            --secondary: 210 40% 96.1%;
            --secondary-foreground: 222.2 47.4% 11.2%;
            --muted: 210 40% 96.1%;
            --muted-foreground: 215.4 16.3% 46.9%;
            --accent: 210 40% 96.1%;
            --accent-foreground: 222.2 47.4% 11.2%;
            --destructive: 0 84.2% 60.2%;
            --destructive-foreground: 210 40% 98%;
            --border: 214.3 31.8% 91.4%;
            --input: 214.3 31.8% 91.4%;
            --ring: 222.2 84% 4.9%;
            --radius: 0.5rem;
        }
        .dark {
            --background: 222.2 84% 4.9%;
            --foreground: 210 40% 98%;
            --card: 222.2 84% 4.9%;
            --card-foreground: 210 40% 98%;
            --popover: 222.2 84% 4.9%;
            --popover-foreground: 210 40% 98%;
            --primary: 217.2 91.2% 59.8%;
            --primary-foreground: 222.2 47.4% 11.2%;
            --secondary: 217.2 32.6% 17.5%;
            --secondary-foreground: 210 40% 98%;
            --muted: 217.2 32.6% 17.5%;
            --muted-foreground: 215 20.2% 65.1%;
            --accent: 217.2 32.6% 17.5%;
            --accent-foreground: 210 40% 98%;
            --destructive: 0 62.8% 30.6%;
            --destructive-foreground: 210 40% 98%;
            --border: 217.2 32.6% 17.5%;
            --input: 217.2 32.6% 17.5%;
            --ring: 212.7 26.8% 83.9%;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            background-color: hsl(var(--background));
            color: hsl(var(--foreground));
            overflow: hidden;
        }
        .main-grid {
            display: grid;
            grid-template-columns: 1fr 1.5fr;
            grid-template-rows: 150px minmax(0, 2fr) minmax(0, 1.5fr);
            gap: 1rem;
            height: 100vh;
            padding: 1rem;
            grid-template-areas:
                "importer importer"
                "calculator graphing"
                "spreadsheet spreadsheet";
        }
        .panel {
            background-color: hsl(var(--card));
            border-radius: 0.75rem;
            border: 1px solid hsl(var(--border));
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .dark .panel {
             box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .panel-header {
            padding: 0.75rem 1rem;
            border-bottom: 1px solid hsl(var(--border));
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-shrink: 0;
        }
        .panel-title {
            font-weight: 600;
            font-size: 1rem;
        }
        .panel-content {
            padding: 1rem;
            height: 100%;
            overflow-y: auto;
            position: relative;
        }
         .panel-content::-webkit-scrollbar { width: 8px; }
        .panel-content::-webkit-scrollbar-track { background: hsl(var(--card)); }
        .panel-content::-webkit-scrollbar-thumb { background-color: hsl(var(--secondary)); border-radius: 4px; }
        .panel-content::-webkit-scrollbar-thumb:hover { background: hsl(var(--muted-foreground)); }
        
        #importer { grid-area: importer; }
        #calculator { grid-area: calculator; }
        #spreadsheet { grid-area: spreadsheet; }
        #graphing { grid-area: graphing; }

        /* Calculator Styles */
        #calculator-content { display: flex; flex-direction: column; font-family: 'Source Code Pro', monospace; }
        #calculator-display { flex-grow: 1; overflow-y: auto; margin-bottom: 0.5rem; }
        .calculator-display { display: flex; flex-direction: column-reverse; }
        .calc-entry { margin-bottom: 1rem; }
        .calc-input { color: hsl(var(--muted-foreground)); word-break: break-all; }
        .calc-output { text-align: right; font-weight: bold; font-size: 1.125rem; color: hsl(var(--foreground)); white-space: pre-wrap; word-break: break-all; }
        .calc-explanation {
            font-family: 'Inter', sans-serif; font-size: 0.8rem; color: hsl(var(--muted-foreground));
            background-color: hsl(var(--accent)); padding: 0.5rem; border-radius: 0.375rem;
            margin-top: 0.5rem; white-space: pre-wrap; border-left: 3px solid hsl(var(--primary));
        }
        #game-mode-display { font-family: 'Inter', sans-serif; padding: 0.75rem; background-color: hsla(var(--primary), 0.1); border: 1px solid hsla(var(--primary), 0.3); border-radius: 0.5rem; margin-bottom: 1rem; }

        /* Spreadsheet Styles */
        #spreadsheet-content { padding: 0; font-family: 'Source Code Pro', monospace; }
        .spreadsheet-container { position: relative; height: 100%; overflow: auto !important; }
        .spreadsheet-table { width: 100%; border-collapse: collapse; font-size: 14px; }
        .spreadsheet-table th, .spreadsheet-table td { border: 1px solid hsl(var(--border)); padding: 4px; text-align: right; min-width: 80px; height: 24px; white-space: nowrap; color: hsl(var(--foreground)); }
        .spreadsheet-table th { background-color: hsl(var(--secondary)); position: sticky; top: 0; z-index: 10; font-weight: 600; }
        .spreadsheet-table .row-header { background-color: hsl(var(--secondary)); text-align: center; position: sticky; left: 0; z-index: 5; }
        .spreadsheet-table td.selected { background-color: hsl(var(--primary)); outline: 2px solid hsl(var(--primary-foreground)); color: hsl(var(--primary-foreground)) !important;}
        .spreadsheet-table th.in-selection { background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); cursor: grab; }
        .spreadsheet-table td.in-selection { background-color: hsla(var(--primary), 0.5); }
        .spreadsheet-table input { background: transparent; border: none; color: inherit; width: 100%; text-align: right; outline: none; font-family: 'Source Code Pro', monospace; }

        /* Graphing Styles */
        #graphing-content {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        #graph-plot { 
          flex-grow: 1; 
          border-radius: 0.5rem; 
          min-height: 0;
          min-width: 0;
        }
        #graph-context-menu {
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background-color: hsla(var(--card), 0.9); backdrop-filter: blur(8px);
            border-radius: 0.75rem; border: 1px solid hsl(var(--border)); padding: 1.5rem; z-index: 100;
            display: flex; flex-direction: column; gap: 1rem; box-shadow: 0 10px 20px rgba(0,0,0,0.1); text-align: center;
        }
        .context-menu-title { font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem; }
        .context-menu-subtitle { font-size: 0.875rem; color: hsl(var(--muted-foreground)); }
        .context-menu-options { display: flex; gap: 1rem; margin-top: 1rem; justify-content: center;}
        #graphing.drag-over { border-color: hsl(var(--primary)); box-shadow: 0 0 15px 0 hsla(var(--primary), 0.5); }

        /* General UI */
        .btn {
            display: inline-flex; items-center; justify-content: center;
            background-color: hsl(var(--secondary)); color: hsl(var(--secondary-foreground)); padding: 0.5rem 1rem; border-radius: 0.375rem;
            font-weight: 500; border: 1px solid hsl(var(--border)); cursor: pointer; transition: all 0.2s; white-space: nowrap;
        }
        .btn:hover { background-color: hsl(var(--accent)); }
        .btn-primary { background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); border-color: hsl(var(--primary)); }
        .btn-primary:hover { background-color: hsla(var(--primary), 0.9); }
        .hidden { display: none !important; }
        .modal-backdrop { position: fixed; inset: 0; background-color: rgba(0,0,0,0.6); z-index: 999; }
        .modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: hsl(var(--card)); color: hsl(var(--foreground)); border: 1px solid hsl(var(--border)); box-shadow: 0 10px 25px rgba(0,0,0,0.1); font-size: 14px; z-index: 1000; padding: 1.25rem; border-radius: 0.5rem; font-family: 'Inter', sans-serif; width: 90%; max-width: 420px; }
        .modal-title { font-weight: 700; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid hsl(var(--border)); font-size: 1.125rem; }
        .modal-field { display: grid; grid-template-columns: 1fr 2fr; align-items: center; margin-bottom: 0.75rem; gap: 1rem; }
        .modal-field label { font-weight: 500; text-align: right; }
        .modal-field select, .modal-field input { background-color: hsl(var(--background)); border: 1px solid hsl(var(--border)); border-radius: 4px; padding: 4px 8px; color: hsl(var(--foreground)); width: 100%; }
        .modal-buttons { margin-top: 1.25rem; text-align: right; display: flex; gap: 0.5rem; justify-content: flex-end; }
        .importer-toggle { display: flex; background-color: hsl(var(--secondary)); border-radius: 0.5rem; padding: 0.25rem; margin-bottom: 1rem; }
        .importer-toggle label { flex: 1; text-align: center; padding: 0.25rem 0.5rem; border-radius: 0.375rem; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; font-size: 0.875rem;}
        .importer-toggle input { display: none; }
        .importer-toggle input:checked + label { background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); font-weight: 600; }
        .code-block { background-color: hsl(var(--secondary)); padding: 0.75rem; border-radius: 0.5rem; color: hsl(var(--foreground)); font-family: 'Source Code Pro', monospace; }
        .dataframe-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; font-family: 'Inter', sans-serif; background-color: hsl(var(--secondary)); border-radius: 0.5rem; overflow: hidden; }
        .dataframe-table th, .dataframe-table td { border: 1px solid hsl(var(--border)); padding: 0.5rem; text-align: left; }
        .dataframe-table th { background-color: hsl(var(--muted)); font-weight: 600; }
       `}</style>
    </>
  );
}
