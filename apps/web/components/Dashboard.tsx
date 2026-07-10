"use client";

import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { BarChart3, Database, Layers, TrendingUp } from "lucide-react";

interface DashboardProps {
  apiBase: string;
  refreshTrigger: number;
}

export function Dashboard({ apiBase, refreshTrigger }: DashboardProps) {
  const [entities, setEntities] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  // Fetch live database values from the local Fastify backend
  const fetchLiveData = async () => {
    try {
      const res = await fetch(`${apiBase}/api/dev/entities`);
      if (res.ok) {
        const data = await res.json();
        setEntities(data.entities || []);
        setMetrics(data.metrics || []);
      }
    } catch (err) {
      console.error("❌ Failed to fetch local workspace data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveData();
  }, [apiBase, refreshTrigger]);

  // ECharts visualization rendering
  useEffect(() => {
    if (!chartRef.current || metrics.length === 0) {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
      return;
    }

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, "dark");
    }

    // Group observations by date and sum their values for the chart
    const dailyData: Record<string, number> = {};
    metrics.forEach((m) => {
      const day = m.date ? m.date.slice(0, 10) : "N/A";
      dailyData[day] = (dailyData[day] || 0) + (Number(m.value) || 0);
    });

    const dates = Object.keys(dailyData).sort();
    const values = dates.map((d) => dailyData[d]);

    const option: echarts.EChartsOption = {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(9, 9, 11, 0.95)",
        borderColor: "rgba(255, 255, 255, 0.1)",
        textStyle: { color: "#f4f4f5" },
      },
      grid: {
        left: "4%",
        right: "4%",
        bottom: "10%",
        top: "15%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: dates,
        axisLine: { lineStyle: { color: "#27272a" } },
        axisLabel: { color: "#a1a1aa", fontSize: 10 },
      },
      yAxis: {
        type: "value",
        splitLine: { lineStyle: { color: "#18181b" } },
        axisLabel: { color: "#a1a1aa", fontSize: 10 },
      },
      series: [
        {
          name: "Observations Value",
          type: "bar",
          data: values,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "#38bdf8" },
              { offset: 1, color: "#0369a1" },
            ]),
            borderRadius: [4, 4, 0, 0],
          },
        },
      ],
    };

    chartInstance.current.setOption(option);

    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [metrics]);

  if (loading) {
    return (
      <div className="bg-[#0b0c10] border border-neutral-800 rounded-xl p-8 flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  // Aggregate stats directly from database arrays
  const totalObservationsCount = metrics.length;
  const sumObservationValues = metrics.reduce(
    (acc, m) => acc + (Number(m.value) || 0),
    0,
  );
  const activeEntitiesCount = entities.length;

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0b0c10] border border-neutral-800 rounded-xl p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-neutral-400 uppercase">
              Active Entities
            </p>
            <h3 className="text-3xl font-bold font-mono tracking-tight mt-1">
              {activeEntitiesCount}
            </h3>
          </div>
          <Layers className="h-10 w-10 text-sky-400 opacity-60" />
        </div>

        <div className="bg-[#0b0c10] border border-neutral-800 rounded-xl p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-neutral-400 uppercase">
              Total Observations
            </p>
            <h3 className="text-3xl font-bold font-mono tracking-tight mt-1">
              {totalObservationsCount}
            </h3>
          </div>
          <Database className="h-10 w-10 text-sky-400 opacity-60" />
        </div>

        <div className="bg-[#0b0c10] border border-neutral-800 rounded-xl p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-neutral-400 uppercase">
              Total Metric Value
            </p>
            <h3 className="text-3xl font-bold font-mono tracking-tight mt-1">
              {sumObservationValues.toLocaleString()}
            </h3>
          </div>
          <TrendingUp className="h-10 w-10 text-emerald-400 opacity-60" />
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-[#0b0c10] border border-neutral-800 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <BarChart3 className="h-5 w-5 text-sky-400" />
          <h4 className="text-sm font-bold font-mono tracking-wide uppercase text-neutral-200">
            Chronological Aggregations
          </h4>
        </div>

        {metrics.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[220px] text-neutral-500 font-mono text-xs border border-dashed border-neutral-800 rounded-lg">
            <span>
              No metrics recorded. Connect a provider and verify data sync.
            </span>
          </div>
        ) : (
          <div ref={chartRef} className="w-full min-h-[260px]"></div>
        )}
      </div>

      {/* Live Data Records Table */}
      <div className="bg-[#0b0c10] border border-neutral-800 rounded-xl p-6 overflow-hidden">
        <h4 className="text-sm font-bold font-mono tracking-wide uppercase text-neutral-200 mb-4">
          Ingested Entities
        </h4>

        {entities.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-neutral-800 rounded-lg text-neutral-500 font-mono text-xs">
            No live data connected. Connect a provider via Nango to begin.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400">
                  <th className="py-3 px-4">Entity ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Source Connection</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Synced At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 text-neutral-300">
                {entities.map((item) => (
                  <tr key={item.id} className="hover:bg-[#12131a]/50">
                    <td className="py-3 px-4 text-sky-400">{item.id}</td>
                    <td className="py-3 px-4 font-sans font-medium text-neutral-200">
                      {item.name}
                    </td>
                    <td className="py-3 px-4 text-neutral-400">{item.type}</td>
                    <td className="py-3 px-4 text-neutral-400">
                      {item.sourceId}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-emerald-950/40 border border-emerald-900 text-emerald-400 px-2 py-0.5 rounded-full text-[10px]">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-500">
                      {item.updatedAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
