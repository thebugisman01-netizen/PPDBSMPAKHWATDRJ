// =========================================================
// SMP Akhwat Riyadhul Jannah — PPDB Form
// Mengirim data pendaftaran + file ke Google Apps Script,
// yang kemudian menyimpan ke Google Spreadsheet & Google Drive.
// =========================================================

// SCRIPT_URL didefinisikan di config.js (dimuat sebelum file ini di index.html)

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

document.getElementById("year").textContent = new Date().getFullYear();

const form = document.getElementById("ppdbForm");
const submitBtn = document.getElementById("submitBtn");
const formMessage = document.getElementById("formMessage");

// Tampilkan nama file yang dipilih di bawah setiap input file
document.querySelectorAll('input[type="file"]').forEach((input) => {
  input.addEventListener("change", () => {
    const hint = document.querySelector(`[data-hint-for="${input.id}"]`);
    if (!hint) return;
    if (input.files.length === 0) {
      hint.textContent = "Belum ada file dipilih";
      return;
    }
    const file = input.files[0];
    const sizeKB = (file.size / 1024).toFixed(0);
    if (file.size > MAX_FILE_SIZE) {
      hint.textContent = `${file.name} — terlalu besar (${sizeKB} KB). Maksimal 5MB.`;
      hint.style.color = "#b3372c";
      input.value = "";
    } else {
      hint.textContent = `${file.name} (${sizeKB} KB)`;
      hint.style.color = "";
    }
  });
});

// Ubah file menjadi base64 agar bisa dikirim sebagai JSON
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // reader.result berbentuk "data:mime/type;base64,XXXX" — ambil bagian base64-nya saja
      const base64 = reader.result.split(",")[1];
      resolve({ name: file.name, mimeType: file.type || "application/octet-stream", data: base64 });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.classList.toggle("loading", isLoading);
}

function showMessage(text, type) {
  formMessage.textContent = text;
  formMessage.className = "form-message " + type;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (SCRIPT_URL.includes("PASTE_URL_WEB_APP")) {
    showMessage(
      "Formulir belum terhubung ke Google Spreadsheet. Tempel URL Web App Apps Script di script.js (lihat README.md).",
      "error"
    );
    return;
  }

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  setLoading(true);
  showMessage("", "");

  try {
    const fileKK = document.getElementById("fileKK").files[0];
    const fileKTP = document.getElementById("fileKTP").files[0];
    const fileFoto = document.getElementById("fileFoto").files[0];

    const [kk, ktp, foto] = await Promise.all([
      fileToBase64(fileKK),
      fileToBase64(fileKTP),
      fileToBase64(fileFoto),
    ]);

    const payload = {
      nama: form.nama.value.trim(),
      tempatLahir: form.tempatLahir.value.trim(),
      tanggalLahir: form.tanggalLahir.value,
      nisn: form.nisn.value.trim(),
      nik: form.nik.value.trim(),
      namaAyah: form.namaAyah.value.trim(),
      namaIbu: form.namaIbu.value.trim(),
      pekerjaanAyah: form.pekerjaanAyah.value.trim(),
      pekerjaanIbu: form.pekerjaanIbu.value.trim(),
      sekolahAsal: form.sekolahAsal.value.trim(),
      riwayatPenyakit: form.riwayatPenyakit.value.trim() || "Tidak ada",
      alamat: form.alamat.value.trim(),
      kk,
      ktp,
      foto,
    };

    // Apps Script Web App menerima POST sebagai "text/plain" agar terhindar
    // dari preflight CORS yang akan ditolak oleh Apps Script.
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.result === "success") {
      showMessage(
        "Pendaftaran berhasil dikirim. Terima kasih, data akan segera diverifikasi oleh panitia PPDB.",
        "success"
      );
      form.reset();
      document.querySelectorAll(".file-hint").forEach((hint) => {
        hint.textContent = "Belum ada file dipilih";
      });
    } else {
      throw new Error(result.error || "Terjadi kesalahan pada server.");
    }
  } catch (err) {
    console.error(err);
    showMessage(
      "Pendaftaran gagal dikirim. Periksa koneksi internet kamu dan coba lagi. (" + err.message + ")",
      "error"
    );
  } finally {
    setLoading(false);
  }
});
