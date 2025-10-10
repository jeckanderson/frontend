export function jmlRefPerJenjang(kabupaten) {
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
        text: "Jumlah Revitalisasi",
        data: [
          kabupaten?.totalRefPaud || 0,
          kabupaten?.totalRefSd || 0,
          kabupaten?.totalRefSmp || 0,
          kabupaten?.totalRefSma || 0,
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
      },
      y: {
        beginAtZero: true,
        // ticks: {
        //   callback: (value) => "Rp " + value.toLocaleString("id-ID"), // format sumbu Y
        //   color: "blue",
        // },
        title: {
          display: true,
          text: "Jumlah Revitalisasi",
        },
      },
    },
  };

  return { data, options };
}
