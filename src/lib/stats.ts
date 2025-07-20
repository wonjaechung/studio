import * as math from 'mathjs';

function invNorm(p: number): number {
    if (p <= 0 || p >= 1) return NaN;
    const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
    const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
    const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
    const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
    const p_low = 0.02425;
    const p_high = 1 - p_low;
    let q, x;
    if (p < p_low) {
        q = Math.sqrt(-2 * Math.log(p));
        x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    } else if (p <= p_high) {
        q = p - 0.5;
        let r = q * q;
        x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
    } else {
        q = Math.sqrt(-2 * Math.log(1 - p));
        x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }
    return x;
}

// Low-level gamma function needed for chi-square cdf
function logGamma(x: number) {
    let tmp = (x - 0.5) * Math.log(x + 4.5) - (x + 4.5);
    let ser = 1.0 + 76.18009173 / (x + 0) - 86.50532033 / (x + 1)
            + 24.01409822 / (x + 2) - 1.231739516 / (x + 3)
            + 0.00120858003 / (x + 4) - 0.00000536382 / (x + 5);
    return tmp + Math.log(ser * Math.sqrt(2 * Math.PI));
}

function incompleteGamma(s: number, x: number) {
    if (x < 0) return 0;
    const gln = logGamma(s);
    let ap = s;
    let sum = 1 / s;
    let del = sum;
    for (let n = 1; n < 100; n++) {
        ap += 1;
        del = del * x / ap;
        sum += del;
        if (Math.abs(del) < Math.abs(sum) * 1e-7) {
            return sum * Math.exp(-x + s * Math.log(x) - gln);
        }
    }
    return sum * Math.exp(-x + s * Math.log(x) - gln);
}

export const stats = {
    sum: (arr: number[]) => arr.reduce((acc, val) => acc + val, 0),
    mean: (arr: number[]) => arr.length === 0 ? 0 : stats.sum(arr) / arr.length,
    stddev: (arr: number[], isPopulation = false) => {
        if (arr.length < 2) return 0;
        const meanVal = stats.mean(arr);
        const sqDiffs = arr.map(val => Math.pow(val - meanVal, 2));
        const variance = stats.sum(sqDiffs) / (arr.length - (isPopulation ? 0 : 1));
        return Math.sqrt(variance);
    },
    median: (arr: number[]) => {
        if (arr.length === 0) return 0;
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    },
    quartile: (arr: number[], q: number) => {
        if (arr.length === 0) return 0;
        const sorted = [...arr].sort((a, b) => a - b);
        const pos = (sorted.length - 1) * q;
        const base = Math.floor(pos);
        const rest = pos - base;
        if (sorted[base + 1] !== undefined) return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
        return sorted[base];
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
    geometricPdf: (p: number, k: number) => Math.pow(1 - p, k - 1) * p,
    normalCdf: (lower: number, upper: number, mean: number, std: number) => (math.erf((upper - mean) / (std * Math.sqrt(2))) - math.erf((lower - mean) / (std * Math.sqrt(2)))) / 2,
    invNorm: (p: number, mean: number, std: number) => mean + std * invNorm(p),
    invT: (p: number, df: number) => {
        const z = invNorm(p);
        if (isNaN(z)) return NaN;
        const z2 = z * z;
        const g1 = (z2 * z + z) / 4;
        const g2 = (5 * z2 * z2 * z + 16 * z2 * z + 3 * z) / 96;
        const g3 = (3 * z2 * z2 * z2 * z + 19 * z2 * z2 * z + 17 * z2 * z - 15 * z) / 384;
        return z + (g1 / df) + (g2 / (df * df)) + (g3 / (df * df * df));
    },
    tCdf: (t: number, df: number) => {
        let x = df / (t * t + df);
        function incompleteBeta(x: number, a: number, b: number): number {
            if (x <= 0) return 0;
            if (x >= 1) return 1;
            const gammaln = (n: number) => (math.log((math.gamma as (n: number) => number)(n)) as number);
            const bt = Math.exp(gammaln(a + b) - gammaln(a) - gammaln(b) + a * Math.log(x) + b * Math.log(1 - x));
            if (x < (a + 1) / (a + b + 2)) {
                return bt * continuedFraction(x, a, b) / a;
            } else {
                return 1 - bt * continuedFraction(1 - x, b, a) / b;
            }
        }
        function continuedFraction(x: number, a: number, b: number): number {
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
    linReg: (xData: number[], yData: number[]) => {
        const n = xData.length;
        const sumX = stats.sum(xData);
        const sumY = stats.sum(yData);
        const sumXY = stats.sum(xData.map((x, i) => x * yData[i]));
        const sumX2 = stats.sum(xData.map(x => x*x));
        const b = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const a = (sumY / n) - b * (sumX / n);
        const r = math.corr(xData, yData) as number;
        return { a, b, r };
    },
    chi2cdf: (x: number, df: number) => {
        if (x < 0 || df <= 0) return 0;
        return incompleteGamma(df / 2, x / 2);
    }
};
