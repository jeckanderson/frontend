export function totalAnggaranPerJenjang(kabupaten) {
  if (!kabupaten) {
    return {
      // labels: [],
      datasets: [],
    };
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // hilangkan informasi di atas chart
      },
    },
  };

  return {
    labels: ["PAUD", "SD", "SMP", "SMA"],
    datasets: [
      {
        type: "bar",
        label: "Jumlah Sekolah",
        data: [
          kabupaten.totalAnggaranPaud || 0,
          kabupaten.totalAnggaranSd || 0,
          kabupaten.totalAnggaranSmp || 0,
          kabupaten.totalAnggaranSma || 0,
        ],
        backgroundColor: "rgba(42, 101, 227, 0.97)",
        borderRadius: 3,
      },
    ],
    plugins: {
      legend: {
        display: true, // hilangkan informasi di atas chart
      },
    },
  };
}
