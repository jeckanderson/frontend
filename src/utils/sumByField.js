// Fungsi umum untuk hitung total field tertentu dari data kabupaten
// export const sumByField = (data, field) => {
//   return data.reduce((sum, item) => sum + (Number(item[field]) || 0), 0);
// };

// Bersihkan string angka (hapus spasi dan koma), lalu ubah ke Number
export function parseNumber(value) {
  if (!value) return 0;
  return Number(value.toString().replace(/,/g, "").replace(/\s/g, ""));
}

// Fungsi untuk menjumlahkan field tertentu dari array data
export function sumByField(data, field) {
  return data.reduce((sum, item) => {
    return sum + (parseNumber(item[field]) || 0);
  }, 0);
}
