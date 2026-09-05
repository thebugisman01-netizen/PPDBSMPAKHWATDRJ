// =========================================================
// SMP Akhwat Riyadhul Jannah — Dashboard Admin
// SCRIPT_URL didefinisikan di config.js (dimuat sebelum file ini).
// =========================================================

// GANTI password login dashboard admin di sini.
// Catatan: karena ini dicek di browser (bukan di server), password ini
// bisa terlihat oleh siapapun yang membuka source code halaman ini.
// Cukup sebagai gerbang sederhana, bukan proteksi data yang kuat.
const ADMIN_PASSWORD = "riyadhuljannah2026";

const loginView = document.getElementById("loginView");
const dashboardView = document.getElementById("dashboardView");
const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const loginMessage = document.getElementById("loginMessage");
const dashMessage = document.getElementById("dashMessage");
const tableBody = document.getElementById("dataTableBody");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");

let allRows = []; // menyimpan seluruh data hasil fetch, untuk keperluan pencarian & CSV

// Kunci session, supaya admin tidak perlu login ulang saat refresh halaman
// (hilang otomatis saat tab ditutup — lebih aman daripada localStorage).
const SESSION_KEY = "ppdb_admin_logged_in";

function setButtonLoading(button, isLoading) {
  button.disabled = isLoading;
  button.classList.toggle("loading", isLoading);
}

function showMessage(el, text, type) {
  el.textContent = text;
  el.className = "form-message " + (type || "");
}

async function fetchData() {
  if (SCRIPT_URL.includes("PASTE_URL_WEB_APP")) {
    throw new Error("SCRIPT_URL belum diisi di config.js");
  }
  const url = `${SCRIPT_URL}?action=list`;
  const response = await fetch(url);
  const result = await response.json();
  if (result.result !== "success") {
    throw new Error(result.error || "Gagal mengambil data.");
  }
  return result.data;
}

function renderTable(rows) {
  tableBody.innerHTML = "";

  if (rows.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }
  emptyState.classList.add("hidden");

  rows.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(row["Waktu Daftar"])}</td>
      <td>${escapeHtml(row["Nama"])}</td>
      <td>${escapeHtml(row["NISN"])}</td>
      <td>${escapeHtml(row["NIK"])}</td>
      <td>${escapeHtml(row["Tempat Lahir"])}, ${escapeHtml(row["Tanggal Lahir"])}</td>
      <td>${escapeHtml(row["Nama Ayah"])}</td>
      <td>${escapeHtml(row["Nama Ibu"])}</td>
      <td>${escapeHtml(row["Sekolah Asal"])}</td>
      <td>${escapeHtml(row["Riwayat Penyakit"])}</td>
      <td>${escapeHtml(row["Alamat Rumah"])}</td>
      <td>
        <div class="doc-links">
          ${docLink(row["Link KK"], "KK")}
          ${docLink(row["Link KTP Orang Tua"], "KTP")}
          ${docLink(row["Link Foto Anak"], "Foto")}
        </div>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

function docLink(url, label) {
  if (!url) return "";
  return `<a href="${url}" target="_blank" rel="noopener">Lihat ${label}</a>`;
}

function escapeHtml(value) {
  if (value === undefined || value === null) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function updateStats(rows) {
  document.getElementById("statTotal").textContent = rows.length;

  const todayStr = new Date().toLocaleDateString("id-ID");
  const todayCount = rows.filter((row) => {
    const waktu = String(row["Waktu Daftar"] || "");
    return waktu.startsWith(todayStr) || waktu.includes(todayStr);
  }).length;
  document.getElementById("statToday").textContent = todayCount;
}

function applySearch() {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) {
    renderTable(allRows);
    return;
  }
  const filtered = allRows.filter((row) => {
    return (
      String(row["Nama"] || "").toLowerCase().includes(q) ||
      String(row["NISN"] || "").toLowerCase().includes(q) ||
      String(row["Sekolah Asal"] || "").toLowerCase().includes(q)
    );
  });
  renderTable(filtered);
}

function downloadCsv() {
  if (allRows.length === 0) return;
  const headers = Object.keys(allRows[0]);
  const csvRows = [
    headers.join(","),
    ...allRows.map((row) =>
      headers.map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(",")
    ),
  ];
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `data-ppdb-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
}

async function loadDashboard() {
  showMessage(dashMessage, "Memuat data…", "");
  try {
    const rows = await fetchData();
    allRows = rows;
    renderTable(rows);
    updateStats(rows);
    showMessage(dashMessage, "", "");
  } catch (err) {
    showMessage(dashMessage, err.message, "error");
  }
}

function showDashboard() {
  loginView.classList.add("hidden");
  dashboardView.classList.remove("hidden");
}

function showLogin() {
  dashboardView.classList.add("hidden");
  loginView.classList.remove("hidden");
}

// ===== Login =====
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const password = document.getElementById("password").value;

  if (password !== ADMIN_PASSWORD) {
    showMessage(loginMessage, "Password salah.", "error");
    return;
  }

  setButtonLoading(loginBtn, true);
  showMessage(loginMessage, "", "");

  try {
    const rows = await fetchData();
    allRows = rows;
    sessionStorage.setItem(SESSION_KEY, "true");
    showDashboard();
    renderTable(rows);
    updateStats(rows);
  } catch (err) {
    showMessage(loginMessage, err.message, "error");
  } finally {
    setButtonLoading(loginBtn, false);
  }
});

// ===== Logout =====
document.getElementById("logoutBtn").addEventListener("click", () => {
  sessionStorage.removeItem(SESSION_KEY);
  allRows = [];
  document.getElementById("password").value = "";
  showLogin();
});

// ===== Refresh, search, CSV =====
document.getElementById("refreshBtn").addEventListener("click", () => {
  if (sessionStorage.getItem(SESSION_KEY) === "true") loadDashboard();
});

searchInput.addEventListener("input", applySearch);
document.getElementById("downloadCsvBtn").addEventListener("click", downloadCsv);

// ===== Cek jika sudah login sebelumnya (session masih aktif) =====
(function init() {
  if (sessionStorage.getItem(SESSION_KEY) === "true") {
    showDashboard();
    loadDashboard();
  }
})();
