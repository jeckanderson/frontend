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
import { cleanNumber } from "./cleanNumber";

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

export const ComboChart = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const getDataRevitalisasi = await ApiBackend.getRevitalisasi();

        // ambil data provinsi
        const dataProvinsi = getDataRevitalisasi.filter(
          (item) => item.tingkat_label === "provinsi"
        );

        // hitung total kabupaten per provinsi
        const provinsiWithTotall = dataProvinsi.map((prov) => {
          const kabupatenData = getDataRevitalisasi.filter(
            (item) =>
              item.tingkat_label === "kabupaten" &&
              item.kode_pro === prov.kode_pro
          );

          const totalSekolah = kabupatenData.reduce(
            (sum, item) => sum + (item.total_jml_rev_sekolah || 0),
            0
          );

          const totalAnggaran = kabupatenData.reduce(
            (sum, item) => sum + cleanNumber(item.total_anggaran_rev || "0"),
            0
          );

          return {
            ...prov,
            totalSekolah,
            totalAnggaran,
          };
        });
        provinsiWithTotall.sort((a, b) => b.totalSekolah - a.totalSekolah);
        // buat chart pakai data hasil perhitungan total
        const labels = provinsiWithTotall.map((item) => item.nama_wilayah);
        const jumlah = provinsiWithTotall.map((item) => item.totalSekolah);
        const anggaran = provinsiWithTotall.map((item) => item.totalAnggaran);

        setChartData({
          labels,
          datasets: [
            {
              type: "bar",
              label: "Jumlah Revitalisasi",
              data: jumlah,
              backgroundColor: "rgba(255, 159, 64, 0.7)",
              borderRadius: 2,
              yAxisID: "y",
              barPercentage: 1.0,
              categoryPercentage: 0.7,
              datalabels: {
                anchor: "start",
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
    plugins: {
      legend: {
        display: false, // hilangkan informasi di atas chart
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
        grid: {
          display: false, // hilangkan garis vertikal
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          autoSkip: false,
          maxRotation: 60,
          minRotation: 60,
        },
      },
      y: {
        display: false,
        beginAtZero: true,
        position: "left",
      },
      y1: {
        display: false,
        beginAtZero: true,
        position: "right",
        grid: {
          drawOnChartArea: false, // biar garis grid tidak dobel
        },
      },
    },
  };

  return (
    <div style={{ maxWidth: "100%", margin: "0 auto" }}>
      {chartData ? (
        <Chart type="bar" data={chartData} options={options} />
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
};
