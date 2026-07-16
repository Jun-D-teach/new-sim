const fetch = require("node-fetch");

async function sendWhatsApp(phone, message) {
  try {
    // PERBAIKAN: Gunakan \D (backslash + D) untuk menghapus semua karakter non-angka
    const cleanPhone = String(phone || "").replace(/\D/g, "");

    if (!cleanPhone) {
      return {
        success: false,
        message: "Nomor tujuan kosong",
      };
    }

    // Pastikan diawali dengan 62
    const finalPhone = cleanPhone.startsWith("62") ? cleanPhone : "62" + cleanPhone;

    const token = process.env.FONNTE_TOKEN;
    if (!token) {
      console.error("FONNTE TOKEN TIDAK DITEMUKAN DI ENVIRONMENT VARIABLES!");
      return {
        success: false,
        message: "Konfigurasi server tidak lengkap (FONNTE_TOKEN hilang)",
      };
    }

    const response = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target: finalPhone,
        message: message,
      }),
    });

    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      result = { raw: text };
    }

    console.log("FONNTE STATUS:", response.status);
    console.log("FONNTE RESULT:", result);

    const ok =
      response.ok &&
      result &&
      (result.status === true ||
        result.status === "true" ||
        result.detail === "success" ||
        result.processed !== undefined);

    return {
      success: !!ok,
      httpStatus: response.status,
      data: result,
    };
  } catch (error) {
    console.error("WA ERROR:", error);
    return {
      success: false,
      message: error.message,
    };
  }
}

module.exports = { sendWhatsApp };
