import { PDFDocument, rgb } from 'pdf-lib';

const createDiklatPDF = async (data) => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 600]);
    const { nama, tempat_lahir, tanggal_lahir, nik, usia, jenis_kelamin, status, alamat_rumah, asal_sekolah_instansi, no_wa_aktif, no_telepon_orang_tua, jalur_pendaftaran, jalur_pendaftaran_lainnya, jenis_diklat, tau_diklat_dari, tau_diklat_dari_lainnya } = data;

    const textContent = `
        Nama: ${nama}
        Tempat Lahir: ${tempat_lahir}
        Tanggal Lahir: ${tanggal_lahir}
        NIK: ${nik}
        Usia: ${usia}
        Jenis Kelamin: ${jenis_kelamin}
        Status: ${status}
        Alamat Rumah: ${alamat_rumah}
        Asal Sekolah/Instansi: ${asal_sekolah_instansi}
        No WA Aktif: ${no_wa_aktif}
        No Telepon Orang Tua: ${no_telepon_orang_tua}
        Jalur Pendaftaran: ${jalur_pendaftaran}
        Jalur Pendaftaran Lainnya: ${jalur_pendaftaran_lainnya}
        Jenis Diklat: ${jenis_diklat}
        Tahu Diklat Dari: ${tau_diklat_dari}
        Tahu Diklat Dari Lainnya: ${tau_diklat_dari_lainnya}
    `;

    page.drawText(textContent, {
        x: 50,
        y: 500,
        size: 12,
        color: rgb(0, 0, 0)
    });

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
};

export { createDiklatPDF };
