export function totalAnggaranPerJenjang(kabupaten) {
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
        label: "Total Anggaran (Rp)",
        data: [
          kabupaten?.totalAnggaranPaud || 0,
          kabupaten?.totalAnggaranSd || 0,
          kabupaten?.totalAnggaranSmp || 0,
          kabupaten?.totalAnggaranSma || 0,
        ],
        backgroundColor: "rgba(42, 101, 227, 0.97)",
        borderRadius: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // kalau mau sembunyikan legend
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw || 0;
            return `Rp ${value.toLocaleString("id-ID")}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        // ticks: {
        //   // font: { size: 11 },
        //   // color: "blue",
        //   // padding: 8,
        // },
      },
      y: {
        beginAtZero: true,
        // ticks: {
        //   callback: (value) => "Rp " + value.toLocaleString("id-ID"), // format sumbu Y
        //   color: "blue",
        // },
        title: {
          display: true,
          text: "Total Anggaran (Rp)",
          // color: "blue",
          // font: { weight: "bold" },
        },
      },
    },
  };

  return { data, options };
}
