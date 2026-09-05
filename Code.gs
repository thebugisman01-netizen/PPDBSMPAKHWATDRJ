/**
 * SMP Akhwat Riyadhul Jannah — PPDB Backend
 * Tempel seluruh isi file ini ke Google Apps Script (script.google.com),
 * lalu isi FOLDER_ID di bawah dan deploy sebagai Web App.
 * Lihat README.md untuk langkah lengkap.
 */

// ID folder Google Drive tempat menyimpan file KK, KTP, dan Foto.
// Cara mendapatkan: buka folder di Google Drive, ID ada di bagian akhir URL.
const FOLDER_ID = "1OBUk_15JRIhceuIlECx7Jt5gyrn95pE2?usp=sharing";

// Nama sheet tempat data pendaftaran disimpan (akan dibuat otomatis jika belum ada).
const SHEET_NAME = "Pendaftaran";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    const sheet = getOrCreateSheet_();
    const folder = DriveApp.getFolderById(FOLDER_ID);

    const kkUrl = saveFile_(folder, data.kk, "KK", data.nama);
    const ktpUrl = saveFile_(folder, data.ktp, "KTP", data.nama);
    const fotoUrl = saveFile_(folder, data.foto, "Foto", data.nama);

    sheet.appendRow([
      new Date(),
      data.nama,
      data.tempatLahir,
      data.tanggalLahir,
      data.nisn,
      data.nik,
      data.namaAyah,
      data.namaIbu,
      data.pekerjaanAyah,
      data.pekerjaanIbu,
      data.sekolahAsal,
      data.riwayatPenyakit,
      data.alamat,
      kkUrl,
      ktpUrl,
      fotoUrl,
    ]);

    return jsonResponse_({ result: "success" });
  } catch (err) {
    return jsonResponse_({ result: "error", error: err.toString() });
  }
}

// Simpan satu file ke Drive dari data base64, kembalikan URL-nya.
function saveFile_(folder, fileData, label, namaSiswa) {
  if (!fileData || !fileData.data) return "";
  const bytes = Utilities.base64Decode(fileData.data);
  const fileName = `${label} - ${namaSiswa} - ${fileData.name}`;
  const blob = Utilities.newBlob(bytes, fileData.mimeType, fileName);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}

// Ambil sheet "Pendaftaran"; buat beserta header jika belum ada.
function getOrCreateSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Waktu Daftar",
      "Nama",
      "Tempat Lahir",
      "Tanggal Lahir",
      "NISN",
      "NIK",
      "Nama Ayah",
      "Nama Ibu",
      "Pekerjaan Ayah",
      "Pekerjaan Ibu",
      "Sekolah Asal",
      "Riwayat Penyakit",
      "Alamat Rumah",
      "Link KK",
      "Link KTP Orang Tua",
      "Link Foto Anak",
    ]);
    sheet.getRange(1, 1, 1, 16).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

// Menangani permintaan GET: cek status, atau ambil data untuk dashboard admin.
// Login/password dashboard sekarang dicek di sisi web (admin.js), bukan di sini,
// jadi endpoint ini akan selalu mengembalikan data pendaftar apa adanya.
function doGet(e) {
  const action = e.parameter.action;
  if (action === "list") {
    return handleList_();
  }
  return jsonResponse_({ status: "PPDB backend aktif" });
}

// Mengembalikan seluruh data pendaftar sebagai JSON.
function handleList_() {
  const sheet = getOrCreateSheet_();
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) {
    return jsonResponse_({ result: "success", data: [] });
  }

  const headers = values[0];
  const rows = values.slice(1).map((row) => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i] instanceof Date ? row[i].toLocaleString("id-ID") : row[i];
    });
    return obj;
  });

  return jsonResponse_({ result: "success", data: rows });
}
