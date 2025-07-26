
'use client';

import React, { useEffect, useState } from 'react';
import { generateExplanation } from '@/ai/flows/explanation-flow';
import { answerQuestion } from '@/ai/flows/qa-flow';
import type { ExplanationRequest } from '@/ai/schemas';


export default function Home() {
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);


  useEffect(() => {
    if (!isClient) {
      return;
    }
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
    const pivotToggle = document.getElementById('pivot-toggle');
    const exportCalcToggle = document.getElementById('export-calc-toggle');
    const exportGraphToggle = document.getElementById('export-graph-toggle');


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
      game: { isActive: false, startTime: null, timerInterval: null, question: null, questionsAnswered: 0, correctAnswers: 0, isWaitingForAI: false }
    };

    // --- STATISTICAL HELPERS (Full Implementation) ---
    function invNormForT(p: number) { if (p <= 0 || p >= 1) return NaN; const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00]; const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01]; const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00]; const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00]; const p_low = 0.02425; const p_high = 1 - p_low; let q, x; if (p < p_low) { q = Math.sqrt(-2 * Math.log(p)); x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); } else if (p <= p_high) { q = p - 0.5; let r = q * q; x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1); } else { q = Math.sqrt(-2 * Math.log(1 - p)); x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); } return x; }
    const stats: any = { 
        sum: (arr: any[]) => arr.reduce((acc, val) => acc + parseFloat(val), 0), 
        mean: (arr: any[]) => stats.sum(arr) / arr.length, 
        stddev: (arr: any[], isPopulation = false) => { 
            if (arr.length < 2) return 0; 
            const meanVal = stats.mean(arr); 
            const sqDiffs = arr.map((val: any) => Math.pow(parseFloat(val) - meanVal, 2)); 
            const variance = stats.sum(sqDiffs) / (arr.length - (isPopulation ? 0 : 1)); 
            return Math.sqrt(variance); 
        }, 
        median: (arr: any[]) => { 
            const sorted = [...arr].sort((a, b) => parseFloat(a) - parseFloat(b)); 
            const mid = Math.floor(sorted.length / 2); 
            return sorted.length % 2 !== 0 ? parseFloat(sorted[mid]) : (parseFloat(sorted[mid - 1]) + parseFloat(sorted[mid])) / 2; 
        }, 
        quartile: (arr: any[], q: any) => { 
            const sorted = [...arr].sort((a, b) => parseFloat(a) - parseFloat(b)); 
            const pos = (sorted.length - 1) * q; 
            const base = Math.floor(pos); 
            const rest = pos - base; 
            if (sorted[base + 1] !== undefined) return parseFloat(sorted[base]) + rest * (parseFloat(sorted[base + 1]) - parseFloat(sorted[base])); 
            return parseFloat(sorted[base]); 
        }, 
        combinations: (n: number, k: number) => { 
            if (k < 0 || k > n) return 0; 
            if (k === 0 || k === n) return 1; 
            if (k > n / 2) k = n - k; 
            let res = 1; 
            for (let i = 1; i <= k; i++) { 
                res = res * (n - i + 1) / i; 
            } 
            return Math.round(res); 
        }, 
        binomialPdf: (n: number, p: number, k: number) => stats.combinations(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k), 
        normalCdf: (lower: number, upper: number, mean: number, std: number) => ((window as any).math.erf((upper - mean) / (std * Math.sqrt(2))) - (window as any).math.erf((lower - mean) / (std * Math.sqrt(2)))) / 2, 
        invNorm: (p: number, mean: number, std: number) => mean + std * invNormForT(p), 
        invT: (p: number, df: number) => { 
            const z = invNormForT(p); 
            if (isNaN(z)) return NaN; 
            const z2 = z * z; 
            const g1 = (z2 * z + z) / 4; 
            const g2 = (5 * z2 * z2 * z + 16 * z2 * z + 3 * z) / 96; 
            const g3 = (3 * z2 * z2 * z2 * z + 19 * z2 * z2 * z + 17 * z2 * z - 15 * z) / 384; 
            return z + (g1 / df) + (g2 / (df * df)) + (g3 / (df * df * df)); 
        }, 
        tCdf: (t: number, df: number) => { 
            let x = df / (t*t + df); 
            function incompleteBeta(x: number, a: number, b: number) { 
                if (x <= 0) return 0; 
                if (x >= 1) return 1; 
                const bt = (window as any).math.exp((window as any).math.gammaln(a + b) - (window as any).math.gammaln(a) - (window as any).math.gammaln(b) + a * Math.log(x) + b * Math.log(1 - x)); 
                if (x < (a + 1) / (a + b + 2)) { 
                    return bt * continuedFraction(x, a, b) / a; 
                } else { 
                    return 1 - bt * continuedFraction(1 - x, b, a) / b; 
                } 
            } 
            function continuedFraction(x: number, a: number, b: number) { 
                const maxIterations = 100; 
                const epsilon = 1e-15; 
                let am = 1, bm = 1, az = 1, qab = a + b, qap = a + 1, qam = a - 1, bz = 1 - qab * x / qap; 
                for (let i = 1; i <= maxIterations; i++) { 
                    let d = i * (b - i) * x / ((qam + 2 * i) * (a + 2 * i)); 
                    let ap = az + d * am; 
                    let bp = bz + d * bm; 
                    d = -(a + i) * (qab + i) * x / ((a + 2 * i) * (qap + 2 * i)); 
                    let app = ap + d * az; 
                    let bpp = bp + d * bz; 
                    am = ap / bpp; 
                    bm = bp / bpp; 
                    az = app / bpp; 
                    bz = 1; 
                    if (Math.abs(az - am) < (epsilon * Math.abs(az))) return az; 
                } 
                return az; 
            } 
            let p = incompleteBeta(x, df / 2, 0.5); 
            return t > 0 ? 1 - 0.5 * p : 0.5 * p; 
        },
        // New functions
        tcdf: (lower: number, upper: number, df: number) => {
            if (lower === -Infinity) return stats.tCdf(upper, df);
            if (upper === Infinity) return 1 - stats.tCdf(lower, df);
            return stats.tCdf(upper, df) - stats.tCdf(lower, df);
        },
        chi2Cdf: (lower: number, upper: number, df: number) => {
            function incompleteGamma(x: number, a: number) {
                if (x <= 0) return 0;
                if (x >= 1) return 1;
                const bt = (window as any).math.exp((window as any).math.gammaln(a) + a * Math.log(x) - x);
                if (x < a + 1) {
                    return bt * continuedFraction(x, a) / a;
                } else {
                    return 1 - bt * continuedFraction(1 - x, a) / a;
                }
            }
            function continuedFraction(x: number, a: number) {
                const maxIterations = 100;
                const epsilon = 1e-15;
                let am = 1, bm = 1, az = 1, qab = a, qap = a + 1, qam = a - 1, bz = 1 - qab * x / qap;
                for (let i = 1; i <= maxIterations; i++) {
                    let d = i * (a - i) * x / ((qam + 2 * i) * (a + 2 * i));
                    let ap = az + d * am;
                    let bp = bz + d * bm;
                    d = -(a + i) * (qab + i) * x / ((a + 2 * i) * (qap + 2 * i));
                    let app = ap + d * az;
                    let bpp = bp + d * bz;
                    am = ap / bpp;
                    bm = bp / bpp;
                    az = app / bpp;
                    bz = 1;
                    if (Math.abs(az - am) < (epsilon * Math.abs(az))) return az;
                }
                return az;
            }
            const lowerGamma = incompleteGamma(lower / 2, df / 2);
            const upperGamma = incompleteGamma(upper / 2, df / 2);
            return upperGamma - lowerGamma;
        }
    };

    // --- SAMPLE DATASETS ---
    const datasets: any = {
        'lab_data_1.csv': () => {
            const studyHours = [1, 1.5, 1.8, 2, 2.5, 3, 3.2, 3.8, 4, 4.5, 5, 5.5, 6];
            const examScores = [65, 68, 70, 75, 72, 80, 85, 88, 85, 92, 95, 98, 94];
            addDataColumn('hours', studyHours);
            addDataColumn('score', examScores);
        },
        'lab_data_2.csv': () => {
            const data = [0.0687, -0.143, -0.3166, 0.9792, -0.7392, 1.1696, 1.6268, 1.6648, 2.1316, 0.1995, 0.4508, 2.1061, -0.1632, 0.2994, 2.2367, -0.2307, 0.0491, 0.3763, -0.968, -0.3106, 0.1941, -0.4198, 0.6603, -0.5957, 0.3475, 0.5439, -0.9052, -0.7361, 0.7319, -1.7248, -0.442, 0.4947, 0.0995, -0.4119, -0.529, 1.2334, -0.5435, 0.546, -0.2114, -1.9367, 1.6385, -0.332, 0.7674, 0.8334, -0.1311, -0.6619, 1.3505, -0.5253, 0.1569, -0.7497, 1.533, 0.7429, 0.2626, 1.1035, -1.194, -1.5924, -0.819, 0.4221, 0.3907, -0.3298, 0.6272, -0.2477, 0.5511, -1.4939, 0.1249, 0.6198, 0.6709, -0.8344, -1.3282, -0.7415, -0.2001, 0.3802, -0.7149, 0.0396, -0.0096, 1.0456, 0.2074, -0.1333, -0.4812, -0.6175, 1.0985, 1.4993, 1.0668, -0.6533, -0.2541, -1.3814, 0.2925, 1.378, -1.6471, 1.6215, 0.8177, 1.354, -1.3235, 1.3774, -1.4567, -2.1042, -0.5691, 1.1272, 0.1826, 0.5698, -0.5152, -0.0187, -0.1092, 0.1604, -0.0636, 0.0946, -1.6034, -0.4917, 1.404, 1.3247, 1.9824, -1.201, 0.0578, 0.0008, 1.3963, 0.9788, 1.1657, 0.744, 0.2992, -0.39, 1.183, -0.0203, -0.1119, 0.3874, 0.0527, -0.6906, -0.7288, 0.4121, -1.0109, 0.1959, -2.1701, -1.0531, 0.475, 1.3721, -2.0913, -0.1224, 0.6717, 0.3396, 2.2336, 1.3428, 0.2251, 1.041, -1.41, -0.5851, -0.8538, -1.0899, -0.3518, 1.1185, 0.3012, -1.9773, 0.7931, -1.2049, 0.5534, -0.6992, -0.3737, 1.0755, 0.2265, -0.6429, 0.5061, 0.5701, -1.0934, 2.4858, 1.0864, -0.1072, -0.8185, -0.7452, 0.9808, -0.1975, -0.645, 0.4138, 0.7963, -0.1915, -0.5562, 0.3489, -0.1301, -1.6246, -0.1712, -0.5602, -2.4321, 0.0223, -2.0496, -0.918, -0.378, -2.0931, 0.4428, 1.6086, 1.9342, 1.7398, 1.003, 0.8114, 0.3492, 0.4001, 1.6521, 0.3483, -1.4525, -1.3617, -1.878, -0.2963, -0.3301, -0.6502, 0.2451, 1.7497, 0.1584, 0.0193, 1.1034, -1.5703, -1.0202, 0.3127, -1.675, 1.7153, 1.826, -1.1964, -1.5667, 0.2458, 0.5224, 0.5666, 0.3809, 0.2722, -0.729, 0.2341, -0.2316, -1.7135, -1.2969, -0.2814, 1.7778, -3.1432, 0.1385, 0.6122, 1.3732, -0.9344, -0.8694, 0.0448, 0.5508, -0.2487, 0.233, -0.495, 0.0869, 0.352, -0.4162, -1.6179, 0.4311, 1.4784, 1.1623, -0.4854, -0.6476, 1.042, 0.8938, -1.4317, 0.0753, 0.2916, 0.954, -0.4373, 0.6798, -1.0398, -0.5838, -0.3851];
            addDataColumn('normal_dist', data);
        },
        'lab_data_3.csv': () => {
            const data = [1.8, 1.9, 2.1, 2.4, 2.5, 2.8, 2.9, 3.1, 3.2, 3.3, 3.5, 3.6, 3.7, 3.9, 4.1, 4.2, 4.3, 4.4, 4.6, 4.7, 4.8, 4.9, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 6, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 7, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 8, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 9, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 10, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 11, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 11.9, 12, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9, 13];
            addDataColumn('skew_right', data);
        },
        'lab_data_4.csv': () => {
            const data = [1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 4, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 6, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 7, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 8, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 9, 9.5, 9.8, 10.1, 10.3, 10.5, 10.8, 11.2, 11.5, 11.9, 12.2, 12.6, 13, 13.5, 14, 14.8, 15.5, 16.2, 18, 19];
            addDataColumn('skew_left', data);
        },
        'lab_data_5.csv': () => {
             const data = [1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 4, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 6, 8, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 9, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 10, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 11, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 11.9, 12, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9, 13];
             addDataColumn('bimodal', data);
        },
        'lab_data_6.csv': () => {
            const data = [55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 1, 150];
            const data2 = [55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 1, 150].map(v => v + Math.random()*10 - 5);
            addDataColumn('outlier_data', data);
            addDataColumn('outlier_data2', data2);
        },
        'lab_data_7.csv': () => {
            const x = Array.from({length: 100}, (_, i) => i);
            const y = x.map(val => 2 * val + 5 + (Math.random() - 0.5) * 20);
            addDataColumn('x_strong_corr', x);
            addDataColumn('y_strong_corr', y);
        },
        'lab_data_8.csv': () => {
            const x = Array.from({length: 100}, (_, i) => i);
            const y = x.map(val => 0.5 * val + 5 + (Math.random() - 0.5) * 50);
            addDataColumn('x_weak_corr', x);
            addDataColumn('y_weak_corr', y);
        },
        'lab_data_9.csv': () => {
            const x = Array.from({length: 100}, (_, i) => i);
            const y = x.map(() => Math.random() * 100);
            addDataColumn('x_no_corr', x);
            addDataColumn('y_no_corr', y);
        },
        'lab_data_10.csv': () => {
            const categories = ['A', 'B', 'C', 'D', 'E'];
            const cat_data = Array.from({length: 150}, () => categories[Math.floor(Math.random() * categories.length)]);
            const num_data = cat_data.map(c => {
                if (c === 'A') return Math.random() * 10 + 10;
                if (c === 'B') return Math.random() * 15 + 20;
                if (c === 'C') return Math.random() * 5 + 5;
                if (c === 'D') return Math.random() * 20 + 15;
                return Math.random() * 10 + 30;
            });
            addDataColumn('category', cat_data);
            addDataColumn('value_by_cat', num_data);
        }
    };

    // --- GAME & EXPLANATION CONTENT ---
    const statsQuestions = [ { id: '2016-01', year: 2016, questionNumber: 1, questionText: 'The prices, in thousands of dollars, of 304 homes recently sold in a city are summarized in the histogram below. Based on the histogram, which of the following statements must be true?', answerOptions: [ { text: 'The minimum price is $250,000.', isCorrect: false }, { text: 'The maximum price is $2,500,000.', isCorrect: false }, { text: 'The median price is not greater than $750,000.', isCorrect: true }, { text: 'The mean price is between $500,000 and $750,000.', isCorrect: false }, { text: 'The upper quartile of the prices is greater than $1,500,000.', isCorrect: false }, ], topic: 'Displaying and Describing Distributions', unit: 'Unit 1: Exploring One-Variable Data' }, { id: '2016-02', year: 2016, questionNumber: 2, questionText: 'As part of a study on the relationship between the use of tanning booths and the occurrence of skin cancer, researchers reviewed the medical records of 1,436 people. The table in the console shows the data. Of the people in the study who had skin cancer, what fraction used a tanning booth?', answerOptions: [ { text: '190/265', isCorrect: false }, { text: '190/896', isCorrect: true }, { text: '190/1,436', isCorrect: false }, { text: '265/1,436', isCorrect: false }, { text: '896/1,436', isCorrect: false }, ], topic: 'Conditional Probability and Independence', unit: 'Unit 4: Probability' }, { id: '2016-03', year: 2016, questionNumber: 3, questionText: 'A researcher wants to determine whether there is convincing statistical evidence that more than 50 percent of households in a city gave a charitable donation. Let p represent the proportion of all households that gave a donation. Which of the following are appropriate hypotheses?', answerOptions: [ { text: 'H₀: p = 0.5 and Hₐ: p > 0.5', isCorrect: true }, { text: 'H₀: p = 0.5 and Hₐ: p ≠ 0.5', isCorrect: false }, { text: 'H₀: p = 0.5 and Hₐ: p < 0.5', isCorrect: false }, { text: 'H₀: p > 0.5 and Hₐ: p ≠ 0.5', isCorrect: false }, { text: 'H₀: p > 0.5 and Hₐ: p = 0.5', isCorrect: false }, ], topic: 'Significance Tests for Proportions', unit: 'Unit 6: Inference for Proportions' } ];
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
    function addHistoryEntry(entry: any, id: string | null = null) {
        const newEntry = {
            id: id || `entry_${Date.now()}_${Math.random()}`,
            ...entry,
        };
    
        if (id) {
            const index = appState.calculator.history.findIndex((e: any) => e.id === id);
            if (index !== -1) {
                appState.calculator.history[index] = { ...appState.calculator.history[index], ...newEntry };
            } else {
                appState.calculator.history.unshift(newEntry);
            }
        } else {
            appState.calculator.history.unshift(newEntry);
        }
        renderCalculator();
    }
    
    function renderCalculator() {
        if (!calculatorDisplay) return;
        let historyHTML = '<div class="calculator-display">';
        appState.calculator.history.slice().reverse().forEach((entry: any) => {
            historyHTML += `<div class="calc-entry">`;
            if (entry.input) {
                historyHTML += `<div class="calc-input">&gt; ${entry.input}</div>`;
            }
            if (entry.output) {
                historyHTML += `<div class="calc-output">${entry.output}</div>`;
            }
            if (entry.explanation) {
                historyHTML += `<div class="calc-explanation">${entry.explanation}</div>`;
            }
            historyHTML += `</div>`;
        });
        historyHTML += '</div>';
        calculatorDisplay.innerHTML = historyHTML;
        calculatorDisplay.scrollTop = calculatorDisplay.scrollHeight;
    }
    function closeModal() {
      appState.modal = null;
      const backdrop = document.querySelector('.modal-backdrop');
      const modal = document.querySelector('.modal:not(.help-modal)');
      if (backdrop) backdrop.remove();
      if (modal) modal.remove();
      
      // Don't close help modal when closing other modals
      const helpModal = document.getElementById('help-modal');
      if (helpModal) {
        // Keep help modal open - don't remove it
      }
    }
    (window as any).closeModal = closeModal;

    function renderModal(modalConfig: any) {
        // Close other modals but preserve help modal
        appState.modal = null;
        const existingBackdrop = document.querySelector('.modal-backdrop');
        const existingModal = document.querySelector('.modal:not(.help-modal)');
        if (existingBackdrop) existingBackdrop.remove();
        if (existingModal) existingModal.remove();
        
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

        const newBackdrop = document.createElement('div');
        newBackdrop.className = 'modal-backdrop';
        newBackdrop.onclick = closeModal;
        document.body.insertAdjacentElement('afterbegin', newBackdrop);
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        appState.modal = document.querySelector('.modal');
    }
    function showMessageModal(message: any) { renderModal({ title: 'Info', fields: [{ type: 'static', label: message }], buttons: [ { label: 'OK', action: 'closeModal', class:'btn-primary' } ], requiresData: false }); }

    // --- GRAPHING LOGIC ---
    const plotlyLayout = { 
        paper_bgcolor: 'transparent', 
        plot_bgcolor: 'transparent', 
        font: { color: 'hsl(var(--foreground))', size: 12, family: 'Inter, sans-serif' }, 
        title: { font: { size: 16 } }, 
        xaxis: { gridcolor: 'hsl(var(--border))', zerolinecolor: 'hsl(var(--muted))', titlefont: { size: 14 } }, 
        yaxis: { gridcolor: 'hsl(var(--border))', zerolinecolor: 'hsl(var(--muted))', titlefont: { size: 14 } }, 
        margin: { l: 50, r: 50, b: 50, t: 50 }, 
        showlegend: false,
        autosize: true,
        height: undefined,
        width: undefined,
        uirevision: 'true'
    };
    function plotDefault() { if(graphPlotDiv) graphPlotDiv.innerHTML = `<div class="flex items-center justify-center h-full text-muted-foreground">Drop columns here to plot data</div>`; }
    function plotHistogram(colIndex: any) { const col = appState.spreadsheet.columns[colIndex]; const data = getColumnData(col.name); const trace = { x: data, type: 'histogram', marker: { color: 'hsl(var(--primary))' }, nbinsx: 30 }; const layout = { ...plotlyLayout, title: `Histogram of ${col.name}`, yaxis: { ...plotlyLayout.yaxis, title: 'Frequency'}}; (window as any).Plotly.newPlot(graphPlotDiv, [trace], layout, {responsive: true}); }
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
    function plotDotPlot(colIndex: any) {
        const col = appState.spreadsheet.columns[colIndex];
        const data = getColumnData(col.name);
        if (data.length === 0) { showMessageModal("Cannot create dot plot. The selected column has no numerical data."); return; }
        const trace = { x: data, type: 'scatter', mode: 'markers', marker: { color: 'hsl(var(--primary))', symbol: 'circle' }, y: Array(data.length).fill(0) };
        const layout = { ...plotlyLayout, title: `Dot Plot of ${col.name}`, yaxis: { ...plotlyLayout.yaxis, title: '', showticklabels: false, zeroline: false, showgrid: false }, height: 200, margin: { t: 80, b: 50, l: 40, r: 40 } };
        (window as any).Plotly.newPlot(graphPlotDiv, [trace], layout, { responsive: true });
    }
    function generateStemAndLeaf(colIndex: any) {
        const col = appState.spreadsheet.columns[colIndex];
        const data = getColumnData(col.name).sort((a, b) => a - b);
        if (data.length === 0) { showMessageModal("Cannot create stem-and-leaf plot. The selected column has no numerical data."); return; }
        const stems: any = {};
        data.forEach(d => {
            const stem = Math.floor(d / 10);
            const leaf = d % 10;
            if (!stems[stem]) stems[stem] = [];
            stems[stem].push(leaf);
        });

        let outputHTML = `<div class="stem-and-leaf-plot"><div class="stem-and-leaf-title">Stem-and-Leaf Plot of ${col.name}</div><pre>`;
        Object.keys(stems).sort((a,b) => parseInt(a) - parseInt(b)).forEach(stem => {
            const leaves = stems[stem].sort((a: number, b: number) => a-b).join(' ');
            outputHTML += `${stem.toString().padStart(3, ' ')} | ${leaves}\n`;
        });
        outputHTML += `</pre></div>`;
        graphPlotDiv!.innerHTML = outputHTML;
    }
    function showPlotTypeMenu(colIndices: any) {
        appState.graphing.pendingPlot = { indices: colIndices };
        let subtitle = ''; let optionsHTML = '';
        if (colIndices.length === 1) {
            const colName = appState.spreadsheet.columns[colIndices[0]].name;
            subtitle = `1 Variable Selected: <strong>${colName}</strong>`;
            optionsHTML = `<button class="btn" data-plottype="histogram">Histogram</button><button class="btn" data-plottype="boxplot">Box Plot</button><button class="btn" data-plottype="dotplot">Dot Plot</button><button class="btn" data-plottype="stemleaf">Stem-and-Leaf</button>`;
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
        runLinReg: () => { const xListName = (document.getElementById('xlist') as HTMLInputElement).value; const yListName = (document.getElementById('ylist')as HTMLInputElement).value; const xData = getColumnData(xListName); const yData = getColumnData(yListName); if (xData.length < 2 || yData.length < 2 || xData.length !== yData.length) { showMessageModal('X and Y lists must have the same number of numerical data points (at least 2).'); return; } const n = xData.length; const sumX = stats.sum(xData); const sumY = stats.sum(yData); const sumXY = stats.sum(xData.map((x: number, i: number) => x * yData[i])); const sumX2 = stats.sum(xData.map((x: number) => x * x)); const sumY2 = stats.sum(yData.map((y: number) => y * y)); const b = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX); const a = (sumY / n) - b * (sumX / n); const rNumerator = (n * sumXY - sumX * sumY); const rDenominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)); const r = rDenominator === 0 ? 0 : rNumerator / rDenominator; const residuals = xData.map((x: number, i: number) => yData[i] - (a + b * x)); const results = { 'Title': 'LinReg (a+bx)', 'RegEqn': 'a+b*x', 'a': a.toFixed(4), 'b': b.toFixed(4), 'r²': (r*r).toFixed(4), 'r': r.toFixed(4) }; const resultColIndex = getNextAvailableColumnIndex(); addDataColumn(String.fromCharCode(65 + resultColIndex), Object.keys(results)); addDataColumn(String.fromCharCode(65 + resultColIndex + 1), Object.values(results), `LinReg(${xListName},${yListName})`); addDataColumn('statresid', residuals.map(r => r.toFixed(4)), `Resid(${xListName},${yListName})`); renderSpreadsheet(); closeModal(); addHistoryEntry({type: 'LinReg', input: `LinReg for ${yListName} vs ${xListName}`, output: `y = ${results.a} + ${results.b}x\nr² = ${results['r²']}`, data: {results, xListName, yListName}}); },
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
        runTInterval(mean: number, sx: number, n: number, cLevel: number) { if ([mean,sx,n,cLevel].some(isNaN)) { showMessageModal("Invalid input."); return; } const df = n - 1; const alpha = (1 - cLevel) / 2; const tStar = Math.abs(stats.invT(alpha, df)); const me = tStar * (sx / Math.sqrt(n)); const lower = mean - me; const upper = mean + me; addHistoryEntry({type: 'tInterval', input: `tInterval(${cLevel*100}%)`, output: `(${lower.toFixed(4)}, ${upper.toFixed(4)})`, data: {lower, upper, me, df, mean, sx, n}}); closeModal(); },
        showTTestModalChooser: () => renderModal({ title: 't-Test', fields: [ { id: 'inputMethod', label: 'Input Method', type: 'select', options: ['Data', 'Stats'] } ], buttons: [ { label: 'OK', action: 'chooseTTestModal', class:'btn-primary' }, { label: 'Cancel', action: 'closeModal' } ], requiresData: false }),
        chooseTTestModal: () => { const method = (document.getElementById('inputMethod') as HTMLInputElement).value; if (method === 'Stats') actions.showTTestStatsModal(); else actions.showTTestDataModal(); },
        showTTestStatsModal: () => renderModal({ title: 't-Test (Stats)', fields: [ { id: 'mu0', label: 'μ₀', type:'number' }, { id: 'mean', label: 'x̄', type:'number' }, { id: 'sx', label: 'Sx', type:'number' }, { id: 'n', label: 'n', type:'number' }, { id: 'alt', label: 'Alternate Hyp', type: 'select', options: ['μ ≠ μ₀', 'μ < μ₀', 'μ > μ₀'] } ], buttons: [ { label: 'OK', action: 'runTTestFromStats', class:'btn-primary' }, { label: 'Cancel', action: 'closeModal' } ], requiresData: false }),
        showTTestDataModal: () => renderModal({ title: 't-Test (Data)', fields: [ { id: 'mu0', label: 'μ₀', type:'number' }, { id: 'list', label: 'List', type: 'select' }, { id: 'alt', label: 'Alternate Hyp', type: 'select', options: ['μ ≠ μ₀', 'μ < μ₀', 'μ > μ₀'] } ], buttons: [ { label: 'OK', action: 'runTTestFromData', class:'btn-primary' }, { label: 'Cancel', action: 'closeModal' } ] }),
        runTTestFromStats: () => { const mu0 = parseFloat((document.getElementById('mu0') as HTMLInputElement).value); const mean = parseFloat((document.getElementById('mean') as HTMLInputElement).value); const sx = parseFloat((document.getElementById('sx') as HTMLInputElement).value); const n = parseInt((document.getElementById('n') as HTMLInputElement).value); const alt = (document.getElementById('alt') as HTMLInputElement).value; actions.runTTest(mu0, mean, sx, n, alt); },
        runTTestFromData: () => { const mu0 = parseFloat((document.getElementById('mu0') as HTMLInputElement).value); const listName = (document.getElementById('list') as HTMLInputElement).value; const alt = (document.getElementById('alt') as HTMLInputElement).value; const data = getColumnData(listName); if (data.length < 2) { showMessageModal("List must have >= 2 numbers."); return; } const mean = stats.mean(data); const sx = stats.stddev(data); const n = data.length; actions.runTTest(mu0, mean, sx, n, alt); },
        runTTest(mu0: number, mean: number, sx: number, n: number, alt: any) { if ([mu0,mean,sx,n].some(isNaN)) { showMessageModal("Invalid input."); return; } const df = n - 1; const tStat = (mean - mu0) / (sx / Math.sqrt(n)); let pVal; if (alt === 'μ < μ₀') pVal = stats.tCdf(tStat, df); else if (alt === 'μ > μ₀') pVal = 1 - stats.tCdf(tStat, df); else pVal = 2 * (1 - stats.tCdf(Math.abs(tStat), df)); addHistoryEntry({type: 'tTest', input: `t-Test(μ${alt.slice(1)})`, output: `t=${tStat.toFixed(4)}\np=${pVal.toFixed(4)}`, data: {tStat, pVal, df, mu0, mean, sx, n}}); closeModal(); },
        
        // New functions
        showTCdfModal: () => renderModal({ title: 'tCdf', fields: [ { id: 'lower', label: 'Lower Bound', value: '-1E99' }, { id: 'upper', label: 'Upper Bound', value: '1E99' }, { id: 'df', label: 'df' } ], buttons: [ { label: 'OK', action: 'runTCdf', class:'btn-primary' }, { label: 'Cancel', action: 'closeModal' } ], requiresData: false }),
        runTCdf: () => { const lower = parseFloat((document.getElementById('lower') as HTMLInputElement).value); const upper = parseFloat((document.getElementById('upper') as HTMLInputElement).value); const df = parseInt((document.getElementById('df') as HTMLInputElement).value); if ([lower, upper, df].some(isNaN)) { showMessageModal("Invalid input."); return; } const result = stats.tcdf(lower, upper, df); addHistoryEntry({type: 'TCdf', input: `tcdf(${lower},${upper},${df})`, output: result.toFixed(6), data: {lower, upper, df, result}}); closeModal(); },
        
        showInvTModal: () => renderModal({ title: 'invT', fields: [ { id: 'area', label: 'Area Left' }, { id: 'df', label: 'df' } ], buttons: [ { label: 'OK', action: 'runInvT', class:'btn-primary' }, { label: 'Cancel', action: 'closeModal' } ], requiresData: false }),
        runInvT: () => { const area = parseFloat((document.getElementById('area') as HTMLInputElement).value); const df = parseInt((document.getElementById('df') as HTMLInputElement).value); if ([area, df].some(isNaN)) { showMessageModal("Invalid input."); return; } const result = stats.invT(area, df); addHistoryEntry({type: 'InvT', input: `invT(${area},${df})`, output: result.toFixed(6), data: {area, df, result}}); closeModal(); },
        
        showChi2CdfModal: () => renderModal({ title: 'χ²Cdf', fields: [ { id: 'lower', label: 'Lower Bound', value: '0' }, { id: 'upper', label: 'Upper Bound', value: '1E99' }, { id: 'df', label: 'df' } ], buttons: [ { label: 'OK', action: 'runChi2Cdf', class:'btn-primary' }, { label: 'Cancel', action: 'closeModal' } ], requiresData: false }),
        runChi2Cdf: () => { const lower = parseFloat((document.getElementById('lower') as HTMLInputElement).value); const upper = parseFloat((document.getElementById('upper') as HTMLInputElement).value); const df = parseInt((document.getElementById('df') as HTMLInputElement).value); if ([lower, upper, df].some(isNaN)) { showMessageModal("Invalid input."); return; } const result = stats.chi2Cdf(lower, upper, df); addHistoryEntry({type: 'Chi2Cdf', input: `χ²cdf(${lower},${upper},${df})`, output: result.toFixed(6), data: {lower, upper, df, result}}); closeModal(); },
        
        show2SampTTestModal: () => renderModal({ title: '2-SampTTest', fields: [ { id: 'x1', label: 'x̄₁', type:'number' }, { id: 'sx1', label: 'Sx₁', type:'number' }, { id: 'n1', label: 'n₁', type:'number' }, { id: 'x2', label: 'x̄₂', type:'number' }, { id: 'sx2', label: 'Sx₂', type:'number' }, { id: 'n2', label: 'n₂', type:'number' }, { id: 'alt', label: 'Alternate Hyp', type: 'select', options: ['μ₁ ≠ μ₂', 'μ₁ < μ₂', 'μ₁ > μ₂'] } ], buttons: [ { label: 'OK', action: 'run2SampTTest', class:'btn-primary' }, { label: 'Cancel', action: 'closeModal' } ], requiresData: false }),
        run2SampTTest: () => { const x1 = parseFloat((document.getElementById('x1') as HTMLInputElement).value); const sx1 = parseFloat((document.getElementById('sx1') as HTMLInputElement).value); const n1 = parseInt((document.getElementById('n1') as HTMLInputElement).value); const x2 = parseFloat((document.getElementById('x2') as HTMLInputElement).value); const sx2 = parseFloat((document.getElementById('sx2') as HTMLInputElement).value); const n2 = parseInt((document.getElementById('n2') as HTMLInputElement).value); const alt = (document.getElementById('alt') as HTMLInputElement).value; if ([x1,sx1,n1,x2,sx2,n2].some(isNaN)) { showMessageModal("Invalid input."); return; } const df = Math.min(n1-1, n2-1); const tStat = (x1 - x2) / Math.sqrt((sx1*sx1/n1) + (sx2*sx2/n2)); let pVal; if (alt === 'μ₁ < μ₂') pVal = stats.tCdf(tStat, df); else if (alt === 'μ₁ > μ₂') pVal = 1 - stats.tCdf(tStat, df); else pVal = 2 * (1 - stats.tCdf(Math.abs(tStat), df)); addHistoryEntry({type: '2SampTTest', input: `2-SampTTest(${alt})`, output: `t=${tStat.toFixed(4)}\np=${pVal.toFixed(4)}\ndf=${df}`, data: {tStat, pVal, df, x1, sx1, n1, x2, sx2, n2}}); closeModal(); },
        
        show2SampTIntModal: () => renderModal({ title: '2-SampTInt', fields: [ { id: 'x1', label: 'x̄₁', type:'number' }, { id: 'sx1', label: 'Sx₁', type:'number' }, { id: 'n1', label: 'n₁', type:'number' }, { id: 'x2', label: 'x̄₂', type:'number' }, { id: 'sx2', label: 'Sx₂', type:'number' }, { id: 'n2', label: 'n₂', type:'number' }, { id: 'clevel', label: 'C-Level', type:'number', value: '0.95' } ], buttons: [ { label: 'OK', action: 'run2SampTInt', class:'btn-primary' }, { label: 'Cancel', action: 'closeModal' } ], requiresData: false }),
        run2SampTInt: () => { const x1 = parseFloat((document.getElementById('x1') as HTMLInputElement).value); const sx1 = parseFloat((document.getElementById('sx1') as HTMLInputElement).value); const n1 = parseInt((document.getElementById('n1') as HTMLInputElement).value); const x2 = parseFloat((document.getElementById('x2') as HTMLInputElement).value); const sx2 = parseFloat((document.getElementById('sx2') as HTMLInputElement).value); const n2 = parseInt((document.getElementById('n2') as HTMLInputElement).value); const cLevel = parseFloat((document.getElementById('clevel') as HTMLInputElement).value); if ([x1,sx1,n1,x2,sx2,n2,cLevel].some(isNaN)) { showMessageModal("Invalid input."); return; } const df = Math.min(n1-1, n2-1); const alpha = (1 - cLevel) / 2; const tStar = Math.abs(stats.invT(alpha, df)); const se = Math.sqrt((sx1*sx1/n1) + (sx2*sx2/n2)); const me = tStar * se; const lower = (x1 - x2) - me; const upper = (x1 - x2) + me; addHistoryEntry({type: '2SampTInt', input: `2-SampTInt(${cLevel*100}%)`, output: `(${lower.toFixed(4)}, ${upper.toFixed(4)})`, data: {lower, upper, me, df, x1, sx1, n1, x2, sx2, n2}}); closeModal(); },
        
        show1PropZTestModal: () => renderModal({ title: '1-PropZTest', fields: [ { id: 'p0', label: 'p₀', type:'number' }, { id: 'x', label: 'x', type:'number' }, { id: 'n', label: 'n', type:'number' }, { id: 'alt', label: 'Alternate Hyp', type: 'select', options: ['p ≠ p₀', 'p < p₀', 'p > p₀'] } ], buttons: [ { label: 'OK', action: 'run1PropZTest', class:'btn-primary' }, { label: 'Cancel', action: 'closeModal' } ], requiresData: false }),
        run1PropZTest: () => { const p0 = parseFloat((document.getElementById('p0') as HTMLInputElement).value); const x = parseInt((document.getElementById('x') as HTMLInputElement).value); const n = parseInt((document.getElementById('n') as HTMLInputElement).value); const alt = (document.getElementById('alt') as HTMLInputElement).value; if ([p0,x,n].some(isNaN)) { showMessageModal("Invalid input."); return; } const pHat = x / n; const se = Math.sqrt(p0 * (1-p0) / n); const zStat = (pHat - p0) / se; let pVal; if (alt === 'p < p₀') pVal = stats.normalCdf(-Infinity, zStat, 0, 1); else if (alt === 'p > p₀') pVal = stats.normalCdf(zStat, Infinity, 0, 1); else pVal = 2 * (1 - stats.normalCdf(-Math.abs(zStat), Math.abs(zStat), 0, 1)); addHistoryEntry({type: '1PropZTest', input: `1-PropZTest(${alt})`, output: `z=${zStat.toFixed(4)}\np=${pVal.toFixed(4)}`, data: {zStat, pVal, p0, x, n, pHat}}); closeModal(); },
        
        show2PropZTestModal: () => renderModal({ title: '2-PropZTest', fields: [ { id: 'x1', label: 'x₁', type:'number' }, { id: 'n1', label: 'n₁', type:'number' }, { id: 'x2', label: 'x₂', type:'number' }, { id: 'n2', label: 'n₂', type:'number' }, { id: 'alt', label: 'Alternate Hyp', type: 'select', options: ['p₁ ≠ p₂', 'p₁ < p₂', 'p₁ > p₂'] } ], buttons: [ { label: 'OK', action: 'run2PropZTest', class:'btn-primary' }, { label: 'Cancel', action: 'closeModal' } ], requiresData: false }),
        run2PropZTest: () => { const x1 = parseInt((document.getElementById('x1') as HTMLInputElement).value); const n1 = parseInt((document.getElementById('n1') as HTMLInputElement).value); const x2 = parseInt((document.getElementById('x2') as HTMLInputElement).value); const n2 = parseInt((document.getElementById('n2') as HTMLInputElement).value); const alt = (document.getElementById('alt') as HTMLInputElement).value; if ([x1,n1,x2,n2].some(isNaN)) { showMessageModal("Invalid input."); return; } const p1 = x1 / n1; const p2 = x2 / n2; const pPooled = (x1 + x2) / (n1 + n2); const se = Math.sqrt(pPooled * (1-pPooled) * (1/n1 + 1/n2)); const zStat = (p1 - p2) / se; let pVal; if (alt === 'p₁ < p₂') pVal = stats.normalCdf(-Infinity, zStat, 0, 1); else if (alt === 'p₁ > p₂') pVal = stats.normalCdf(zStat, Infinity, 0, 1); else pVal = 2 * (1 - stats.normalCdf(-Math.abs(zStat), Math.abs(zStat), 0, 1)); addHistoryEntry({type: '2PropZTest', input: `2-PropZTest(${alt})`, output: `z=${zStat.toFixed(4)}\np=${pVal.toFixed(4)}`, data: {zStat, pVal, x1, n1, x2, n2, p1, p2}}); closeModal(); },
        
        show1PropZIntModal: () => renderModal({ title: '1-PropZInt', fields: [ { id: 'x', label: 'x', type:'number' }, { id: 'n', label: 'n', type:'number' }, { id: 'clevel', label: 'C-Level', type:'number', value: '0.95' } ], buttons: [ { label: 'OK', action: 'run1PropZInt', class:'btn-primary' }, { label: 'Cancel', action: 'closeModal' } ], requiresData: false }),
        run1PropZInt: () => { const x = parseInt((document.getElementById('x') as HTMLInputElement).value); const n = parseInt((document.getElementById('n') as HTMLInputElement).value); const cLevel = parseFloat((document.getElementById('clevel') as HTMLInputElement).value); if ([x,n,cLevel].some(isNaN)) { showMessageModal("Invalid input."); return; } const pHat = x / n; const alpha = (1 - cLevel) / 2; const zStar = Math.abs(stats.invNorm(alpha, 0, 1)); const se = Math.sqrt(pHat * (1-pHat) / n); const me = zStar * se; const lower = Math.max(0, pHat - me); const upper = Math.min(1, pHat + me); addHistoryEntry({type: '1PropZInt', input: `1-PropZInt(${cLevel*100}%)`, output: `(${lower.toFixed(4)}, ${upper.toFixed(4)})`, data: {lower, upper, me, x, n, pHat}}); closeModal(); },
        
        show2PropZIntModal: () => renderModal({ title: '2-PropZInt', fields: [ { id: 'x1', label: 'x₁', type:'number' }, { id: 'n1', label: 'n₁', type:'number' }, { id: 'x2', label: 'x₂', type:'number' }, { id: 'n2', label: 'n₂', type:'number' }, { id: 'clevel', label: 'C-Level', type:'number', value: '0.95' } ], buttons: [ { label: 'OK', action: 'run2PropZInt', class:'btn-primary' }, { label: 'Cancel', action: 'closeModal' } ], requiresData: false }),
        run2PropZInt: () => { const x1 = parseInt((document.getElementById('x1') as HTMLInputElement).value); const n1 = parseInt((document.getElementById('n1') as HTMLInputElement).value); const x2 = parseInt((document.getElementById('x2') as HTMLInputElement).value); const n2 = parseInt((document.getElementById('n2') as HTMLInputElement).value); const cLevel = parseFloat((document.getElementById('clevel') as HTMLInputElement).value); if ([x1,n1,x2,n2,cLevel].some(isNaN)) { showMessageModal("Invalid input."); return; } const p1 = x1 / n1; const p2 = x2 / n2; const alpha = (1 - cLevel) / 2; const zStar = Math.abs(stats.invNorm(alpha, 0, 1)); const se = Math.sqrt((p1*(1-p1)/n1) + (p2*(1-p2)/n2)); const me = zStar * se; const lower = (p1 - p2) - me; const upper = (p1 - p2) + me; addHistoryEntry({type: '2PropZInt', input: `2-PropZInt(${cLevel*100}%)`, output: `(${lower.toFixed(4)}, ${upper.toFixed(4)})`, data: {lower, upper, me, x1, n1, x2, n2, p1, p2}}); closeModal(); },
        
        showChi2TestModal: () => renderModal({ title: 'χ²-Test', fields: [ { id: 'observed', label: 'Observed Matrix (comma-separated rows)', type:'text', placeholder: '10,15,20;5,10,15' } ], buttons: [ { label: 'OK', action: 'runChi2Test', class:'btn-primary' }, { label: 'Cancel', action: 'closeModal' } ], requiresData: false }),
        runChi2Test: () => { const observedStr = (document.getElementById('observed') as HTMLInputElement).value; try { const rows = observedStr.split(';').map(row => row.split(',').map(cell => parseInt(cell.trim()))); const r = rows.length; const c = rows[0].length; let total = 0; for (let i = 0; i < r; i++) { for (let j = 0; j < c; j++) { total += rows[i][j]; } } const expected = []; let chi2 = 0; for (let i = 0; i < r; i++) { expected[i] = []; for (let j = 0; j < c; j++) { const rowSum = rows[i].reduce((sum, val) => sum + val, 0); const colSum = rows.reduce((sum, row) => sum + row[j], 0); expected[i][j] = (rowSum * colSum) / total; chi2 += Math.pow(rows[i][j] - expected[i][j], 2) / expected[i][j]; } } const df = (r - 1) * (c - 1); const pVal = 1 - stats.chi2Cdf(0, chi2, df); addHistoryEntry({type: 'Chi2Test', input: `χ²-Test`, output: `χ²=${chi2.toFixed(4)}\np=${pVal.toFixed(4)}\ndf=${df}`, data: {chi2, pVal, df, observed: rows, expected}}); closeModal(); } catch (e) { showMessageModal("Invalid matrix format. Use format: '10,15,20;5,10,15'"); } },
        
        showChi2GOFTestModal: () => renderModal({ title: 'χ²-GOF-Test', fields: [ { id: 'observed', label: 'Observed List (comma-separated)', type:'text', placeholder: '10,15,20,25' }, { id: 'expected', label: 'Expected List (comma-separated)', type:'text', placeholder: '12,18,18,12' } ], buttons: [ { label: 'OK', action: 'runChi2GOFTest', class:'btn-primary' }, { label: 'Cancel', action: 'closeModal' } ], requiresData: false }),
        runChi2GOFTest: () => { const observedStr = (document.getElementById('observed') as HTMLInputElement).value; const expectedStr = (document.getElementById('expected') as HTMLInputElement).value; try { const observed = observedStr.split(',').map(x => parseInt(x.trim())); const expected = expectedStr.split(',').map(x => parseFloat(x.trim())); if (observed.length !== expected.length) { showMessageModal("Observed and expected lists must have same length."); return; } let chi2 = 0; for (let i = 0; i < observed.length; i++) { chi2 += Math.pow(observed[i] - expected[i], 2) / expected[i]; } const df = observed.length - 1; const pVal = 1 - stats.chi2Cdf(0, chi2, df); addHistoryEntry({type: 'Chi2GOFTest', input: `χ²-GOF-Test`, output: `χ²=${chi2.toFixed(4)}\np=${pVal.toFixed(4)}\ndf=${df}`, data: {chi2, pVal, df, observed, expected}}); closeModal(); } catch (e) { showMessageModal("Invalid list format. Use comma-separated numbers."); } },
        
        // Help system functions
        showHowToUse: () => {
            const helpContent = `
                <div class="text-center mb-6">
                    <h3 class="text-lg font-bold mb-4">How to Use the Statistics Menu</h3>
                    <p class="text-sm text-muted-foreground mb-4">
                        Click on any menu item below to see a detailed example and explanation of how to use that statistical function.
                    </p>
                </div>
                
                <div class="mb-6">
                    <div class="text-sm font-semibold mb-2 bg-blue-100 border-blue-300 text-blue-800 px-3 py-1 rounded">Descriptive Statistics</div>
                    <div class="grid grid-cols-2 gap-3">
                        <button class="btn text-sm" data-action="showHelp" data-help="oneVarStats">One-Variable Stats</button>
                        <button class="btn text-sm" data-action="showHelp" data-help="linReg">LinReg (a+bx)</button>
                    </div>
                </div>
                
                <div class="mb-6">
                    <div class="text-sm font-semibold mb-2 bg-green-100 border-green-300 text-green-800 px-3 py-1 rounded">Probability Distributions</div>
                    <div class="grid grid-cols-2 gap-3">
                        <button class="btn text-sm" data-action="showHelp" data-help="binomPdf">Binomial Pdf</button>
                        <button class="btn text-sm" data-action="showHelp" data-help="binomCdf">Binomial Cdf</button>
                        <button class="btn text-sm" data-action="showHelp" data-help="normalCdf">Normal Cdf</button>
                        <button class="btn text-sm" data-action="showHelp" data-help="invNorm">Inverse Normal</button>
                        <button class="btn text-sm" data-action="showHelp" data-help="tcdf">tCdf</button>
                        <button class="btn text-sm" data-action="showHelp" data-help="invT">invT</button>
                        <button class="btn text-sm" data-action="showHelp" data-help="chi2Cdf">χ²Cdf</button>
                    </div>
                </div>
                
                <div class="mb-6">
                    <div class="text-sm font-semibold mb-2 bg-purple-100 border-purple-300 text-purple-800 px-3 py-1 rounded">Confidence Intervals</div>
                    <div class="grid grid-cols-2 gap-3">
                        <button class="btn text-sm" data-action="showHelp" data-help="tInterval">1-Sample t-Interval (mean)</button>
                        <button class="btn text-sm" data-action="showHelp" data-help="twoSampTInt">2-Sample t-Interval (mean)</button>
                        <button class="btn text-sm" data-action="showHelp" data-help="propZInt">1-Sample z-Interval (proportion)</button>
                        <button class="btn text-sm" data-action="showHelp" data-help="twoPropZInt">2-Sample z-Interval (proportion)</button>
                    </div>
                </div>
                
                <div class="mb-6">
                    <div class="text-sm font-semibold mb-2 bg-orange-100 border-orange-300 text-orange-800 px-3 py-1 rounded">Significance Tests</div>
                    <div class="grid grid-cols-2 gap-3">
                        <button class="btn text-sm" data-action="showHelp" data-help="tTest">1-Sample t-Test (mean)</button>
                        <button class="btn text-sm" data-action="showHelp" data-help="twoSampTTest">2-Sample t-Test (mean)</button>
                        <button class="btn text-sm" data-action="showHelp" data-help="propZTest">1-Sample z-Test (proportion)</button>
                        <button class="btn text-sm" data-action="showHelp" data-help="twoPropZTest">2-Sample z-Test (proportion)</button>
                        <button class="btn text-sm" data-action="showHelp" data-help="chi2Test">χ²-Test (independence)</button>
                        <button class="btn text-sm" data-action="showHelp" data-help="chi2GOFTest">χ²-GOF-Test (goodness of fit)</button>
                    </div>
                </div>
            `;
            
            // Create single draggable help modal without backdrop
            const helpModalHTML = `<div class="modal help-modal" id="help-modal" style="max-width: 800px; width: 90vw; position: fixed; top: 50%; right: 20px; transform: translateY(-50%); z-index: 1001;">
                <div class="modal-title">How to Use Statistics Functions</div>
                <div class="modal-content" id="help-content">
                    ${helpContent}
                </div>
                <div class="modal-buttons">
                    <button class="btn btn-secondary" id="help-back-btn" data-action="goBackToHelp" style="display: none;">← Back</button>
                    <button class="btn btn-primary" data-action="closeHelpModal">Close</button>
                </div>
            </div>`;
            
            document.body.insertAdjacentHTML('beforeend', helpModalHTML);
            const helpModal = document.getElementById('help-modal');
            
            if (helpModal) {
                makeModalDraggable(helpModal);
                // Store the main help content for back navigation
                (window as any).mainHelpContent = helpContent;
            }
        },
        
        showHelp: (event: any) => {
            const helpType = event.target.dataset.help;
            const helpData = actions.getHelpContent(helpType);
            if (helpData) {
                // Update existing help modal content
                const helpModal = document.getElementById('help-modal');
                const helpContent = document.getElementById('help-content');
                const backBtn = document.getElementById('help-back-btn');
                
                if (helpModal && helpContent && backBtn) {
                    // Update title and content
                    const titleElement = helpModal.querySelector('.modal-title');
                    if (titleElement) {
                        titleElement.textContent = helpData.title;
                    }
                    
                    helpContent.innerHTML = helpData.content;
                    
                    // Show back button
                    backBtn.style.display = 'inline-block';
                }
            }
        },
        
        goBackToHelp: () => {
            // Return to main help menu
            const helpModal = document.getElementById('help-modal');
            const helpContent = document.getElementById('help-content');
            const backBtn = document.getElementById('help-back-btn');
            
            if (helpModal && helpContent && backBtn) {
                // Restore original title and content
                const titleElement = helpModal.querySelector('.modal-title');
                if (titleElement) {
                    titleElement.textContent = 'How to Use Statistics Functions';
                }
                
                helpContent.innerHTML = (window as any).mainHelpContent;
                
                // Hide back button
                backBtn.style.display = 'none';
            }
        },
        
        closeHelpModal: () => {
            // Specifically close the help modal
            const helpModal = document.getElementById('help-modal');
            if (helpModal) {
                helpModal.remove();
            }
        },
        
        getHelpContent: (helpType: string) => {
            const helpExamples: any = {
                oneVarStats: {
                    title: 'One-Variable Statistics',
                    content: `
                        <div class="space-y-4">
                            <div class="bg-blue-50 p-4 rounded">
                                <h4 class="font-bold mb-2">📋 Example Question:</h4>
                                <p class="text-sm">A teacher wants to analyze the test scores of her 25 students. The scores are: 78, 82, 85, 88, 90, 92, 94, 95, 96, 97, 98, 99, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100</p>
                            </div>
                            
                            <div class="bg-green-50 p-4 rounded">
                                <h4 class="font-bold mb-2">🔧 How to Use:</h4>
                                <ol class="text-sm list-decimal list-inside space-y-1">
                                    <li>Enter your data in the spreadsheet</li>
                                    <li>Click "Stats Menu" → "One-Variable Stats"</li>
                                    <li>Select your data column from the dropdown</li>
                                    <li>Click "OK" to see results</li>
                                </ol>
                            </div>
                            
                            <div class="bg-yellow-50 p-4 rounded">
                                <h4 class="font-bold mb-2">📊 What You'll Get:</h4>
                                <ul class="text-sm list-disc list-inside space-y-1">
                                    <li><strong>n:</strong> Sample size (25)</li>
                                    <li><strong>x̄:</strong> Sample mean (96.8)</li>
                                    <li><strong>Sx:</strong> Sample standard deviation (6.2)</li>
                                    <li><strong>MinX:</strong> Minimum value (78)</li>
                                    <li><strong>Q₁:</strong> First quartile (90)</li>
                                    <li><strong>Median:</strong> Middle value (100)</li>
                                    <li><strong>Q₃:</strong> Third quartile (100)</li>
                                    <li><strong>MaxX:</strong> Maximum value (100)</li>
                                </ul>
                            </div>
                            
                            <div class="bg-purple-50 p-4 rounded">
                                <h4 class="font-bold mb-2">💡 Key Concepts:</h4>
                                <ul class="text-sm list-disc list-inside space-y-1">
                                    <li><strong>Mean (x̄):</strong> Average of all values</li>
                                    <li><strong>Standard Deviation (Sx):</strong> Measure of spread around the mean</li>
                                    <li><strong>Quartiles:</strong> Divide data into four equal parts</li>
                                    <li><strong>Five-Number Summary:</strong> Min, Q₁, Median, Q₃, Max</li>
                                </ul>
                            </div>
                        </div>
                    `
                },
                
                tTest: {
                    title: '1-Sample t-Test (mean)',
                    content: `
                        <div class="space-y-4">
                            <div class="bg-blue-50 p-4 rounded">
                                <h4 class="font-bold mb-2">📋 Example Question:</h4>
                                <p class="text-sm">A nutritionist claims that the average daily calorie intake for teenagers is 2000 calories. A sample of 30 teenagers has a mean intake of 1850 calories with a standard deviation of 300 calories. Test if the average is significantly different from 2000 calories.</p>
                            </div>
                            
                            <div class="bg-green-50 p-4 rounded">
                                <h4 class="font-bold mb-2">🔧 How to Use:</h4>
                                <ol class="text-sm list-decimal list-inside space-y-1">
                                    <li>Click "Stats Menu" → "1-Sample t-Test (mean)"</li>
                                    <li>Enter μ₀ = 2000 (null hypothesis value)</li>
                                    <li>Enter x̄ = 1850 (sample mean)</li>
                                    <li>Enter Sx = 300 (sample standard deviation)</li>
                                    <li>Enter n = 30 (sample size)</li>
                                    <li>Select alternative hypothesis: "μ ≠ μ₀"</li>
                                    <li>Click "OK" to see results</li>
                                </ol>
                            </div>
                            
                            <div class="bg-yellow-50 p-4 rounded">
                                <h4 class="font-bold mb-2">📊 What You'll Get:</h4>
                                <ul class="text-sm list-disc list-inside space-y-1">
                                    <li><strong>t-statistic:</strong> -2.74</li>
                                    <li><strong>p-value:</strong> 0.0102</li>
                                    <li><strong>df:</strong> 29 (degrees of freedom)</li>
                                </ul>
                            </div>
                            
                            <div class="bg-purple-50 p-4 rounded">
                                <h4 class="font-bold mb-2">💡 Key Concepts:</h4>
                                <ul class="text-sm list-disc list-inside space-y-1">
                                    <li><strong>Null Hypothesis (H₀):</strong> μ = 2000</li>
                                    <li><strong>Alternative Hypothesis (Hₐ):</strong> μ ≠ 2000</li>
                                    <li><strong>t-statistic:</strong> Measures how many standard errors the sample mean is from the hypothesized mean</li>
                                    <li><strong>p-value:</strong> Probability of getting a result as extreme as observed, assuming H₀ is true</li>
                                    <li><strong>Decision:</strong> If p < α (0.05), reject H₀</li>
                                </ul>
                            </div>
                        </div>
                    `
                },
                
                tInterval: {
                    title: '1-Sample t-Interval (mean)',
                    content: `
                        <div class="space-y-4">
                            <div class="bg-blue-50 p-4 rounded">
                                <h4 class="font-bold mb-2">📋 Example Question:</h4>
                                <p class="text-sm">A researcher wants to estimate the average height of college students. A random sample of 25 students has a mean height of 68 inches with a standard deviation of 3 inches. Find a 95% confidence interval for the true mean height.</p>
                            </div>
                            
                            <div class="bg-green-50 p-4 rounded">
                                <h4 class="font-bold mb-2">🔧 How to Use:</h4>
                                <ol class="text-sm list-decimal list-inside space-y-1">
                                    <li>Click "Stats Menu" → "1-Sample t-Interval (mean)"</li>
                                    <li>Enter x̄ = 68 (sample mean)</li>
                                    <li>Enter Sx = 3 (sample standard deviation)</li>
                                    <li>Enter n = 25 (sample size)</li>
                                    <li>Enter C-Level = 0.95 (confidence level)</li>
                                    <li>Click "OK" to see results</li>
                                </ol>
                            </div>
                            
                            <div class="bg-yellow-50 p-4 rounded">
                                <h4 class="font-bold mb-2">📊 What You'll Get:</h4>
                                <ul class="text-sm list-disc list-inside space-y-1">
                                    <li><strong>Confidence Interval:</strong> (66.8, 69.2)</li>
                                    <li><strong>Margin of Error:</strong> 1.2</li>
                                    <li><strong>df:</strong> 24 (degrees of freedom)</li>
                                </ul>
                            </div>
                            
                            <div class="bg-purple-50 p-4 rounded">
                                <h4 class="font-bold mb-2">💡 Key Concepts:</h4>
                                <ul class="text-sm list-disc list-inside space-y-1">
                                    <li><strong>Confidence Level:</strong> 95% means we're 95% confident the interval contains the true parameter</li>
                                    <li><strong>Margin of Error:</strong> Half the width of the interval</li>
                                    <li><strong>Formula:</strong> x̄ ± t* × (Sx/√n)</li>
                                    <li><strong>Interpretation:</strong> "We are 95% confident that the true mean height is between 66.8 and 69.2 inches."</li>
                                </ul>
                            </div>
                        </div>
                    `
                },
                
                                 normalCdf: {
                     title: 'Normal Cdf',
                     content: `
                         <div class="space-y-4">
                             <div class="bg-blue-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">📋 Example Question:</h4>
                                 <p class="text-sm">The heights of adult males are normally distributed with mean 70 inches and standard deviation 3 inches. What is the probability that a randomly selected adult male is between 68 and 72 inches tall?</p>
                             </div>
                             
                             <div class="bg-green-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">🔧 How to Use:</h4>
                                 <ol class="text-sm list-decimal list-inside space-y-1">
                                     <li>Click "Stats Menu" → "Normal Cdf"</li>
                                     <li>Enter Lower Bound = 68</li>
                                     <li>Enter Upper Bound = 72</li>
                                     <li>Enter μ = 70 (mean)</li>
                                     <li>Enter σ = 3 (standard deviation)</li>
                                     <li>Click "OK" to see results</li>
                                 </ol>
                             </div>
                             
                             <div class="bg-yellow-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">📊 What You'll Get:</h4>
                                 <ul class="text-sm list-disc list-inside space-y-1">
                                     <li><strong>Probability:</strong> 0.4950 (or about 49.5%)</li>
                                 </ul>
                             </div>
                             
                             <div class="bg-purple-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">💡 Key Concepts:</h4>
                                 <ul class="text-sm list-disc list-inside space-y-1">
                                     <li><strong>Normal Distribution:</strong> Bell-shaped, symmetric distribution</li>
                                     <li><strong>Cdf:</strong> Cumulative Distribution Function - area under the curve</li>
                                     <li><strong>68-95-99.7 Rule:</strong> About 68% of data within 1σ, 95% within 2σ, 99.7% within 3σ</li>
                                     <li><strong>Z-score:</strong> (x - μ)/σ measures how many standard deviations from mean</li>
                                 </ul>
                             </div>
                         </div>
                     `
                 },
                 
                 binomPdf: {
                     title: 'Binomial Pdf',
                     content: `
                         <div class="space-y-4">
                             <div class="bg-blue-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">📋 Example Question:</h4>
                                 <p class="text-sm">A fair coin is flipped 10 times. What is the probability of getting exactly 3 heads?</p>
                             </div>
                             
                             <div class="bg-green-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">🔧 How to Use:</h4>
                                 <ol class="text-sm list-decimal list-inside space-y-1">
                                     <li>Click "Stats Menu" → "Binomial Pdf"</li>
                                     <li>Enter n = 10 (number of trials)</li>
                                     <li>Enter p = 0.5 (probability of success)</li>
                                     <li>Enter k = 3 (number of successes)</li>
                                     <li>Click "OK" to see results</li>
                                 </ol>
                             </div>
                             
                             <div class="bg-yellow-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">📊 What You'll Get:</h4>
                                 <ul class="text-sm list-disc list-inside space-y-1">
                                     <li><strong>Probability:</strong> 0.1172 (or about 11.7%)</li>
                                 </ul>
                             </div>
                             
                             <div class="bg-purple-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">💡 Key Concepts:</h4>
                                 <ul class="text-sm list-disc list-inside space-y-1">
                                     <li><strong>Binomial Distribution:</strong> Models number of successes in n independent trials</li>
                                     <li><strong>Pdf:</strong> Probability Density Function - exact probability</li>
                                     <li><strong>Formula:</strong> P(X=k) = C(n,k) × p^k × (1-p)^(n-k)</li>
                                     <li><strong>Conditions:</strong> Fixed n, independent trials, constant p</li>
                                 </ul>
                             </div>
                         </div>
                     `
                 },
                 
                 binomCdf: {
                     title: 'Binomial Cdf',
                     content: `
                         <div class="space-y-4">
                             <div class="bg-blue-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">📋 Example Question:</h4>
                                 <p class="text-sm">A fair coin is flipped 10 times. What is the probability of getting 3 or fewer heads?</p>
                             </div>
                             
                             <div class="bg-green-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">🔧 How to Use:</h4>
                                 <ol class="text-sm list-decimal list-inside space-y-1">
                                     <li>Click "Stats Menu" → "Binomial Cdf"</li>
                                     <li>Enter n = 10 (number of trials)</li>
                                     <li>Enter p = 0.5 (probability of success)</li>
                                     <li>Enter k = 3 (maximum number of successes)</li>
                                     <li>Click "OK" to see results</li>
                                 </ol>
                             </div>
                             
                             <div class="bg-yellow-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">📊 What You'll Get:</h4>
                                 <ul class="text-sm list-disc list-inside space-y-1">
                                     <li><strong>Probability:</strong> 0.1719 (or about 17.2%)</li>
                                 </ul>
                             </div>
                             
                             <div class="bg-purple-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">💡 Key Concepts:</h4>
                                 <ul class="text-sm list-disc list-inside space-y-1">
                                     <li><strong>Cdf:</strong> Cumulative Distribution Function - sum of probabilities</li>
                                     <li><strong>P(X ≤ k):</strong> Probability of k or fewer successes</li>
                                     <li><strong>Uses:</strong> "At most" or "no more than" problems</li>
                                     <li><strong>Calculation:</strong> Sum of individual binomial probabilities</li>
                                 </ul>
                             </div>
                         </div>
                     `
                 },
                 
                 tcdf: {
                     title: 'tCdf',
                     content: `
                         <div class="space-y-4">
                             <div class="bg-blue-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">📋 Example Question:</h4>
                                 <p class="text-sm">For a t-distribution with 15 degrees of freedom, what is the probability that t is between -1.5 and 2.0?</p>
                             </div>
                             
                             <div class="bg-green-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">🔧 How to Use:</h4>
                                 <ol class="text-sm list-decimal list-inside space-y-1">
                                     <li>Click "Stats Menu" → "tCdf"</li>
                                     <li>Enter Lower Bound = -1.5</li>
                                     <li>Enter Upper Bound = 2.0</li>
                                     <li>Enter df = 15 (degrees of freedom)</li>
                                     <li>Click "OK" to see results</li>
                                 </ol>
                             </div>
                             
                             <div class="bg-yellow-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">📊 What You'll Get:</h4>
                                 <ul class="text-sm list-disc list-inside space-y-1">
                                     <li><strong>Probability:</strong> 0.8923 (or about 89.2%)</li>
                                 </ul>
                             </div>
                             
                             <div class="bg-purple-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">💡 Key Concepts:</h4>
                                 <ul class="text-sm list-disc list-inside space-y-1">
                                     <li><strong>t-Distribution:</strong> Similar to normal but with heavier tails</li>
                                     <li><strong>Degrees of Freedom:</strong> Affects shape - more df = closer to normal</li>
                                     <li><strong>Uses:</strong> Small samples, unknown population standard deviation</li>
                                     <li><strong>Confidence Intervals:</strong> Used for mean estimation with small samples</li>
                                 </ul>
                             </div>
                         </div>
                     `
                 },
                 
                 invT: {
                     title: 'invT',
                     content: `
                         <div class="space-y-4">
                             <div class="bg-blue-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">📋 Example Question:</h4>
                                 <p class="text-sm">For a t-distribution with 20 degrees of freedom, find the t-value that has 95% of the area to the left.</p>
                             </div>
                             
                             <div class="bg-green-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">🔧 How to Use:</h4>
                                 <ol class="text-sm list-decimal list-inside space-y-1">
                                     <li>Click "Stats Menu" → "invT"</li>
                                     <li>Enter Area Left = 0.95</li>
                                     <li>Enter df = 20 (degrees of freedom)</li>
                                     <li>Click "OK" to see results</li>
                                 </ol>
                             </div>
                             
                             <div class="bg-yellow-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">📊 What You'll Get:</h4>
                                 <ul class="text-sm list-disc list-inside space-y-1">
                                     <li><strong>t-value:</strong> 1.7247</li>
                                 </ul>
                             </div>
                             
                             <div class="bg-purple-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">💡 Key Concepts:</h4>
                                 <ul class="text-sm list-disc list-inside space-y-1">
                                     <li><strong>Inverse Function:</strong> Finds t-value for given probability</li>
                                     <li><strong>Critical Value:</strong> Used in confidence intervals and hypothesis tests</li>
                                     <li><strong>Area Left:</strong> Cumulative probability from -∞ to the t-value</li>
                                     <li><strong>Applications:</strong> Finding critical values for t-tests</li>
                                 </ul>
                             </div>
                         </div>
                     `
                 },
                 
                 chi2Cdf: {
                     title: 'χ²Cdf',
                     content: `
                         <div class="space-y-4">
                             <div class="bg-blue-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">📋 Example Question:</h4>
                                 <p class="text-sm">For a chi-square distribution with 8 degrees of freedom, what is the probability that χ² is between 2 and 15?</p>
                             </div>
                             
                             <div class="bg-green-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">🔧 How to Use:</h4>
                                 <ol class="text-sm list-decimal list-inside space-y-1">
                                     <li>Click "Stats Menu" → "χ²Cdf"</li>
                                     <li>Enter Lower Bound = 2</li>
                                     <li>Enter Upper Bound = 15</li>
                                     <li>Enter df = 8 (degrees of freedom)</li>
                                     <li>Click "OK" to see results</li>
                                 </ol>
                             </div>
                             
                             <div class="bg-yellow-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">📊 What You'll Get:</h4>
                                 <ul class="text-sm list-disc list-inside space-y-1">
                                     <li><strong>Probability:</strong> 0.8472 (or about 84.7%)</li>
                                 </ul>
                             </div>
                             
                             <div class="bg-purple-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">💡 Key Concepts:</h4>
                                 <ul class="text-sm list-disc list-inside space-y-1">
                                     <li><strong>Chi-Square Distribution:</strong> Always positive, right-skewed</li>
                                     <li><strong>Degrees of Freedom:</strong> Determines shape and spread</li>
                                     <li><strong>Uses:</strong> Variance tests, goodness-of-fit, independence tests</li>
                                     <li><strong>Properties:</strong> Sum of squared standard normal variables</li>
                                 </ul>
                             </div>
                         </div>
                     `
                 },
                 
                 linReg: {
                     title: 'LinReg (a+bx)',
                     content: `
                         <div class="space-y-4">
                             <div class="bg-blue-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">📋 Example Question:</h4>
                                 <p class="text-sm">A researcher wants to find the linear relationship between study hours and test scores. Data shows: Hours: [2,4,6,8,10], Scores: [65,70,75,80,85]. Find the regression equation.</p>
                             </div>
                             
                             <div class="bg-green-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">🔧 How to Use:</h4>
                                 <ol class="text-sm list-decimal list-inside space-y-1">
                                     <li>Enter your data in the spreadsheet</li>
                                     <li>Click "Stats Menu" → "LinReg (a+bx)"</li>
                                     <li>Select X column (hours) from dropdown</li>
                                     <li>Select Y column (scores) from dropdown</li>
                                     <li>Click "OK" to see results</li>
                                 </ol>
                             </div>
                             
                             <div class="bg-yellow-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">📊 What You'll Get:</h4>
                                 <ul class="text-sm list-disc list-inside space-y-1">
                                     <li><strong>Regression Equation:</strong> ŷ = 60 + 2.5x</li>
                                     <li><strong>Correlation Coefficient:</strong> r = 1.0</li>
                                     <li><strong>Coefficient of Determination:</strong> r² = 1.0</li>
                                     <li><strong>Slope:</strong> b = 2.5 (for each hour, score increases by 2.5)</li>
                                     <li><strong>Y-intercept:</strong> a = 60 (predicted score with 0 hours)</li>
                                 </ul>
                             </div>
                             
                             <div class="bg-purple-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">💡 Key Concepts:</h4>
                                 <ul class="text-sm list-disc list-inside space-y-1">
                                     <li><strong>Linear Regression:</strong> Models linear relationship between variables</li>
                                     <li><strong>Equation Form:</strong> ŷ = a + bx (y-intercept + slope × x)</li>
                                     <li><strong>Y-intercept (a):</strong> Predicted y-value when x = 0</li>
                                     <li><strong>Slope (b):</strong> Change in y for each unit increase in x</li>
                                     <li><strong>Correlation (r):</strong> Strength and direction of linear relationship (-1 to +1)</li>
                                     <li><strong>Coefficient of Determination (r²):</strong> 100% of variation in test scores is explained by the linear relationship with study hours</li>
                                     <li><strong>Prediction:</strong> Use equation to predict y for given x values</li>
                                 </ul>
                             </div>
                         </div>
                     `
                 },
                 
                 binomPdf: {
                     title: 'Binomial Pdf',
                     content: `
                         <div class="space-y-4">
                             <div class="bg-blue-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">📋 Example Question:</h4>
                                 <p class="text-sm">A fair coin is flipped 10 times. What is the probability of getting exactly 3 heads?</p>
                             </div>
                             
                             <div class="bg-green-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">🔧 How to Use:</h4>
                                 <ol class="text-sm list-decimal list-inside space-y-1">
                                     <li>Click "Stats Menu" → "Binomial Pdf"</li>
                                     <li>Enter n = 10 (number of trials)</li>
                                     <li>Enter p = 0.5 (probability of success)</li>
                                     <li>Enter k = 3 (number of successes)</li>
                                     <li>Click "OK" to see results</li>
                                 </ol>
                             </div>
                             
                             <div class="bg-yellow-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">📊 What You'll Get:</h4>
                                 <ul class="text-sm list-disc list-inside space-y-1">
                                     <li><strong>Probability:</strong> 0.1172 (or about 11.7%)</li>
                                 </ul>
                             </div>
                             
                             <div class="bg-purple-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">💡 Key Concepts:</h4>
                                 <ul class="text-sm list-disc list-inside space-y-1">
                                     <li><strong>Binomial Distribution:</strong> Models number of successes in n independent trials</li>
                                     <li><strong>Pdf:</strong> Probability Density Function - exact probability</li>
                                     <li><strong>Formula:</strong> P(X=k) = C(n,k) × p^k × (1-p)^(n-k)</li>
                                     <li><strong>Conditions:</strong> Fixed n, independent trials, constant p</li>
                                 </ul>
                             </div>
                         </div>
                     `
                 },
                 
                 binomCdf: {
                     title: 'Binomial Cdf',
                     content: `
                         <div class="space-y-4">
                             <div class="bg-blue-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">📋 Example Question:</h4>
                                 <p class="text-sm">A fair coin is flipped 10 times. What is the probability of getting 3 or fewer heads?</p>
                             </div>
                             
                             <div class="bg-green-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">🔧 How to Use:</h4>
                                 <ol class="text-sm list-decimal list-inside space-y-1">
                                     <li>Click "Stats Menu" → "Binomial Cdf"</li>
                                     <li>Enter n = 10 (number of trials)</li>
                                     <li>Enter p = 0.5 (probability of success)</li>
                                     <li>Enter k = 3 (maximum number of successes)</li>
                                     <li>Click "OK" to see results</li>
                                 </ol>
                             </div>
                             
                             <div class="bg-yellow-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">📊 What You'll Get:</h4>
                                 <ul class="text-sm list-disc list-inside space-y-1">
                                     <li><strong>Probability:</strong> 0.1719 (or about 17.2%)</li>
                                 </ul>
                             </div>
                             
                             <div class="bg-purple-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">💡 Key Concepts:</h4>
                                 <ul class="text-sm list-disc list-inside space-y-1">
                                     <li><strong>Cdf:</strong> Cumulative Distribution Function - sum of probabilities</li>
                                     <li><strong>P(X ≤ k):</strong> Probability of k or fewer successes</li>
                                     <li><strong>Uses:</strong> "At most" or "no more than" problems</li>
                                     <li><strong>Calculation:</strong> Sum of individual binomial probabilities</li>
                                 </ul>
                             </div>
                         </div>
                     `
                 },
                 
                 tcdf: {
                     title: 'tCdf',
                     content: `
                         <div class="space-y-4">
                             <div class="bg-blue-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">📋 Example Question:</h4>
                                 <p class="text-sm">For a t-distribution with 15 degrees of freedom, what is the probability that t is between -1.5 and 2.0?</p>
                             </div>
                             
                             <div class="bg-green-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">🔧 How to Use:</h4>
                                 <ol class="text-sm list-decimal list-inside space-y-1">
                                     <li>Click "Stats Menu" → "tCdf"</li>
                                     <li>Enter Lower Bound = -1.5</li>
                                     <li>Enter Upper Bound = 2.0</li>
                                     <li>Enter df = 15 (degrees of freedom)</li>
                                     <li>Click "OK" to see results</li>
                                 </ol>
                             </div>
                             
                             <div class="bg-yellow-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">📊 What You'll Get:</h4>
                                 <ul class="text-sm list-disc list-inside space-y-1">
                                     <li><strong>Probability:</strong> 0.8923 (or about 89.2%)</li>
                                 </ul>
                             </div>
                             
                             <div class="bg-purple-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">💡 Key Concepts:</h4>
                                 <ul class="text-sm list-disc list-inside space-y-1">
                                     <li><strong>t-Distribution:</strong> Similar to normal but with heavier tails</li>
                                     <li><strong>Degrees of Freedom:</strong> Affects shape - more df = closer to normal</li>
                                     <li><strong>Uses:</strong> Small samples, unknown population standard deviation</li>
                                     <li><strong>Confidence Intervals:</strong> Used for mean estimation with small samples</li>
                                 </ul>
                             </div>
                         </div>
                     `
                 },
                 
                 invT: {
                     title: 'invT',
                     content: `
                         <div class="space-y-4">
                             <div class="bg-blue-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">📋 Example Question:</h4>
                                 <p class="text-sm">For a t-distribution with 20 degrees of freedom, find the t-value that has 95% of the area to the left.</p>
                             </div>
                             
                             <div class="bg-green-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">🔧 How to Use:</h4>
                                 <ol class="text-sm list-decimal list-inside space-y-1">
                                     <li>Click "Stats Menu" → "invT"</li>
                                     <li>Enter Area Left = 0.95</li>
                                     <li>Enter df = 20 (degrees of freedom)</li>
                                     <li>Click "OK" to see results</li>
                                 </ol>
                             </div>
                             
                             <div class="bg-yellow-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">📊 What You'll Get:</h4>
                                 <ul class="text-sm list-disc list-inside space-y-1">
                                     <li><strong>t-value:</strong> 1.7247</li>
                                 </ul>
                             </div>
                             
                             <div class="bg-purple-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">💡 Key Concepts:</h4>
                                 <ul class="text-sm list-disc list-inside space-y-1">
                                     <li><strong>Inverse Function:</strong> Finds t-value for given probability</li>
                                     <li><strong>Critical Value:</strong> Used in confidence intervals and hypothesis tests</li>
                                     <li><strong>Area Left:</strong> Cumulative probability from -∞ to the t-value</li>
                                     <li><strong>Applications:</strong> Finding critical values for t-tests</li>
                                 </ul>
                             </div>
                         </div>
                     `
                 },
                 
                 chi2Cdf: {
                     title: 'χ²Cdf',
                     content: `
                         <div class="space-y-4">
                             <div class="bg-blue-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">📋 Example Question:</h4>
                                 <p class="text-sm">For a chi-square distribution with 8 degrees of freedom, what is the probability that χ² is between 2 and 15?</p>
                             </div>
                             
                             <div class="bg-green-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">🔧 How to Use:</h4>
                                 <ol class="text-sm list-decimal list-inside space-y-1">
                                     <li>Click "Stats Menu" → "χ²Cdf"</li>
                                     <li>Enter Lower Bound = 2</li>
                                     <li>Enter Upper Bound = 15</li>
                                     <li>Enter df = 8 (degrees of freedom)</li>
                                     <li>Click "OK" to see results</li>
                                 </ol>
                             </div>
                             
                             <div class="bg-yellow-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">📊 What You'll Get:</h4>
                                 <ul class="text-sm list-disc list-inside space-y-1">
                                     <li><strong>Probability:</strong> 0.8472 (or about 84.7%)</li>
                                 </ul>
                             </div>
                             
                             <div class="bg-purple-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">💡 Key Concepts:</h4>
                                 <ul class="text-sm list-disc list-inside space-y-1">
                                     <li><strong>Chi-Square Distribution:</strong> Always positive, right-skewed</li>
                                     <li><strong>Degrees of Freedom:</strong> Determines shape and spread</li>
                                     <li><strong>Uses:</strong> Variance tests, goodness-of-fit, independence tests</li>
                                     <li><strong>Properties:</strong> Sum of squared standard normal variables</li>
                                 </ul>
                             </div>
                         </div>
                     `
                 },
                 
                 twoSampTInt: {
                     title: '2-Sample t-Interval (mean)',
                     content: `
                         <div class="space-y-4">
                             <div class="bg-blue-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">📋 Example Question:</h4>
                                 <p class="text-sm">A researcher wants to estimate the difference in average test scores between two teaching methods. Method A: n₁=25, x̄₁=78, sx₁=8. Method B: n₂=30, x̄₂=82, sx₂=10. Find a 95% confidence interval for μ₁-μ₂.</p>
                             </div>
                             
                             <div class="bg-green-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">🔧 How to Use:</h4>
                                 <ol class="text-sm list-decimal list-inside space-y-1">
                                     <li>Click "Stats Menu" → "2-Sample t-Interval (mean)"</li>
                                     <li>Enter x̄₁ = 78 (first sample mean)</li>
                                     <li>Enter sx₁ = 8 (first sample std dev)</li>
                                     <li>Enter n₁ = 25 (first sample size)</li>
                                     <li>Enter x̄₂ = 82 (second sample mean)</li>
                                     <li>Enter sx₂ = 10 (second sample std dev)</li>
                                     <li>Enter n₂ = 30 (second sample size)</li>
                                     <li>Enter C-Level = 0.95</li>
                                     <li>Click "OK" to see results</li>
                                 </ol>
                             </div>
                             
                             <div class="bg-yellow-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">📊 What You'll Get:</h4>
                                 <ul class="text-sm list-disc list-inside space-y-1">
                                     <li><strong>Confidence Interval:</strong> (-8.2, 0.2)</li>
                                     <li><strong>Margin of Error:</strong> 4.2</li>
                                     <li><strong>df:</strong> 24 (degrees of freedom)</li>
                                 </ul>
                             </div>
                             
                             <div class="bg-purple-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">💡 Key Concepts:</h4>
                                 <ul class="text-sm list-disc list-inside space-y-1">
                                     <li><strong>Two-Sample:</strong> Comparing means from two independent groups</li>
                                     <li><strong>Independent Samples:</strong> No relationship between groups</li>
                                     <li><strong>Pooled vs Unpooled:</strong> This uses unpooled (Welch's) method</li>
                                     <li><strong>Interpretation:</strong> "We are 95% confident that the true difference in means is between -8.2 and 0.2."</li>
                                 </ul>
                             </div>
                         </div>
                     `
                 },
                 
                 propZInt: {
                     title: '1-Sample z-Interval (proportion)',
                     content: `
                         <div class="space-y-4">
                             <div class="bg-blue-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">📋 Example Question:</h4>
                                 <p class="text-sm">In a survey of 500 voters, 280 said they support a new policy. Find a 90% confidence interval for the true proportion of voters who support the policy.</p>
                             </div>
                             
                             <div class="bg-green-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">🔧 How to Use:</h4>
                                 <ol class="text-sm list-decimal list-inside space-y-1">
                                     <li>Click "Stats Menu" → "1-Sample z-Interval (proportion)"</li>
                                     <li>Enter x = 280 (number of successes)</li>
                                     <li>Enter n = 500 (sample size)</li>
                                     <li>Enter C-Level = 0.90</li>
                                     <li>Click "OK" to see results</li>
                                 </ol>
                             </div>
                             
                             <div class="bg-yellow-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">📊 What You'll Get:</h4>
                                 <ul class="text-sm list-disc list-inside space-y-1">
                                     <li><strong>Confidence Interval:</strong> (0.532, 0.588)</li>
                                     <li><strong>Sample Proportion:</strong> p̂ = 0.56</li>
                                     <li><strong>Margin of Error:</strong> 0.028</li>
                                 </ul>
                             </div>
                             
                             <div class="bg-purple-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">💡 Key Concepts:</h4>
                                 <ul class="text-sm list-disc list-inside space-y-1">
                                     <li><strong>Proportion:</strong> Fraction of population with characteristic</li>
                                     <li><strong>Conditions:</strong> np ≥ 10 and n(1-p) ≥ 10</li>
                                     <li><strong>Z-interval:</strong> Uses normal distribution approximation</li>
                                     <li><strong>Interpretation:</strong> "We are 90% confident that between 53.2% and 58.8% of voters support the policy."</li>
                                 </ul>
                             </div>
                         </div>
                     `
                 },
                 
                 twoPropZInt: {
                     title: '2-Sample z-Interval (proportion)',
                     content: `
                         <div class="space-y-4">
                             <div class="bg-blue-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">📋 Example Question:</h4>
                                 <p class="text-sm">Compare support for a policy between two regions. Region A: 150 out of 300 support. Region B: 200 out of 400 support. Find a 95% confidence interval for p₁-p₂.</p>
                             </div>
                             
                             <div class="bg-green-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">🔧 How to Use:</h4>
                                 <ol class="text-sm list-decimal list-inside space-y-1">
                                     <li>Click "Stats Menu" → "2-Sample z-Interval (proportion)"</li>
                                     <li>Enter x₁ = 150 (first sample successes)</li>
                                     <li>Enter n₁ = 300 (first sample size)</li>
                                     <li>Enter x₂ = 200 (second sample successes)</li>
                                     <li>Enter n₂ = 400 (second sample size)</li>
                                     <li>Enter C-Level = 0.95</li>
                                     <li>Click "OK" to see results</li>
                                 </ol>
                             </div>
                             
                             <div class="bg-yellow-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">📊 What You'll Get:</h4>
                                 <ul class="text-sm list-disc list-inside space-y-1">
                                     <li><strong>Confidence Interval:</strong> (-0.08, 0.08)</li>
                                     <li><strong>Sample Proportions:</strong> p̂₁ = 0.50, p̂₂ = 0.50</li>
                                     <li><strong>Margin of Error:</strong> 0.08</li>
                                 </ul>
                             </div>
                             
                             <div class="bg-purple-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">💡 Key Concepts:</h4>
                                 <ul class="text-sm list-disc list-inside space-y-1">
                                     <li><strong>Difference in Proportions:</strong> p₁ - p₂</li>
                                     <li><strong>Independent Samples:</strong> No relationship between groups</li>
                                     <li><strong>Conditions:</strong> Both samples meet np ≥ 10 and n(1-p) ≥ 10</li>
                                     <li><strong>Interpretation:</strong> "We are 95% confident that the difference in support is between -8% and +8%."</li>
                                 </ul>
                             </div>
                         </div>
                     `
                 },
                 
                 twoSampTTest: {
                     title: '2-Sample t-Test (mean)',
                     content: `
                         <div class="space-y-4">
                             <div class="bg-blue-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">📋 Example Question:</h4>
                                 <p class="text-sm">Test if there's a significant difference in test scores between two teaching methods. Method A: n₁=25, x̄₁=78, sx₁=8. Method B: n₂=30, x̄₂=82, sx₂=10. Use α=0.05.</p>
                             </div>
                             
                             <div class="bg-green-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">🔧 How to Use:</h4>
                                 <ol class="text-sm list-decimal list-inside space-y-1">
                                     <li>Click "Stats Menu" → "2-Sample t-Test (mean)"</li>
                                     <li>Enter x̄₁ = 78 (first sample mean)</li>
                                     <li>Enter sx₁ = 8 (first sample std dev)</li>
                                     <li>Enter n₁ = 25 (first sample size)</li>
                                     <li>Enter x̄₂ = 82 (second sample mean)</li>
                                     <li>Enter sx₂ = 10 (second sample std dev)</li>
                                     <li>Enter n₂ = 30 (second sample size)</li>
                                     <li>Select alternative: "μ₁ ≠ μ₂"</li>
                                     <li>Click "OK" to see results</li>
                                 </ol>
                             </div>
                             
                             <div class="bg-yellow-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">📊 What You'll Get:</h4>
                                 <ul class="text-sm list-disc list-inside space-y-1">
                                     <li><strong>t-statistic:</strong> -1.67</li>
                                     <li><strong>p-value:</strong> 0.1024</li>
                                     <li><strong>df:</strong> 24 (degrees of freedom)</li>
                                 </ul>
                             </div>
                             
                             <div class="bg-purple-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">💡 Key Concepts:</h4>
                                 <ul class="text-sm list-disc list-inside space-y-1">
                                     <li><strong>Null Hypothesis:</strong> H₀: μ₁ = μ₂ (no difference)</li>
                                     <li><strong>Alternative:</strong> Hₐ: μ₁ ≠ μ₂ (two-tailed test)</li>
                                     <li><strong>Decision Rule:</strong> If p < α, reject H₀</li>
                                     <li><strong>Conclusion:</strong> p = 0.1024 > 0.05, fail to reject H₀</li>
                                 </ul>
                             </div>
                         </div>
                     `
                 },
                 
                 propZTest: {
                     title: '1-Sample z-Test (proportion)',
                     content: `
                         <div class="space-y-4">
                             <div class="bg-blue-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">📋 Example Question:</h4>
                                 <p class="text-sm">A company claims 60% of customers are satisfied. In a survey of 200 customers, 110 are satisfied. Test if the true proportion differs from 60% at α=0.05.</p>
                             </div>
                             
                             <div class="bg-green-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">🔧 How to Use:</h4>
                                 <ol class="text-sm list-decimal list-inside space-y-1">
                                     <li>Click "Stats Menu" → "1-Sample z-Test (proportion)"</li>
                                     <li>Enter p₀ = 0.60 (null hypothesis proportion)</li>
                                     <li>Enter x = 110 (number of successes)</li>
                                     <li>Enter n = 200 (sample size)</li>
                                     <li>Select alternative: "p ≠ p₀"</li>
                                     <li>Click "OK" to see results</li>
                                 </ol>
                             </div>
                             
                             <div class="bg-yellow-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">📊 What You'll Get:</h4>
                                 <ul class="text-sm list-disc list-inside space-y-1">
                                     <li><strong>z-statistic:</strong> -1.44</li>
                                     <li><strong>p-value:</strong> 0.1498</li>
                                     <li><strong>Sample Proportion:</strong> p̂ = 0.55</li>
                                 </ul>
                             </div>
                             
                             <div class="bg-purple-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">💡 Key Concepts:</h4>
                                 <ul class="text-sm list-disc list-inside space-y-1">
                                     <li><strong>Null Hypothesis:</strong> H₀: p = 0.60</li>
                                     <li><strong>Alternative:</strong> Hₐ: p ≠ 0.60</li>
                                     <li><strong>Conditions:</strong> np₀ ≥ 10 and n(1-p₀) ≥ 10</li>
                                     <li><strong>Conclusion:</strong> p = 0.1498 > 0.05, fail to reject H₀</li>
                                 </ul>
                             </div>
                         </div>
                     `
                 },
                 
                 twoPropZTest: {
                     title: '2-Sample z-Test (proportion)',
                     content: `
                         <div class="space-y-4">
                             <div class="bg-blue-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">📋 Example Question:</h4>
                                 <p class="text-sm">Test if there's a significant difference in approval rates between two products. Product A: 80 out of 100 approve. Product B: 70 out of 100 approve. Use α=0.05.</p>
                             </div>
                             
                             <div class="bg-green-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">🔧 How to Use:</h4>
                                 <ol class="text-sm list-decimal list-inside space-y-1">
                                     <li>Click "Stats Menu" → "2-Sample z-Test (proportion)"</li>
                                     <li>Enter x₁ = 80 (first sample successes)</li>
                                     <li>Enter n₁ = 100 (first sample size)</li>
                                     <li>Enter x₂ = 70 (second sample successes)</li>
                                     <li>Enter n₂ = 100 (second sample size)</li>
                                     <li>Select alternative: "p₁ ≠ p₂"</li>
                                     <li>Click "OK" to see results</li>
                                 </ol>
                             </div>
                             
                             <div class="bg-yellow-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">📊 What You'll Get:</h4>
                                 <ul class="text-sm list-disc list-inside space-y-1">
                                     <li><strong>z-statistic:</strong> 1.58</li>
                                     <li><strong>p-value:</strong> 0.1142</li>
                                     <li><strong>Sample Proportions:</strong> p̂₁ = 0.80, p̂₂ = 0.70</li>
                                 </ul>
                             </div>
                             
                             <div class="bg-purple-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">💡 Key Concepts:</h4>
                                 <ul class="text-sm list-disc list-inside space-y-1">
                                     <li><strong>Null Hypothesis:</strong> H₀: p₁ = p₂</li>
                                     <li><strong>Alternative:</strong> Hₐ: p₁ ≠ p₂</li>
                                     <li><strong>Pooled Proportion:</strong> Used for standard error calculation</li>
                                     <li><strong>Conclusion:</strong> p = 0.1142 > 0.05, fail to reject H₀</li>
                                 </ul>
                             </div>
                         </div>
                     `
                 },
                 
                 chi2Test: {
                     title: 'χ²-Test (independence)',
                     content: `
                         <div class="space-y-4">
                             <div class="bg-blue-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">📋 Example Question:</h4>
                                 <p class="text-sm">Test if political party preference is independent of gender. Data: Democrats (Male: 45, Female: 55), Republicans (Male: 40, Female: 30), Independents (Male: 15, Female: 15).</p>
                             </div>
                             
                             <div class="bg-green-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">🔧 How to Use:</h4>
                                 <ol class="text-sm list-decimal list-inside space-y-1">
                                     <li>Click "Stats Menu" → "χ²-Test (independence)"</li>
                                     <li>Enter observed matrix: "45,55;40,30;15,15"</li>
                                     <li>Click "OK" to see results</li>
                                 </ol>
                             </div>
                             
                             <div class="bg-yellow-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">📊 What You'll Get:</h4>
                                 <ul class="text-sm list-disc list-inside space-y-1">
                                     <li><strong>χ²-statistic:</strong> 4.85</li>
                                     <li><strong>p-value:</strong> 0.0884</li>
                                     <li><strong>df:</strong> 2 (degrees of freedom)</li>
                                 </ul>
                             </div>
                             
                             <div class="bg-purple-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">💡 Key Concepts:</h4>
                                 <ul class="text-sm list-disc list-inside space-y-1">
                                     <li><strong>Null Hypothesis:</strong> H₀: Variables are independent</li>
                                     <li><strong>Alternative:</strong> Hₐ: Variables are dependent</li>
                                     <li><strong>Expected Counts:</strong> (row total × column total) ÷ grand total</li>
                                     <li><strong>Conditions:</strong> All expected counts ≥ 5</li>
                                 </ul>
                             </div>
                         </div>
                     `
                 },
                 
                 chi2GOFTest: {
                     title: 'χ²-GOF-Test (goodness of fit)',
                     content: `
                         <div class="space-y-4">
                             <div class="bg-blue-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">📋 Example Question:</h4>
                                 <p class="text-sm">Test if a die is fair. Rolled 60 times with results: 1(8), 2(12), 3(9), 4(11), 5(10), 6(10). Expected frequency for each is 10.</p>
                             </div>
                             
                             <div class="bg-green-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">🔧 How to Use:</h4>
                                 <ol class="text-sm list-decimal list-inside space-y-1">
                                     <li>Click "Stats Menu" → "χ²-GOF-Test (goodness of fit)"</li>
                                     <li>Enter observed: "8,12,9,11,10,10"</li>
                                     <li>Enter expected: "10,10,10,10,10,10"</li>
                                     <li>Click "OK" to see results</li>
                                 </ol>
                             </div>
                             
                             <div class="bg-yellow-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">📊 What You'll Get:</h4>
                                 <ul class="text-sm list-disc list-inside space-y-1">
                                     <li><strong>χ²-statistic:</strong> 1.4</li>
                                     <li><strong>p-value:</strong> 0.9247</li>
                                     <li><strong>df:</strong> 5 (degrees of freedom)</li>
                                 </ul>
                             </div>
                             
                             <div class="bg-purple-50 p-4 rounded">
                                 <h4 class="font-bold mb-2">💡 Key Concepts:</h4>
                                 <ul class="text-sm list-disc list-inside space-y-1">
                                     <li><strong>Null Hypothesis:</strong> H₀: Data follows expected distribution</li>
                                     <li><strong>Alternative:</strong> Hₐ: Data doesn't follow expected distribution</li>
                                     <li><strong>Expected Frequencies:</strong> Based on hypothesized distribution</li>
                                     <li><strong>Conditions:</strong> All expected frequencies ≥ 5</li>
                                 </ul>
                             </div>
                         </div>
                     `
                 }
            };
            
            return helpExamples[helpType] || null;
        },
        
        showClearConfirmModal: () => renderModal({ title: 'Confirm Clear', fields: [{ type: 'static', label: 'Clear all spreadsheet data?' }], buttons: [ { label: 'OK', action: 'clearSpreadsheet', class:'btn-primary' }, { label: 'Cancel', action: 'closeModal' } ], requiresData: false }),
        clearSpreadsheet: () => { appState.spreadsheet.columns = []; appState.spreadsheet.activeCell = { col: 0, row: 0 }; appState.spreadsheet.selectionStart = null; appState.spreadsheet.selectionEnd = null; appState.spreadsheet.isDataLoaded = false; renderSpreadsheet(); closeModal(); plotDefault(); },
        closeModal
    };
    (window as any).actions = actions;

    function showStatisticsMenu() {
        closeModal();
        
        const categories = [
            {
                title: 'Descriptive Statistics',
                color: 'bg-blue-100 border-blue-300 text-blue-800',
                items: [
                    { label: 'One-Variable Stats', action: 'show1VarStatsModal' },
                    { label: 'LinReg (a+bx)', action: 'showLinRegModal' }
                ]
            },
            {
                title: 'Probability Distributions',
                color: 'bg-green-100 border-green-300 text-green-800',
                items: [
                    { label: 'Binomial Pdf', action: 'showBinomPdfModal' },
                    { label: 'Binomial Cdf', action: 'showBinomCdfModal' },
                    { label: 'Normal Cdf', action: 'showNormalCdfModal' },
                    { label: 'Inverse Normal', action: 'showInvNormModal' },
                    { label: 'tCdf', action: 'showTCdfModal' },
                    { label: 'invT', action: 'showInvTModal' },
                    { label: 'χ²Cdf', action: 'showChi2CdfModal' }
                ]
            },
            {
                title: 'Confidence Intervals',
                color: 'bg-purple-100 border-purple-300 text-purple-800',
                items: [
                    { label: '1-Sample t-Interval (mean)', action: 'showTIntervalModalChooser' },
                    { label: '2-Sample t-Interval (mean)', action: 'show2SampTIntModal' },
                    { label: '1-Sample z-Interval (proportion)', action: 'show1PropZIntModal' },
                    { label: '2-Sample z-Interval (proportion)', action: 'show2PropZIntModal' }
                ]
            },
            {
                title: 'Significance Tests',
                color: 'bg-orange-100 border-orange-300 text-orange-800',
                items: [
                    { label: '1-Sample t-Test (mean)', action: 'showTTestModalChooser' },
                    { label: '2-Sample t-Test (mean)', action: 'show2SampTTestModal' },
                    { label: '1-Sample z-Test (proportion)', action: 'show1PropZTestModal' },
                    { label: '2-Sample z-Test (proportion)', action: 'show2PropZTestModal' },
                    { label: 'χ²-Test (independence)', action: 'showChi2TestModal' },
                    { label: 'χ²-GOF-Test (goodness of fit)', action: 'showChi2GOFTestModal' }
                ]
            }
        ];
        
        let modalHTML = `<div class="modal" id="stats-menu" style="max-width: 800px; width: 90vw;"><div class="modal-title">Stats Menu</div>`;
        
        categories.forEach(category => {
            modalHTML += `<div class="mb-6"><div class="text-sm font-semibold mb-2 ${category.color} px-3 py-1 rounded">${category.title}</div><div class="grid grid-cols-2 gap-3">`;
            category.items.forEach(item => {
                modalHTML += `<button class="btn text-sm" data-action="${item.action}">${item.label}</button>`;
            });
            modalHTML += `</div></div>`;
        });
        
        modalHTML += `<div class="modal-buttons flex justify-between items-center"><button class="btn btn-secondary" data-action="showHowToUse">How to Use?</button><button class="btn btn-primary" data-action="closeModal">Close</button></div></div>`;
        
        // Create draggable modal without backdrop
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        appState.modal = document.getElementById('stats-menu');
        
        // Make modal draggable
        if (appState.modal) {
            makeModalDraggable(appState.modal);
        }
    }
    function makeModalDraggable(modal: HTMLElement) {
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let startLeft = 0;
        let startTop = 0;
        
        // Add draggable styles
        modal.style.position = 'fixed';
        modal.style.zIndex = '1000';
        modal.style.cursor = 'move';
        modal.style.userSelect = 'none';
        
        // Add drag handle to title
        const title = modal.querySelector('.modal-title') as HTMLElement;
        if (title) {
            title.style.cursor = 'move';
            title.addEventListener('mousedown', startDrag as EventListener);
        } else {
            // Fallback: make the entire modal draggable if no title found
            modal.addEventListener('mousedown', startDrag as EventListener);
        }
        
        function startDrag(e: Event) {
            const mouseEvent = e as MouseEvent;
            isDragging = true;
            startX = mouseEvent.clientX;
            startY = mouseEvent.clientY;
            startLeft = parseInt(modal.style.left) || 0;
            startTop = parseInt(modal.style.top) || 0;
            
            document.addEventListener('mousemove', drag as EventListener);
            document.addEventListener('mouseup', stopDrag as EventListener);
            e.preventDefault();
        }
        
        function drag(e: MouseEvent) {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            modal.style.left = (startLeft + deltaX) + 'px';
            modal.style.top = (startTop + deltaY) + 'px';
        }
        
        function stopDrag() {
            isDragging = false;
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', stopDrag);
        }
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
        if (appState.game.isActive && !appState.game.isWaitingForAI) { commandHandled = handleGameAnswer(expression); }
        if (commandHandled) { /* Handled by game logic */ }
        else if (expression.startsWith("df = pd.read_csv")) {
            const match = expression.match(/'(.*?)'/);
            if (match && match[1] && datasets[match[1]]) {
                actions.clearSpreadsheet();
                datasets[match[1]]();
                renderSpreadsheet();
                appState.spreadsheet.isDataLoaded = true;
                addHistoryEntry({ input: expression });
                addHistoryEntry({ output: `Success: Sample data '${match[1]}' loaded.` });
            } else {
                 addHistoryEntry({ input: expression });
                 addHistoryEntry({ output: `Error: Dataset not found.` });
            }
            commandHandled = true;
        } else if (expression === 'df.head()') {
            if (appState.spreadsheet.isDataLoaded) {
                renderDataFrameHead();
                 addHistoryEntry({ input: expression });
                 addHistoryEntry({ output: "DataFrame head displayed in Viewer." });
            } else {
                 addHistoryEntry({ input: expression });
                 addHistoryEntry({ output: "Error: name 'df' is not defined." });
            }
            commandHandled = true;
        }
        if (!commandHandled) {
             try {
                const result = (window as any).math.evaluate(expression);
                addHistoryEntry({ input: expression });
                addHistoryEntry({ output: (window as any).math.format(result, { precision: 14 }) });
            } catch (err) {
                const qaId = `qa_${Date.now()}`;
                addHistoryEntry({ input: expression });
                addHistoryEntry({ output: "Thinking..." }, qaId);
                const historyForAI = appState.calculator.history.map((entry: any) => ({
                    role: entry.input ? 'user' : 'model',
                    content: entry.input || entry.output,
                }));
                answerQuestion({ history: historyForAI })
                    .then(response => {
                        addHistoryEntry({ output: response.answer }, qaId);
                    })
                    .catch(error => {
                        console.error("Error answering question:", error);
                        addHistoryEntry({ output: `Error: Could not process question.` }, qaId);
                    });
            }
        }
        (calculatorInput as HTMLInputElement).value = '';
    }
    function handlePaste(e: any) {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text/plain');
        const rows = pastedText.split(/\r?\n/).filter((row: any) => row.trim() !== '');
        let data = rows.map((row: any) => row.split('\t'));
        const isPivotActive = (pivotToggle as HTMLInputElement).checked;

        if (isPivotActive && data.length > 0) {
            const transposedData: any[][] = [];
            const numCols = data[0].length;
            for (let c = 0; c < numCols; c++) {
                transposedData[c] = [];
                for (let r = 0; r < data.length; r++) {
                    transposedData[c][r] = data[r][c];
                }
            }
            data = transposedData;
        }

        const { col: startCol, row: startRow } = appState.spreadsheet.activeCell;
        data.forEach((rowData: any, r: number) => {
            rowData.forEach((cellData: any, c: number) => {
                const targetRow = startRow + r;
                const targetCol = startCol + c;
                if (targetRow < 200) {
                    while (targetCol >= appState.spreadsheet.columns.length) {
                        addDataColumn(String.fromCharCode(65 + appState.spreadsheet.columns.length), []);
                    }
                    onCellChange(targetCol, targetRow, cellData);
                }
            });
        });
        renderSpreadsheet();
    }
    function onCellChange(col: any, row: any, value: any) { const numValue = parseFloat(value); appState.spreadsheet.columns[col].data[row] = isNaN(numValue) ? value : numValue; }

    // --- GAME MODE LOGIC ---
    function toggleGameMode() { appState.game.isActive = !appState.game.isActive; if (appState.game.isActive) { startGame(); } else { stopGame(); } }
    function startGame() { appState.game = { ...appState.game, isActive: true, startTime: Date.now(), questionsAnswered: 0, correctAnswers: 0, isWaitingForAI: false }; gameTimer!.classList.remove('hidden'); appState.game.timerInterval = setInterval(updateGameTimer, 1000); nextQuestion(); }
    function stopGame() { if (appState.game.timerInterval) clearInterval(appState.game.timerInterval); appState.game.isActive = false; gameDisplay!.classList.add('hidden'); gameTimer!.classList.add('hidden'); }
    function endGame() { const { correctAnswers } = appState.game; const scoreMessage = `Game Over! You scored ${correctAnswers} out of 5.`; addHistoryEntry({ input: "Game Finished" }); addHistoryEntry({ output: scoreMessage }); stopGame(); }
    function updateGameTimer() { const elapsed = Math.floor((Date.now() - appState.game.startTime) / 1000); const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0'); const seconds = (elapsed % 60).toString().padStart(2, '0'); gameTimer!.textContent = `${minutes}:${seconds}`; }
    function nextQuestion() {
        if (!appState.game.isActive) return;
        const question = statsQuestions[Math.floor(Math.random() * statsQuestions.length)];
        appState.game.question = question;
        let questionHTML = `<p class="font-bold mb-2">Question ${appState.game.questionsAnswered + 1} of 5:</p><p class="text-sm">${question.questionText}</p><div class="text-xs text-muted-foreground mt-1 mb-3">Unit: ${question.unit} | Topic: ${question.topic}</div><div class="grid grid-cols-1 gap-2 mt-4">`;
        question.answerOptions.forEach((opt: any, i: any) => {
            questionHTML += `<button class="btn text-left justify-start" data-action="answerQuestion" data-index="${i}">${String.fromCharCode(65 + i)}) ${opt.text}</button>`;
        });
        questionHTML += `</div>`;
        gameDisplay!.innerHTML = questionHTML;
        gameDisplay!.classList.remove('hidden');
    }
    
    function handleGameAnswer(answerIndex: any) {
        const { question } = appState.game;
        const selectedOption = question.answerOptions[answerIndex];
        const correctAnswer = question.answerOptions.find((opt: any) => opt.isCorrect).text;
        
        const explanationId = `explanation_${Date.now()}`;
        addHistoryEntry({ 
            input: `Q${appState.game.questionsAnswered + 1}: ${selectedOption.text}`
        });
        addHistoryEntry({ 
            output: selectedOption.isCorrect ? 'Correct!' : `Correct Answer: ${correctAnswer}`,
            explanation: "Generating explanation with EXAONE..." 
        }, explanationId);

        // Fire off AI request but don't wait for it
        const explanationRequest: ExplanationRequest = {
            question: question.questionText,
            options: question.answerOptions.map((o: any) => o.text),
            userAnswer: selectedOption.text,
            correctAnswer: correctAnswer,
        };

        generateExplanation(explanationRequest).then(explanation => {
            let explanationHTML = `<div class="calc-explanation">
                <p class="font-bold text-lg mb-2">${explanation.isCorrect ? 'Correct! ✅' : 'Not quite... 🤔'}</p>
                <p class="font-bold text-base mb-2">${explanation.concept}</p>
                <p class="font-semibold mt-3 mb-1">How to solve:</p>
                <ul class="list-disc pl-5 space-y-1">
                    ${explanation.steps.map(step => `<li>${step}</li>`).join('')}
                </ul>
                <p class="font-semibold mt-3 mb-1">Why other options are incorrect:</p>
                 <ul class="list-disc pl-5 space-y-1">
                    ${explanation.distractors.map(d => `<li>${d}</li>`).join('')}
                </ul>
                <p class="font-semibold mt-3 mb-1">Key Takeaway:</p>
                <p class="italic">${explanation.summary}</p>
            </div>`;

            // Update the specific history entry with the real explanation
            addHistoryEntry({ 
                output: explanation.isCorrect ? 'Correct!' : `Correct Answer: ${correctAnswer}`,
                explanation: explanationHTML 
            }, explanationId);

        }).catch(error => {
            console.error("Error generating explanation:", error);
            addHistoryEntry({ 
                output: 'Error generating explanation.' 
            }, explanationId);
        });

        if (selectedOption.isCorrect) {
            appState.game.correctAnswers++;
        }

        appState.game.questionsAnswered++;
        if (appState.game.questionsAnswered >= 5) {
            endGame();
        } else {
            nextQuestion();
        }
        return true; 
    }

    actions.answerQuestion = (event: any) => { const index = event.target.dataset.index; handleGameAnswer(index); };

    // --- OTHER UTILS ---
    function renderDataFrameHead() { let tableHTML = '<div class="dataframe-table"><thead><tr>'; appState.spreadsheet.columns.forEach((col: any) => { if(col.name && !col.name.match(/^[A-Z]$/)) tableHTML += `<th>${col.name}</th>`; }); tableHTML += '</tr></thead><tbody>'; for (let i = 0; i < 5; i++) { tableHTML += '<tr>'; appState.spreadsheet.columns.forEach((col: any) => { if(col.name && !col.name.match(/^[A-Z]$/)) tableHTML += `<td>${col.data[i] || ''}</td>`; }); tableHTML += '</tr>'; } tableHTML += '</tbody></table>'; graphPlotDiv!.innerHTML = tableHTML; }
    
    function setCalculatorDraggable(isDraggable: boolean) {
        const display = calculatorDisplay!;
        display.setAttribute('draggable', isDraggable.toString());
    }
    
    function setGraphDraggable(isDraggable: boolean) {
        if (isDraggable && graphPlotDiv!.querySelector('.js-plotly-plot')) {
            graphPlotDiv!.setAttribute('draggable', 'true');
        } else {
            graphPlotDiv!.setAttribute('draggable', 'false');
        }
    }

    // --- INITIALIZATION ---
    function init() {
      if (!menuBtn || !clearBtn || !spreadsheetContainer || !calculatorInput || !calculatorEnterBtn || !gameModeBtn || !exportCalcToggle || !exportGraphToggle || !graphPlotDiv || !graphingPanel || !graphContextMenu || !calculatorDisplay) {
        return;
      }
        // Event Listeners
        menuBtn.addEventListener('click', showStatisticsMenu);
        clearBtn.addEventListener('click', actions.showClearConfirmModal);
        document.body.addEventListener('click', handleAction);
        spreadsheetContainer.addEventListener('mousedown', (e) => { if (!(e.target as HTMLElement).matches('td, th[data-col]')) return; const col = parseInt((e.target as HTMLElement).dataset.col!); const row = parseInt((e.target as HTMLElement).dataset.row!); if (isNaN(col) || isNaN(row)) return; appState.spreadsheet.isEditing = false; appState.spreadsheet.activeCell = { col, row }; appState.spreadsheet.isSelecting = true; appState.spreadsheet.selectionStart = { col, row }; appState.spreadsheet.selectionEnd = { col, row }; renderSpreadsheet(); });
        spreadsheetContainer.addEventListener('mousemove', (e) => { if (!appState.spreadsheet.isSelecting || !(e.target as HTMLElement).matches('td, th[data-col]')) return; const col = parseInt((e.target as HTMLElement).dataset.col!); const row = parseInt((e.target as HTMLElement).dataset.row!); if (isNaN(col) || isNaN(row)) return; if (appState.spreadsheet.selectionEnd.col !== col || appState.spreadsheet.selectionEnd.row !== row) { appState.spreadsheet.selectionEnd = { col, row }; renderSpreadsheet(); } });
        document.addEventListener('mouseup', () => { appState.spreadsheet.isSelecting = false; });
        spreadsheetContainer.addEventListener('dblclick', (e) => { 
          if((e.target as HTMLElement).matches('td, th[data-col]')) {
              const { col, row } = appState.spreadsheet.activeCell;
              appState.spreadsheet.isEditing = true;
              if (row === -1) {
                  appState.spreadsheet.editValue = appState.spreadsheet.columns[col]?.name || '';
              } else {
                  appState.spreadsheet.editValue = appState.spreadsheet.columns[col]?.data[row] || '';
              }
              renderSpreadsheet(); 
            }
        });
        spreadsheetContainer.addEventListener('paste', handlePaste);
        calculatorInput.addEventListener('keydown', (e) => { if(e.key === 'Enter') handleCalculatorInput(); });
        calculatorEnterBtn.addEventListener('click', handleCalculatorInput);
        gameModeBtn.addEventListener('click', toggleGameMode);

        exportCalcToggle.addEventListener('change', (e) => {
            const isChecked = (e.target as HTMLInputElement).checked;
            setCalculatorDraggable(isChecked);
        });
        
        exportGraphToggle!.addEventListener('change', (e) => {
            const isChecked = (e.target as HTMLInputElement).checked;
            if (isChecked) {
                 if (graphPlotDiv!.querySelector('.js-plotly-plot')) {
                    (window as any).Plotly.toImage(graphPlotDiv, { format: 'png', width: 800, height: 600 }).then((dataUrl: any) => {
                        graphPlotDiv!.setAttribute('data-img-url', dataUrl);
                        graphPlotDiv!.setAttribute('draggable', 'true');
                    });
                }
            } else {
                 graphPlotDiv!.setAttribute('draggable', 'false');
                 graphPlotDiv!.removeAttribute('data-img-url');
            }
        });

        graphPlotDiv.addEventListener('dragstart', (e: DragEvent) => {
            if (graphPlotDiv!.getAttribute('draggable') !== 'true') {
                e.preventDefault();
                return;
            }
            const dataUrl = graphPlotDiv!.getAttribute('data-img-url');
            if (dataUrl) {
                e.dataTransfer!.setData('text/uri-list', dataUrl);
                e.dataTransfer!.setData('text/plain', dataUrl);
            } else {
                e.preventDefault();
            }
        });

        calculatorDisplay.addEventListener('dragstart', (e: DragEvent) => {
            if ((exportCalcToggle as HTMLInputElement).checked) {
                let textHistory = "Wonjae's AP Stat Lab - Console History\n=========================================\n\n";
                appState.calculator.history.slice().reverse().forEach((entry: any) => {
                    textHistory += `> ${entry.input}\n${entry.output}\n`;
                    if (entry.explanation) {
                        textHistory += `\n[Explanation]\n${entry.explanation.replace(/<br>/g, "\n")}\n`;
                    }
                    textHistory += "\n-----------------------------------------\n";
                });
                e.dataTransfer!.setData('text/plain', textHistory);
                e.dataTransfer!.effectAllowed = 'copy';
            } else {
                e.preventDefault();
            }
        });

        spreadsheetContainer.addEventListener('dragstart', (e: DragEvent) => { if (!(e.target as HTMLElement).matches('th.col-header.in-selection')) { e.preventDefault(); return; } const { selectionStart, selectionEnd } = appState.spreadsheet; const minCol = Math.min(selectionStart!.col, selectionEnd!.col); const maxCol = Math.max(selectionEnd!.col, selectionStart!.col); let colIndices: number[] = []; for (let i = minCol; i <= maxCol; i++) { if(appState.spreadsheet.columns[i]?.name) colIndices.push(i); } if (colIndices.length === 0 || colIndices.length > 2) { showMessageModal("Drag one or two NAMED columns to plot."); e.preventDefault(); return; } e.dataTransfer!.setData('application/json', JSON.stringify(colIndices)); e.dataTransfer!.effectAllowed = 'copy'; });
        graphingPanel.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer!.dropEffect = 'copy'; graphingPanel!.classList.add('drag-over'); });
        graphingPanel.addEventListener('dragleave', () => { graphingPanel!.classList.remove('drag-over'); });
        graphingPanel.addEventListener('drop', (e: DragEvent) => { e.preventDefault(); graphingPanel!.classList.remove('drag-over'); const colIndices = JSON.parse(e.dataTransfer!.getData('application/json')); showPlotTypeMenu(colIndices); });
        graphContextMenu.addEventListener('click', (e) => { if ((e.target as HTMLElement).matches('[data-plottype]')) { const type = (e.target as HTMLElement).dataset.plottype; if (appState.graphing.pendingPlot) { const { indices } = appState.graphing.pendingPlot; if (type === 'histogram') plotHistogram(indices[0]); else if (type === 'boxplot') plotBoxPlot(indices[0]); else if (type === 'scatter') plotScatter(indices[0], indices[1]); else if (type === 'dotplot') plotDotPlot(indices[0]); else if (type === 'stemleaf') generateStemAndLeaf(indices[0]); } graphContextMenu!.classList.add('hidden'); appState.graphing.pendingPlot = null; } });
        graphContextMenu.addEventListener('dragover', (e) => { e.preventDefault(); e.stopPropagation(); });
        graphContextMenu.addEventListener('drop', (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); const newlyDroppedIndices = JSON.parse(e.dataTransfer!.getData('application/json')); const existingIndices = appState.graphing.pendingPlot.indices; const combined = [...new Set([...existingIndices, ...newlyDroppedIndices])]; if (combined.length > 2) { showMessageModal("You can only plot up to two variables."); return; } showPlotTypeMenu(combined); });

        // Initial render
        addHistoryEntry({ 
            output: `Welcome to Wonjae's AP Stat Lab! <br>
                     <span class="text-sm">Enter expressions, import data, or use the menu to start.</span>
                     <div class="text-xs text-muted-foreground mt-2">&gt; To import sample data, copy and run this command in the console below: <code class="bg-muted px-1 py-0.5 rounded">df = pd.read_csv('lab_data_1.csv')</code></div>`
        });
        renderCalculator();
        renderSpreadsheet();
        plotDefault();
    }

    init();
  }, [isClient]);

  return (
    <>
      <div className="main-grid">
        <div id="importer" className="panel">
            <div className="panel-content flex items-center">
                <div className="flex items-center">
                    <span className="text-4xl font-bold text-primary" style={{fontFamily: "'Source Code Pro', monospace"}}>1J</span>
                    <h1 className="text-4xl font-semibold ml-4">AP Stat Lab</h1>
                </div>
            </div>
        </div>
        
        <div id="calculator" className="panel">
            <div className="panel-header">
                <h2 className="panel-title">Calculator / Console</h2>
                <div id="game-controls" className="flex items-center gap-2">
                    <span id="game-timer" className="font-mono text-sm bg-background px-2 py-1 rounded-md hidden">00:00</span>
                     <div className="export-toggle">
                        <span>Export</span>
                        <label className="switch">
                            <input type="checkbox" id="export-calc-toggle"/>
                            <span className="slider round"></span>
                        </label>
                    </div>
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
                 <div className="export-toggle">
                    <span>Export</span>
                    <label className="switch">
                        <input type="checkbox" id="export-graph-toggle"/>
                        <span className="slider round"></span>
                    </label>
                </div>
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
                     <div className="export-toggle">
                        <span>Pivot</span>
                        <label className="switch">
                            <input type="checkbox" id="pivot-toggle"/>
                            <span className="slider round"></span>
                        </label>
                    </div>
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
            grid-template-rows: 100px minmax(0, 2fr) minmax(0, 1.5fr);
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
        #calculator-display[draggable="true"] { cursor: grab; }
        .calculator-display { display: flex; flex-direction: column; }
        .calc-entry { margin-bottom: 1rem; }
        .calc-input { color: hsl(var(--muted-foreground)); word-break: break-all; }
        .calc-output { text-align: left; font-size: 1rem; color: hsl(var(--foreground)); white-space: pre-wrap; word-break: break-all; }
        .calc-explanation {
            font-family: 'Inter', sans-serif; font-size: 0.8rem; color: hsl(var(--muted-foreground));
            background-color: hsl(var(--accent)); padding: 0.75rem; border-radius: 0.375rem;
            margin-top: 0.5rem; white-space: pre-wrap; border-left: 3px solid hsl(var(--primary));
            text-align: left;
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
          width: 100%;
          height: 100%;
        }
        #graph-plot[draggable="true"] { cursor: grab; }
        #graph-context-menu {
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background-color: hsla(var(--card), 0.9); backdrop-filter: blur(8px);
            border-radius: 0.75rem; border: 1px solid hsl(var(--border)); padding: 1.5rem; z-index: 100;
            display: flex; flex-direction: column; gap: 1rem; box-shadow: 0 10px 20px rgba(0,0,0,0.1); text-align: center;
        }
        .context-menu-title { font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem; }
        .context-menu-subtitle { font-size: 0.875rem; color: hsl(var(--muted-foreground)); }
        .context-menu-options { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 1rem; justify-content: center;}
        #graphing.drag-over { border-color: hsl(var(--primary)); box-shadow: 0 0 15px 0 hsla(var(--primary), 0.5); }
        .stem-and-leaf-plot { font-family: 'Source Code Pro', monospace; padding: 1rem; text-align: left; background-color: hsl(var(--secondary)); border-radius: 0.5rem; height: 100%; overflow: auto; }
        .stem-and-leaf-title { font-family: 'Inter', sans-serif; font-weight: 600; font-size: 1.125rem; margin-bottom: 1rem; }

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
        
        .export-toggle { display: flex; align-items: center; gap: 0.5rem; color: hsl(var(--muted-foreground)); font-size: 0.875rem;}
        .switch { position: relative; display: inline-block; width: 34px; height: 20px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: hsl(var(--secondary)); transition: .4s; }
        .slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px; background-color: white; transition: .4s; }
        input:checked + .slider { background-color: hsl(var(--primary)); }
        input:checked + .slider:before { transform: translateX(14px); }
        .slider.round { border-radius: 20px; }
        .slider.round:before { border-radius: 50%; }

        .dataframe-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; font-family: 'Inter', sans-serif; background-color: hsl(var(--secondary)); border-radius: 0.5rem; overflow: hidden; }
        .dataframe-table th, .dataframe-table td { border: 1px solid hsl(var(--border)); padding: 0.5rem; text-align: left; }
        .dataframe-table th { background-color: hsl(var(--muted)); font-weight: 600; }
       `}</style>
    </>
  );
}
