import { useEffect, useState } from "react";
import getApiBackend from "../services/ApiBackend";
import { sumByField } from "../helper/sumByField";
import { cleanNumber } from "../helper/cleanNumber";

export default function useRevitalisasiData() {
  const [provinsi, setProvinsi] = useState([]);
  const [kabupaten, setKabupaten] = useState([]);
  const [withTotalProvinsi, setWithTotalProvinsi] = useState([]);
  const [rangeValue, setRangeValue] = useState({ min: 0, max: 0 });
  const [totalSemua, setTotalSemua] = useState(0);
  const [totalPaud, setTotalPaud] = useState(0);
  const [totalSd, setTotalSd] = useState(0);
  const [totalSmp, setTotalSmp] = useState(0);
  const [totalSma, setTotalSma] = useState(0);
  const [totalAnggaranRef, setTotalAnggaranRef] = useState(0);
  const [anggaranPaud, setAnggaranPaud] = useState(0);
  const [anggaranSD, setAnggaranSD] = useState(0);
  const [anggaranSMP, setAnggaranSMP] = useState(0);
  const [anggaranSMA, setAnggaranSMA] = useState(0);

  useEffect(() => {
    const fetchDataApi = async () => {
      try {
        const getDataRevitalisasi = await getApiBackend.getRevitalisasi();

        const getProvinsi = getDataRevitalisasi.filter(
          (item) => item.tingkat_label === "provinsi"
        );
        const getKabupaten = getDataRevitalisasi.filter(
          (item) => item.tingkat_label === "kabupaten"
        );
        setProvinsi(getProvinsi);
        setKabupaten(getKabupaten);

        // Hitung total per provinsi
        const provinsiWithTotals = getProvinsi.map((prov) => {
          const filterData = getDataRevitalisasi.filter(
            (item) =>
              item.tingkat_label === "kabupaten" &&
              item.kode_pro === prov.kode_pro
          );
          return {
            ...prov,
            totalRefPaud: sumByField(filterData, "Jml_rev_paud"),
            totalRefSd: sumByField(filterData, "Jml_revi_sd"),
            totalRefSmp: sumByField(filterData, "Jml_rev_smp"),
            totalRefSma: sumByField(filterData, "Jml_rev_sma"),
            totalAnggaranPaud: sumByField(filterData, "anggaran_rev_paud"),
            totalAnggaranSd: sumByField(filterData, "anggaran_rev_sd"),
            totalAnggaranSmp: sumByField(filterData, "anggaran_rev_smp"),
            totalAnggaranSma: sumByField(filterData, "anggaran_rev_sma"),
          };
        });
        setWithTotalProvinsi(provinsiWithTotals);

        // Ambil nilai min-max untuk skala warna
        const totalsRage = provinsiWithTotals.map(
          (p) => p.totalRefPaud + p.totalRefSd + p.totalRefSmp + p.totalRefSma
        );
        setRangeValue({
          min: Math.min(...totalsRage),
          max: Math.max(...totalsRage),
        });

        // Total Nasional
        const totalSekolah = getKabupaten.reduce(
          (sum, item) => sum + (item.total_jml_rev_sekolah || 0),
          0
        );
        setTotalSemua(totalSekolah);

        setTotalPaud(sumByField(getKabupaten, "Jml_rev_paud"));
        setTotalSd(sumByField(getKabupaten, "Jml_revi_sd"));
        setTotalSmp(sumByField(getKabupaten, "Jml_rev_smp"));
        setTotalSma(sumByField(getKabupaten, "Jml_rev_sma"));

        setTotalAnggaranRef(
          getKabupaten.reduce(
            (sum, item) => sum + cleanNumber(item.total_anggaran_rev),
            0
          )
        );

        setAnggaranPaud(sumByField(getKabupaten, "anggaran_rev_paud"));
        setAnggaranSD(sumByField(getKabupaten, "anggaran_rev_sd"));
        setAnggaranSMP(sumByField(getKabupaten, "anggaran_rev_smp"));
        setAnggaranSMA(sumByField(getKabupaten, "anggaran_rev_sma"));
      } catch (err) {
        console.error("Maps => Gagal ambil data API:", err);
      }
    };

    fetchDataApi();
  }, []);

  // Return semua state biar bisa diakses di komponen utama
  return {
    provinsi,
    kabupaten,
    withTotalProvinsi,
    rangeValue,
    totalSemua,
    totalPaud,
    totalSd,
    totalSmp,
    totalSma,
    totalAnggaranRef,
    anggaranPaud,
    anggaranSD,
    anggaranSMP,
    anggaranSMA,
  };
}
