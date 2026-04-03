"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Activity, PieChart as PieChartIcon, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

interface AdherenceChartsProps {
  lineData: { date: string; taken: number; missed: number; total: number }[];
  pieData: { name: string; value: number; color: string }[];
}

function AdherenceChartsInner({ lineData, pieData }: AdherenceChartsProps) {
  const hasPieData = pieData.some((d) => d.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Line Chart */}
      <div className="rounded-2xl bg-card border border-border p-6 card-hover">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-primary/10">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">7-Day History</h3>
            <p className="text-xs text-muted-foreground">
              Taken vs Missed over the last week
            </p>
          </div>
        </div>

        <div className="h-64">
          {lineData.some((d) => d.total > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    fontSize: "13px",
                    color: "var(--foreground)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="taken"
                  name="Taken"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ fill: "#10b981", r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="missed"
                  name="Missed"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  dot={{ fill: "#ef4444", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mb-3">
                <BarChart3 className="w-6 h-6 text-muted-foreground/40" />
              </div>
              <p className="text-sm text-muted-foreground">
                No data available yet
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Start tracking your medications!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Pie Chart */}
      <div className="rounded-2xl bg-card border border-border p-6 card-hover">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-primary/10">
            <PieChartIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              Overall Adherence
            </h3>
            <p className="text-xs text-muted-foreground">
              Total taken vs missed breakdown
            </p>
          </div>
        </div>

        <div className="h-64">
          {hasPieData ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    fontSize: "13px",
                    color: "var(--foreground)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value: string) => (
                    <span style={{ color: "var(--foreground)", fontSize: "13px" }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mb-3">
                <PieChartIcon className="w-6 h-6 text-muted-foreground/40" />
              </div>
              <p className="text-sm text-muted-foreground">
                No adherence data yet
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Track medications to see your progress
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const AdherenceCharts = React.memo(AdherenceChartsInner);
