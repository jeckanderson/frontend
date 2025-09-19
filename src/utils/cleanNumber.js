export const cleanNumber = (value) => {
  if (value === null || value === undefined) return 0;

  // pastikan string, lalu hapus semua kecuali angka, minus, dan titik/desimal
  const cleaned = String(value).replace(/[^0-9.-]+/g, "");

  // kalau kosong setelah dibersihkan, kembalikan 0
  if (!cleaned) return 0;

  return Number(cleaned);
};
