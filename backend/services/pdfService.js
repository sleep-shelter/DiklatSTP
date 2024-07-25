import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const createDiklatPDF = async (data) => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // Ukuran A4 dalam poin
    const { width, height } = page.getSize();
    const fontSize = 14;
    const lineHeight = 20;
    const margin = 85.04; // 3 cm dalam poin

    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const headerFontSize = 22;

    // Judul
    const title = "Pendaftaran Diklat STP";
    page.drawText(title, {
        x: (width - timesRomanFont.widthOfTextAtSize(title, headerFontSize)) / 2,
        y: height - margin,
        size: headerFontSize,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
    });

    // Data pendaftar
    const fields = [
        { label: "Nama", value: data.nama },
        { label: "Tempat Lahir", value: data.tempat_lahir },
        { label: "Tanggal Lahir", value: data.tanggal_lahir },
        { label: "NIK", value: data.nik },
        { label: "Usia", value: data.usia },
        { label: "Jenis Kelamin", value: data.jenis_kelamin },
        { label: "Status", value: data.status },
        { label: "Alamat Rumah", value: data.alamat_rumah },
        { label: "Asal Sekolah/Instansi", value: data.asal_sekolah_instansi },
        { label: "No WA Aktif", value: data.no_wa_aktif },
        { label: "No Telepon Orang Tua", value: data.no_telepon_orang_tua },
        { label: "Jalur Pendaftaran", value: data.jalur_pendaftaran },
        { label: "Jalur Pendaftaran Lainnya", value: data.jalur_pendaftaran_lainnya },
        { label: "Jenis Diklat", value: data.jenis_diklat },
        { label: "Tahu Diklat Dari", value: data.tau_diklat_dari },
        { label: "Tahu Diklat Dari Lainnya", value: data.tau_diklat_dari_lainnya }
    ];

    let y = height - margin - 60;

    const maxLabelWidth = Math.max(...fields.map(field => timesRomanFont.widthOfTextAtSize(field.label, fontSize)));
    const valueX = margin + maxLabelWidth + 10;

    for (const field of fields) {
        const value = field.value != null && field.value !== "" ? String(field.value) : '-';
        page.drawText(`${field.label}:`, {
            x: margin,
            y,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0)
        });
        page.drawText(value, {
            x: valueX,
            y,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0)
        });

        y -= lineHeight;
    }

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
};

export { createDiklatPDF };
