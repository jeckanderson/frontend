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
        // 🚀 Dummy data provinsi (testing)
        const dummyData = [
          {
            kode_pro: 11,
            nama_wilayah: "ACEH",
            tingkat_label: "provinsi",
            total_jml_rev_sekolah: 120,
            total_anggaran_rev: "5000000000", // 5 M
          },
          {
            kode_pro: 12,
            nama_wilayah: "SUMATERA UTARA",
            tingkat_label: "provinsi",
            total_jml_rev_sekolah: 300,
            total_anggaran_rev: "15000000000", // 15 M
          },
          {
            kode_pro: 13,
            nama_wilayah: "SUMATERA BARAT",
            tingkat_label: "provinsi",
            total_jml_rev_sekolah: 200,
            total_anggaran_rev: "10000000000", // 10 M
          },
          {
            kode_pro: 31,
            nama_wilayah: "DKI JAKARTA",
            tingkat_label: "provinsi",
            total_jml_rev_sekolah: 400,
            total_anggaran_rev: "25000000000", // 25 M
          },
          {
            kode_pro: 31,
            nama_wilayah: "DKI JAKARTA",
            tingkat_label: "provinsi",
            total_jml_rev_sekolah: 400,
            total_anggaran_rev: "25000000000", // 25 M
          },
        ];

        // ambil hanya data provinsi
        const dataProvinsi = dummyData.filter(
          (item) => item.tingkat_label === "provinsi"
        );

        const labels = dataProvinsi.map((item) => item.nama_wilayah);
        const jumlah = dataProvinsi.map(
          (item) => item.total_jml_rev_sekolah || 0
        );
        const anggaran = dataProvinsi.map((item) =>
          Number(item.total_anggaran_rev)
        );

        setChartData({
          labels,
          datasets: [
            {
              type: "bar",
              // label: "Jumlah Revitalisasi",
              data: jumlah,
              backgroundColor: "rgba(255, 159, 64, 0.7)",
              borderRadius: 4,
              yAxisID: "y",
            },
            {
              type: "line",
              // label: "Total Anggaran (Rp)",
              data: anggaran,
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 2,
              pointBackgroundColor: "rgba(54, 162, 235, 1)",
              fill: false,
              yAxisID: "y1",
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
        display: false, // ⬅️ hilangkan informasi di atas chart
      },
      legend: { position: "top" },
      datalabels: { display: true },
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
        grid: {
          drawOnChartArea: false, // hilangkan garis vertikal
          drawTicks: false, // hilangkan tick di sumbu
        },
      },
      y: {
        display: false, // ⬅️ hilangkan sisi kiri
      },
      y1: {
        display: false, // ⬅️ hilangkan sisi kanan
      },
    },
  };

  return (
    <div style={{ width: "100%", maxWidth: "100%", margin: "0 auto" }}>
      {chartData ? (
        <Chart
          type="bar"
          data={chartData}
          options={options}
          plugins={[ChartDataLabels]} // ⬅️ PENTING: daftarkan plugin di sini
        />
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
};
