"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { STATUS_COLOR } from "@/lib/constants";
import type { Status } from "@prisma/client";

const tick = { fill: "#94a3b8", fontSize: 12 };
const tooltipStyle = { borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 };

export function StatusChart({ data }: { data: { key: string; name: string; value: number }[] }) {
  if (data.every((d) => d.value === 0)) return <Empty />;
  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={90} paddingAngle={2} stroke="none">
          {data.map((d) => <Cell key={d.key} fill={STATUS_COLOR[d.key as Status]} />)}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function TrendChart({ data }: { data: { label: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0e7c7b" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#0e7c7b" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} vertical={false} />
        <XAxis dataKey="label" tick={tick} tickLine={false} axisLine={false} interval={1} />
        <YAxis allowDecimals={false} tick={tick} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="count" name="Complaints" stroke="#0e7c7b" strokeWidth={2} fill="url(#trendFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function BarBlock({ data, color = "#0e7c7b", horizontal }: { data: { name: string; value: number }[]; color?: string; horizontal?: boolean }) {
  if (data.every((d) => d.value === 0)) return <Empty />;
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} layout={horizontal ? "vertical" : "horizontal"} margin={{ left: horizontal ? 24 : -20, right: 8, top: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} horizontal={!horizontal} vertical={!!horizontal} />
        {horizontal ? (
          <>
            <XAxis type="number" allowDecimals={false} tick={tick} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="name" width={130} tick={tick} tickLine={false} axisLine={false} />
          </>
        ) : (
          <>
            <XAxis dataKey="name" tick={tick} tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tick={tick} tickLine={false} axisLine={false} />
          </>
        )}
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(148,163,184,0.12)" }} />
        <Bar dataKey="value" name="Complaints" fill={color} radius={4} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function Empty() {
  return <div className="grid h-[250px] place-items-center text-sm text-slate-500">No complaints to chart yet.</div>;
}
