
// A simple math expression evaluator
// In a real app, use a safer, more robust library like math.js
export function evaluate(expression: string): number {
    // This is a very unsafe evaluator. For demo purposes only.
    return new Function('return ' + expression)();
}

export const sum = (arr: number[]): number => arr.reduce((acc, val) => acc + val, 0);

export const mean = (arr: number[]): number => sum(arr) / arr.length;

export const stddev = (arr: number[], isPopulation: boolean = false): number => {
    if (arr.length < 2) return 0;
    const meanVal = mean(arr);
    const sqDiffs = arr.map(val => Math.pow(val - meanVal, 2));
    const variance = sum(sqDiffs) / (arr.length - (isPopulation ? 0 : 1));
    return Math.sqrt(variance);
};

export const median = (arr: number[]): number => {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

export const quartile = (arr: number[], q: number): number => {
    const sorted = [...arr].sort((a, b) => a - b);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
        return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    }
    return sorted[base];
};

export const linearRegression = (xData: number[], yData: number[]) => {
    const n = Math.min(xData.length, yData.length);
    const sumX = sum(xData);
    const sumY = sum(yData);
    const sumXY = sum(xData.map((x, i) => x * yData[i]));
    const sumX2 = sum(xData.map(x => x * x));
    const sumY2 = sum(yData.map(y => y * y));
    const b = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const a = (sumY / n) - b * (sumX / n);
    const rNumerator = (n * sumXY - sumX * sumY);
    const rDenominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    const r = rDenominator === 0 ? 0 : rNumerator / rDenominator;
    const residuals = xData.map((x, i) => yData[i] - (a + b * x));
    const s = Math.sqrt(sum(residuals.map(res => res * res)) / (n - 2));
    const sx = stddev(xData);
    const seSlope = sx === 0 ? Infinity : s / (sx * Math.sqrt(n - 1));

    return { a, b, r, residuals, seSlope };
};

// --- Probability Functions ---
function combinations(n: number, k: number): number {
    if (k < 0 || k > n) return 0;
    if (k === 0 || k === n) return 1;
    if (k > n / 2) k = n - k;
    let res = 1;
    for (let i = 1; i <= k; i++) {
        res = res * (n - i + 1) / i;
    }
    return Math.round(res);
}

export function binomialPdf(n: number, p: number, k: number): number {
    return combinations(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

// Stubs for other probability functions used in MainApp.tsx
// These will need to be implemented fully to work.
export const normalCdf = (lower: number, upper: number, mean: number, std: number): number => {
    // This is a placeholder implementation
    return 0.5; 
};

export const invNorm = (area: number, mean: number, std: number): number => {
    // This is a placeholder implementation
    return mean;
};

export const tInterval = (mean: number, sx: number, n: number, cLevel: number) => {
    // This is a placeholder implementation
    return { lower: mean - 0.1, upper: mean + 0.1, me: 0.1 };
};

export const tTest = (mu0: number, mean: number, sx: number, n: number, alt: string) => {
    // This is a placeholder implementation
    return { tStat: 1.96, pVal: 0.05, df: n - 1 };
};
