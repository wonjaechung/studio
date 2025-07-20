"use client";

import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';

interface PlotlyChartProps {
  data: Plotly.Data[];
  layout: Partial<Plotly.Layout>;
}

const baseLayout: Partial<Plotly.Layout> = {
    paper_bgcolor: 'hsl(var(--card))',
    plot_bgcolor: 'hsl(var(--card))',
    font: { color: 'hsl(var(--foreground))' },
    xaxis: { 
        gridcolor: 'hsl(var(--border))', 
        zerolinecolor: 'hsl(var(--muted-foreground))' 
    },
    yaxis: { 
        gridcolor: 'hsl(var(--border))', 
        zerolinecolor: 'hsl(var(--muted-foreground))'
    },
    margin: { l: 50, r: 20, b: 40, t: 40 },
    showlegend: false,
};

export function PlotlyChart({ data, layout }: PlotlyChartProps) {
  const chartDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartDiv.current) {
      const fullLayout = { ...baseLayout, ...layout };
      Plotly.react(chartDiv.current, data, fullLayout, { responsive: true });
    }
  }, [data, layout]);

  return <div ref={chartDiv} className="w-full h-full" />;
}
