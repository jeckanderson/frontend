import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import getApiBackend from "../../api/ApiBackend";

const data = [
  { name: "PAUD", value: 400 },
  { name: "SD", value: 300 },
  { name: "SMP", value: 300 },
  { name: "SMA", value: 200 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function Chart() {
  return (
    <>
      <div className="text-center">
        <PieChart width={400} height={400}>
          <Pie
            data={data}
            innerRadius={100}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>
    </>
  );
}
