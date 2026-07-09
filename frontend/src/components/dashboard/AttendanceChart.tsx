"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
} from "recharts";

const data = [
  { day: "Sen", hadir: 120 },
  { day: "Sel", hadir: 180 },
  { day: "Rab", hadir: 160 },
  { day: "Kam", hadir: 210 },
  { day: "Jum", hadir: 195 },
];

export default function AttendanceChart() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 h-[350px]">
      <h2 className="text-xl font-bold mb-5">Grafik Kehadiran</h2>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="color" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />

              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="day" />

          <Tooltip />

          <Area
            type="monotone"
            dataKey="hadir"
            stroke="#2563eb"
            fill="url(#color)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
