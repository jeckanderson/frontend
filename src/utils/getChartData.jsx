// helper/getChartData.js
export function getChartData(kabupaten) {
  if (!kabupaten) {
    return {
      data: {
        labels: [],
        datasets: [],
      },
      options: {},
    };
  }

  const data = {
    labels: ["PAUD", "SD", "SMP", "SMA"],
    datasets: [
      {
        type: "bar",
        label: "Jumlah Sekolah",
        data: [
          kabupaten?.totalRefPaud || 0,
          kabupaten?.totalRefSd || 0,
          kabupaten?.totalRefSmp || 0,
          kabupaten?.totalRefSma || 0,
        ],
        backgroundColor: "rgba(139, 226, 255, 0.98)",
        borderRadius: 3,
        yAxisID: "y1",
        order: 2,
      },
      {
        type: "line",
        label: "Anggaran (Rp)",
        data: [
          kabupaten?.totalAnggaranPaud || 0,
          kabupaten?.totalAnggaranSd || 0,
          kabupaten?.totalAnggaranSmp || 0,
          kabupaten?.totalAnggaranSma || 0,
        ],
        borderColor: "rgba(243, 25, 9, 1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(243, 25, 9, 1)",
        fill: false,
        yAxisID: "y",
        order: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: "index",
      intersect: false,
    },
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // sembunyikan legend di atas
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            if (context.dataset.label.includes("Anggaran")) {
              return `${context.dataset.label}: Rp ${context.formattedValue}`;
            }
            return `${context.dataset.label}: ${context.formattedValue}`;
          },
        },
      },
    },
    scales: {
      y1: {
        beginAtZero: true,
        position: "right",
        grid: {
          // drawOnChartArea: true,
          drawBorder: false,
        },
        title: {
          display: true,
          text: "Jumlah Revitalisasi",
          color: "red",
          // rotation: -30,
        },
        ticks: {
          color: "red",
        },
      },
      y: {
        beginAtZero: true,
        position: "left",
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: "Anggaran (Rp)",
          color: "blue",
          // rotation: -30,
        },
        ticks: {
          color: "blue",
        },
      },
    },
  };

  return { data, options };
}
