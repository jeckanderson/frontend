// helper untuk parsing angka dari string
import { cleanNumber } from "./cleanNumber";
// const cleanNumber = (val) =>
//   typeof val === "string" ? parseInt(val.replace(/\D/g, "")) || 0 : val || 0;

// Hitung summary dari kumpulan kabupaten
export const hitungSummary = (dataKabupaten) => {
  return dataKabupaten.reduce(
    (acc, k) => {
      acc.totalSekolah += k.total_jml_rev_sekolah || 0;
      acc.totalAnggaran += cleanNumber(k.total_anggaran_rev);

      acc.paud.jumlah += k.Jml_rev_paud || 0;
      acc.paud.anggaran += cleanNumber(k.anggaran_rev_paud);

      acc.sd.jumlah += k.Jml_revi_sd || 0;
      acc.sd.anggaran += cleanNumber(k.anggaran_rev_sd);

      acc.smp.jumlah += k.Jml_rev_smp || 0;
      acc.smp.anggaran += cleanNumber(k.anggaran_rev_smp);

      acc.sma.jumlah += k.Jml_rev_sma || 0;
      acc.sma.anggaran += cleanNumber(k.anggaran_rev_sma);

      return acc;
    },
    {
      totalSekolah: 0,
      totalAnggaran: 0,
      paud: { jumlah: 0, anggaran: 0 },
      sd: { jumlah: 0, anggaran: 0 },
      smp: { jumlah: 0, anggaran: 0 },
      sma: { jumlah: 0, anggaran: 0 },
    }
  );
};

// Hitung summary dari kumpulan kabupaten
// export const hitungSummary = (dataKabupaten) => {
//   return {
//     totalSekolah: dataKabupaten.reduce(
//       (acc, k) => acc + (k.total_jml_rev_sekolah || 0),
//       0
//     ),
//     totalAnggaran: dataKabupaten.reduce(
//       (acc, k) =>
//         acc + (parseInt(k.total_anggaran_rev.replace(/[^0-9]/g, "")) || 0),
//       0
//     ),
//     paud: {
//       jumlah: dataKabupaten.reduce((acc, k) => acc + (k.Jml_rev_paud || 0), 0),
//       anggaran: dataKabupaten.reduce(
//         (acc, k) =>
//           acc + (parseInt(k.anggaran_rev_paud.replace(/[^0-9]/g, "")) || 0),
//         0
//       ),
//     },
//     sd: {
//       jumlah: dataKabupaten.reduce((acc, k) => acc + (k.Jml_revi_sd || 0), 0),
//       anggaran: dataKabupaten.reduce(
//         (acc, k) =>
//           acc + (parseInt(k.anggaran_rev_sd.replace(/[^0-9]/g, "")) || 0),
//         0
//       ),
//     },
//     smp: {
//       jumlah: dataKabupaten.reduce((acc, k) => acc + (k.Jml_rev_smp || 0), 0),
//       anggaran: dataKabupaten.reduce(
//         (acc, k) =>
//           acc + (parseInt(k.anggaran_rev_smp.replace(/[^0-9]/g, "")) || 0),
//         0
//       ),
//     },
//     sma: {
//       jumlah: dataKabupaten.reduce((acc, k) => acc + (k.Jml_rev_sma || 0), 0),
//       anggaran: dataKabupaten.reduce(
//         (acc, k) =>
//           acc + (parseInt(k.anggaran_rev_sma.replace(/[^0-9]/g, "")) || 0),
//         0
//       ),
//     },
//   };
// };
