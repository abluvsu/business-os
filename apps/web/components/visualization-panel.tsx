"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { Info, BarChart2, TrendingUp, Sparkles } from "lucide-react";

export interface ChartConfig {
  title: string;
  type: string;
  categories: string[];
  series: Array<{
    name: string;
    data: number[];
  }>;
}

interface VisualizationPanelProps {
  chart: ChartConfig | null;
  recommendations: string[];
}

export default function VisualizationPanel({ chart, recommendations }: VisualizationPanelProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current || !chart) {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
      return;
    }

    // Initialize ECharts instance
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, "dark");
    }

    // Define premium styling options matching the theme
    const option: echarts.EChartsOption = {
      backgroundColor: "transparent",
      title: {
        text: chart.title,
        textStyle: {
          color: "#f4f4f5",
          fontFamily: "var(--font-sans), sans-serif",
          fontSize: 14,
          fontWeight: "bold",
        },
        left: "center",
        top: 10,
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(9, 9, 11, 0.9)",
        borderColor: "rgba(255, 255, 255, 0.1)",
        textStyle: {
          color: "#f4f4f5",
        },
        axisPointer: {
          type: "shadow",
        },
      },
      grid: {
        left: "4%",
        right: "4%",
        bottom: "8%",
        top: "22%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: chart.categories,
        axisLine: {
          lineStyle: {
            color: "rgba(255, 255, 255, 0.1)",
          },
        },
        axisLabel: {
          color: "#a1a1aa",
          fontSize: 10,
          interval: 0,
          rotate: 15,
        },
      },
      yAxis: {
        type: "value",
        splitLine: {
          lineStyle: {
            color: "rgba(255, 255, 255, 0.05)",
          },
        },
        axisLabel: {
          color: "#a1a1aa",
          formatter: "{value}%",
        },
      },
      series: chart.series.map((s) => ({
        name: s.name,
        type: chart.type as any,
        data: s.data,
        barWidth: "40%",
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "#a78bfa" }, // Violet
            { offset: 1, color: "#3b82f6" }, // Blue
          ]),
          borderRadius: [4, 4, 0, 0],
        },
      })),
    };

    chartInstance.current.setOption(option);

    // Resize handler
    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [chart]);

  // Render Empty State if no chart data
  if (!chart) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400">
          <BarChart2 className="h-8 w-8 animate-pulse" />
        </div>
        <div className="space-y-1.5 max-w-sm">
          <h3 className="text-sm font-semibold text-neutral-200 font-mono">VISUALIZATION BOARD</h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Talk to Business OS. When you ask questions about campaigns or performance metrics, interactive visual charts and insights will populate here automatically.
          </p>
        </div>
        
        <div className="w-full max-w-xs border border-white/5 bg-white/2 rounded-xl p-4 text-left space-y-2.5">
          <p className="text-[10px] font-mono text-neutral-600 font-bold uppercase tracking-wider">Try asking:</p>
          <div className="space-y-1.5 text-xs text-neutral-400">
            <div className="flex items-start gap-2">
              <span className="text-neutral-600 font-mono">•</span>
              <span>"How are my last 5 campaigns?"</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-neutral-600 font-mono">•</span>
              <span>"Which ads have the highest CTR?"</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Chart & Recommendations
  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto">
      {/* Chart Canvas Container */}
      <div className="w-full h-80 rounded-xl bg-white/3 border border-white/5 p-3 shadow-lg relative">
        <div ref={chartRef} className="w-full h-full" />
      </div>

      {/* Recommendations Card */}
      {recommendations.length > 0 && (
        <div className="rounded-xl border border-white/5 bg-[#0a0a0c] p-5 space-y-4 shadow-md">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Sparkles className="h-4 w-4 text-yellow-400" />
            <h3 className="text-sm font-semibold font-mono text-neutral-200">AI Recommendations</h3>
          </div>

          <div className="space-y-3">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-neutral-400 leading-relaxed">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
