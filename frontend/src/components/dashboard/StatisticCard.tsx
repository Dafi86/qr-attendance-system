"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  title: string;
  value: number;
  icon: ReactNode;
  color: string;
}

export default function StatisticCard({ title, value, icon, color }: Props) {
  return (
    <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}>
      <Card className="shadow-lg rounded-2xl border-0">
        <CardContent className="p-6 flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">{title}</p>

            <h2 className="text-4xl font-bold mt-2">{value}</h2>
          </div>

          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white ${color}`}
          >
            {icon}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
