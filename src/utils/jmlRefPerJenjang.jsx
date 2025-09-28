// helper/getChartData.js
// export const getChartData = (kabupaten) => {
export function jmlRefPerJenjang(kabupaten) {
  if (!kabupaten) {
    return {
      labels: [],
      datasets: [],
    };
  }

  return {
    labels: ["PAUD", "SD", "SMP", "SMA"],
    datasets: [
      {
        type: "bar",
        label: "Jumlah Sekolah",
        data: [
          kabupaten.totalRefPaud || 0,
          kabupaten.totalRefSd || 0,
          kabupaten.totalRefSmp || 0,
          kabupaten.totalRefSma || 0,
        ],
        backgroundColor: "rgba(42, 101, 227, 0.97)",
        borderRadius: 3,
      },
    ],
  };
}

// helper/jmlRefPerJenjang.js
