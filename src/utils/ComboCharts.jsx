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
import { cleanNumber } from "../helper/cleanNumber";

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

export const ComboChart = ({ selectedProvinsi }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const getDataRevitalisasi = await ApiBackend.getRevitalisasi();

        let labels = [];
        let jumlah = [];
        let anggaran = [];

        if (selectedProvinsi) {
          // ketika provinsi di klik, ambil data jenjang berdasarkan kabupaten dari provinsi yang di pilih
          const mapingJenjang = getDataRevitalisasi.filter(
            (item) =>
              item.tingkat_label === "kabupaten" &&
              item.kode_pro === selectedProvinsi.kode_pro
          );

          mapingJenjang.sort(
            (a, b) =>
              (b.total_jml_rev_sekolah || 0) - (a.total_jml_rev_sekolah || 0)
          );

          labels = mapingJenjang.map((k) => k.nama_wilayah);
          jumlah = mapingJenjang.map((k) => k.total_jml_rev_sekolah || 0);
          anggaran = mapingJenjang.map((k) =>
            cleanNumber(k.total_anggaran_rev || "0")
          );
        } else {
          // Jika tidak ada provinsi dipilih -> tampilkan data nasional per provinsi
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
          // fungsi sort dari nilai terbesar ke terkecil
          provinsiWithTotall.sort((a, b) => b.totalSekolah - a.totalSekolah);
          // buat chart pakai data hasil perhitungan total
          labels = provinsiWithTotall.map((item) => item.nama_wilayah);
          jumlah = provinsiWithTotall.map((item) => item.totalSekolah);
          anggaran = provinsiWithTotall.map((item) => item.totalAnggaran);
        }

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
  }, [selectedProvinsi]);

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
          maxRotation: 90,
          minRotation: 90,
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
