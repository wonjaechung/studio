"use client";

import React, { useEffect, useRef } from 'react';
import type Plotly from 'plotly.js-dist-min';

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
  const PlotlyRef = useRef<typeof Plotly | null>(null);

  useEffect(() => {
    import('plotly.js-dist-min').then(PlotlyModule => {
      PlotlyRef.current = PlotlyModule;
      if (chartDiv.current && PlotlyRef.current) {
        const fullLayout = { ...baseLayout, ...layout };
        PlotlyRef.current.react(chartDiv.current, data, fullLayout, { responsive: true });
      }
    });
  }, [data, layout]);

  useEffect(() => {
    // This is to handle window resize
    const resizeHandler = () => {
      if (chartDiv.current && PlotlyRef.current) {
        PlotlyRef.current.Plots.resize(chartDiv.current);
      }
    };
    window.addEventListener('resize', resizeHandler);
    return () => window.removeEventListener('resize', resizeHandler);
  }, []);

  return <div ref={chartDiv} className="w-full h-full" />;
}
