import React, { useEffect, useState } from "react";
import ApiBackend from "../api/ApiBackend";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";

// register chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const parseAnggaran = (value) => {
  if (!value) return 0;
  return Number(value.replace(/,/g, "").trim());
};

export const ComboChart = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const getDataRevitalisasi = await ApiBackend.getRevitalisasi();

        const dataProvinsi = getDataRevitalisasi.filter(
          (item) => item.tingkat_label === "provinsi"
        );

        const labels = dataProvinsi.map((item) => item.nama_wilayah);
        const jumlah = dataProvinsi.map(
          (item) => item.total_jml_rev_sekolah || 0
        );
        const anggaran = dataProvinsi.map((item) =>
          parseAnggaran(item.total_anggaran_rev)
        );

        setChartData({
          labels,
          datasets: [
            {
              type: "bar",
              label: "Jumlah Revitalisasi",
              data: jumlah,
              backgroundColor: "rgba(255, 159, 64, 0.7)",
              borderRadius: 4,
              yAxisID: "y",
              datalabels: {
                anchor: "end",
                align: "end",
                color: "#000",
                font: {
                  weight: "bold",
                  size: 10,
                },
              },
            },
            {
              type: "line",
              label: "Total Anggaran (Rp)",
              data: anggaran,
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 2,
              pointBackgroundColor: "rgba(54, 162, 235, 1)",
              fill: false,
              yAxisID: "y1",
              datalabels: {
                anchor: "end",
                align: "top",
                color: "blue",
                font: {
                  weight: "bold",
                  size: 9,
                },
                formatter: (value) => value.toLocaleString("id-ID"),
              },
            },
          ],
        });
      } catch (err) {
        console.error("ComboCharts => Gagal ambil data API:", err);
      }
    };

    fetchData();
  }, []);

  const options = {
    responsive: true,
    // maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // ⬅️ hilangkan informasi di atas chart
      },
      datalabels: {
        display: true,
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    scales: {
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 60,
          minRotation: 60,
        },
      },
      y: {
        display: false, // kalau mau hilangkan sisi kiri juga
      },
      y1: {
        display: false, // kalau mau hilangkan sisi kanan juga
      },
    },
  };

  return (
    <div style={{ width: "100%", maxWidth: "100%", margin: "0 auto" }}>
      {chartData ? (
        <Chart type="bar" data={chartData} options={options} />
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
};
