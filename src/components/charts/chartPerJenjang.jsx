import React, { useState } from "react";
import { Chart } from "react-google-charts";

export default function KabupatenTable({ provinsiData, selectedProvinsi }) {
  const [selectedKabupaten, setSelectedKabupaten] = useState(null);

  // 🔹 Ubah data API jadi format array untuk Google ComboChart
  const getChartData = (kabupaten) => {
    return [
      ["Jenjang", "Jumlah Sekolah", "Anggaran (Rp)"],
      ["PAUD", kabupaten.totalRefPaud, kabupaten.totalAnggaranPaud],
      ["SD", kabupaten.totalRefSd, kabupaten.totalAnggaranSd],
      ["SMP", kabupaten.totalRefSmp, kabupaten.totalAnggaranSmp],
      ["SMA", kabupaten.totalRefSma, kabupaten.totalAnggaranSma],
    ];
  };

  return (
    <div>
      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th>Kabupaten</th>
            <th>Jumlah Sekolah</th>
            <th>Anggaran</th>
          </tr>
        </thead>
        <tbody>
          {provinsiData.map((item, i) => (
            <tr key={i}>
              <td
                onClick={() => selectedProvinsi && setSelectedKabupaten(item)}
                className={
                  selectedProvinsi
                    ? "text-primary text-decoration-underline"
                    : "text-dark"
                }
                style={{ cursor: selectedProvinsi ? "pointer" : "default" }}
              >
                {item.nama_wilayah}
              </td>
              <td>
                {item.totalRefPaud} <br />
                {item.totalRefSd} <br />
                {item.totalRefSmp} <br />
                {item.totalRefSma}
              </td>
              <td>
                {item.totalAnggaranPaud.toLocaleString("id-ID")} <br />
                {item.totalAnggaranSd.toLocaleString("id-ID")} <br />
                {item.totalAnggaranSmp.toLocaleString("id-ID")} <br />
                {item.totalAnggaranSma.toLocaleString("id-ID")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 🔹 Tampilkan ComboChart hanya kalau kabupaten dipilih */}
      {selectedKabupaten && (
        <div className="mt-4">
          <h5>Grafik Revitalisasi – {selectedKabupaten.nama_wilayah}</h5>
          <Chart
            chartType="ComboChart"
            width="100%"
            height="400px"
            data={getChartData(selectedKabupaten)}
            options={{
              title: "Revitalisasi Sekolah per Jenjang",
              vAxis: { title: "Jumlah / Anggaran" },
              hAxis: { title: "Jenjang Pendidikan" },
              seriesType: "bars",
              series: { 1: { type: "line" } }, // Bar = jumlah sekolah, Line = anggaran
            }}
          />
        </div>
      )}
    </div>
  );
}
