export const initials = (name = "") =>
  name.split(" ").filter(Boolean).map((n) => n[0]).join("").substring(0, 2).toUpperCase();

export const inr = (n, decimals = 2) =>
  "₹" + Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export function downloadCSV(filename, rows) {
  const csv = rows
    .map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
