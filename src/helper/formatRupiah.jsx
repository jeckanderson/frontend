export function formatRupiah(number) {
  if (!number) return "Rp 0";
  return "Rp " + Number(number).toLocaleString("id-ID");
}
