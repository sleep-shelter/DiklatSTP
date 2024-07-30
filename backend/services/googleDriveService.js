import { google } from 'googleapis';
import fs from 'fs';
import { Readable } from 'stream';

const drive = google.drive('v3');

export const uploadToGoogleDrive = async (pdfBytes, fileName) => {
    try {
        // Konfigurasi autentikasi
        const auth = new google.auth.GoogleAuth({
            keyFile: './services/diklatstp-service-account-file.json', // Pastikan file ini ada dan benar
            scopes: ['https://www.googleapis.com/auth/drive.file']
        });

        const authClient = await auth.getClient();
        google.options({ auth: authClient });

        const fileMetadata = {
            name: fileName,
            parents: ['1ajm9GVBbEjoG4A5eLR-K_67aoG4KHi4y'] // ID folder Google Drive
        };

        // Memastikan pdfBytes adalah buffer
        if (!Buffer.isBuffer(pdfBytes)) {
            throw new Error('pdfBytes harus berupa buffer.');
        }

        // Mengubah buffer menjadi stream
        const bufferStream = new Readable();
        bufferStream._read = () => {}; // Implementasi metode _read
        bufferStream.push(pdfBytes);
        bufferStream.push(null); // Menandakan akhir dari stream

        const media = {
            mimeType: 'application/pdf',
            body: bufferStream
        };

        const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id'
        });

        console.log('Upload successful, file ID:', response.data.id);
        return response.data.id;

    } catch (error) {
        console.error('Error uploading to Google Drive:', error);

        if (error.response && error.response.data) {
            console.error('Error details:', error.response.data);
        }
        
        throw error;
    }
};
