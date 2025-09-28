// Agregasi (jumlahkan) semua data kabupaten
export function buildSummary(list) {
  return list.reduce(
    (acc, curr) => {
      acc.totalRefPaud += curr.totalRefPaud;
      acc.totalRefSd += curr.totalRefSd;
      acc.totalRefSmp += curr.totalRefSmp;
      acc.totalRefSma += curr.totalRefSma;

      acc.totalAnggaranPaud += curr.totalAnggaranPaud;
      acc.totalAnggaranSd += curr.totalAnggaranSd;
      acc.totalAnggaranSmp += curr.totalAnggaranSmp;
      acc.totalAnggaranSma += curr.totalAnggaranSma;

      return acc;
    },
    {
      totalRefPaud: 0,
      totalRefSd: 0,
      totalRefSmp: 0,
      totalRefSma: 0,
      totalAnggaranPaud: 0,
      totalAnggaranSd: 0,
      totalAnggaranSmp: 0,
      totalAnggaranSma: 0,
    }
  );
}
