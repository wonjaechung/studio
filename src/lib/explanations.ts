
export function getExplanation(type: string, data: any): string {
    switch (type) {
        case '1VarStats':
            return `Calculated one-variable statistics for the list '${data.listName}'.
x̄: The sample mean.
Sx: The sample standard deviation.`;
        case 'LinReg':
            return `Calculated the least-squares regression line for Y='${data.yListName}' vs. X='${data.xListName}'.
a: The y-intercept.
b: The slope.
r²: The coefficient of determination.
r: The correlation coefficient.`;
        case 'tTest':
            return `Performed a t-test.
μ₀: Null hypothesis mean.
t: The calculated test statistic.
p: The p-value.
df: Degrees of freedom.`;
        case 'tInterval':
             return `Constructed a t-confidence interval.
(${data.lower.toFixed(4)}, ${data.upper.toFixed(4)}): The interval.
ME: Margin of Error.
x̄: The sample mean.
df: Degrees of freedom.`;
        default:
            return 'A statistical calculation was performed.';
    }
}
