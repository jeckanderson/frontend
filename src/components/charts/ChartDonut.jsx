import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import getApiBackend from "../../services/ApiBackend";
import { sumByField } from "../../helper/sumByField";
import { formatRupiah } from "../../helper/formatRupiah";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function ChartDonut({ provinsiData }) {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    // Data Berdasarkan provinsi yang di klik
    if (provinsiData) {
      // console.log("Provinsi dipilih:", provinsiData);

      setChartData([
        { name: "PAUD", value: provinsiData.anggaran_rev_paud || 0 },
        { name: "SD", value: provinsiData.anggaran_rev_sd || 0 },
        { name: "SMP", value: provinsiData.anggaran_rev_smp || 0 },
        { name: "SMA", value: provinsiData.anggaran_rev_sma || 0 },
      ]);
    } else {
      // Data Nasional
      const fetchData = async () => {
        try {
          const getDataRevitalisasi = await getApiBackend.getRevitalisasi();

          const kabupatenData = getDataRevitalisasi.filter(
            (item) => item.tingkat_label === "kabupaten"
          );

          const totalPaud = sumByField(kabupatenData, "anggaran_rev_paud");
          const totalSd = sumByField(kabupatenData, "anggaran_rev_sd");
          const totalSmp = sumByField(kabupatenData, "anggaran_rev_smp");
          const totalSma = sumByField(kabupatenData, "anggaran_rev_sma");

          setChartData([
            { name: "PAUD", value: totalPaud },
            { name: "SD", value: totalSd },
            { name: "SMP", value: totalSmp },
            { name: "SMA", value: totalSma },
          ]);
        } catch (err) {
          console.error("Chart => Gagal ambil data API:", err);
        }
      };
      fetchData();
    }
  }, [provinsiData]);

  if (!chartData) return <p>Loading data...</p>;

  const totalAll = chartData.reduce((sum, item) => sum + item.value, 0);

  // Custom label 2 baris: persen di atas, nilai di bawah
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    value,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.15; // dekat chart
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#333"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        <tspan x={x} dy="-0.4em" fontSize="15" fontWeight="bold">
          {(percent * 100).toFixed(1)}%
        </tspan>
        <tspan x={x} dy="1.2em" fontSize="15">
          {formatRupiah(value)}
        </tspan>
      </text>
    );
  };

  return (
    <div className="text-center">
      <PieChart width={420} height={420}>
        <Pie
          data={chartData}
          innerRadius={100}
          outerRadius={150}
          cx="50%"
          cy="50%"
          dataKey="value"
          labelLine={false}
          label={renderCustomizedLabel} // pakai custom label
          stroke="none"
          strokeWidth={0}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>

        <Tooltip formatter={(value) => `${formatRupiah(value)}`} />
        <Legend
          content={() => (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 20,
              }}
            >
              {chartData.map((entry, index) => (
                <div
                  key={`legend-${index}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginRight: 20,
                    fontSize: "14px",
                  }}
                >
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      backgroundColor: COLORS[index % COLORS.length],
                      marginRight: 6,
                    }}
                  />
                  <span>{entry.name}</span>
                </div>
              ))}
            </div>
          )}
        />

        {/* Total di tengah lingkaran */}
        <text
          x="50%"
          y="50%"
          dy="-20"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontSize: "16px", fontWeight: "bold" }}
        >
          {formatRupiah(totalAll)}
        </text>
      </PieChart>
    </div>
  );
}
