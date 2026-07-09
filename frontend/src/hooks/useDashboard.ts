"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export interface DashboardData {
  students: number;
  classes: number;
  present_today: number;
  late_today: number;
  latest_attendance: unknown[];
  chart: unknown[];
}

export default function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/auth/dashboard")
      .then((res) => {
        setData(res.data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return {
    data,
    loading,
  };
}

